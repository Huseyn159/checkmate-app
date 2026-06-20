package com.floop.checkmate_app.payment.service;

import com.floop.checkmate_app.common.exception.*;
import com.floop.checkmate_app.order.domain.*;
import com.floop.checkmate_app.order.repository.*;
import com.floop.checkmate_app.payment.domain.SessionPayment;
import com.floop.checkmate_app.payment.dto.*;
import com.floop.checkmate_app.payment.repository.SessionPaymentRepository;
import com.floop.checkmate_app.session.repository.*;
import com.floop.checkmate_app.session.domain.TableSessionParticipant;
import com.floop.checkmate_app.user.domain.UserEntity;
import com.floop.checkmate_app.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillServiceImpl implements BillService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderShareRepository orderShareRepository;
    private final TableSessionRepository sessionRepository;
    private final TableSessionParticipantRepository participantRepository;
    private final SessionPaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public BillResponse getBill(UUID sessionId) {
        sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session tapılmadı"));

        List<Order> orders = orderRepository.findBySessionId(sessionId);
        List<TableSessionParticipant> participants = participantRepository.findBySessionId(sessionId);
        Map<UUID, SessionPayment> payments = paymentRepository.findBySessionId(sessionId).stream()
                .collect(Collectors.toMap(SessionPayment::getUserId, p -> p));
        Map<UUID, UserEntity> users = userRepository.findAllById(
                        participants.stream().map(TableSessionParticipant::getUserId).toList()).stream()
                .collect(Collectors.toMap(UserEntity::getId, u -> u));

        List<ParticipantBillDto> bills = new ArrayList<>();
        BigDecimal grandTotal = BigDecimal.ZERO;

        for (TableSessionParticipant p : participants) {
            UUID uid = p.getUserId();

            // --- Öz sifarişləri (shared olmayan) ---
            List<BillLineDto> ownItems = new ArrayList<>();
            BigDecimal ownTotal = BigDecimal.ZERO;
            for (Order o : orders) {
                if (o.getUserId().equals(uid) && !o.getIsShared()) {
                    for (OrderItem it : orderItemRepository.findByOrderId(o.getId())) {
                        BigDecimal line = it.getUnitPrice()
                                .multiply(BigDecimal.valueOf(it.getQuantity()));
                        ownItems.add(new BillLineDto(it.getItemName(), it.getQuantity(), line));
                        ownTotal = ownTotal.add(line);
                    }
                }
            }

            // --- Bölüşdüyü shared sifarişlərin payı ---
            List<SharedShareDto> sharedItems = new ArrayList<>();
            BigDecimal sharedTotal = BigDecimal.ZERO;
            for (Order o : orders) {
                if (!o.getIsShared()) continue;
                List<UUID> sharers = orderShareRepository.findByOrderId(o.getId()).stream()
                        .map(s -> s.getUserId()).toList();
                if (!sharers.contains(uid) || sharers.isEmpty()) continue;

                BigDecimal share = o.getTotalAmount()
                        .divide(BigDecimal.valueOf(sharers.size()), 2, RoundingMode.HALF_UP);
                String desc = orderItemRepository.findByOrderId(o.getId()).stream()
                        .map(i -> i.getItemName() + " x" + i.getQuantity())
                        .collect(Collectors.joining(", "));
                sharedItems.add(new SharedShareDto(desc, o.getTotalAmount(), sharers.size(), share));
                sharedTotal = sharedTotal.add(share);
            }

            BigDecimal total = ownTotal.add(sharedTotal);
            SessionPayment pay = payments.get(uid);
            BigDecimal paidAmount = pay != null ? pay.getAmount() : BigDecimal.ZERO;
            BigDecimal outstanding = total.subtract(paidAmount);
            if (outstanding.compareTo(BigDecimal.ZERO) < 0) outstanding = BigDecimal.ZERO;
            boolean paid = pay != null && outstanding.compareTo(BigDecimal.ZERO) <= 0;
            BigDecimal tip = pay != null ? pay.getTipAmount() : BigDecimal.ZERO;

            bills.add(new ParticipantBillDto(uid,
                    Optional.ofNullable(users.get(uid)).map(UserEntity::getFullName).orElse("?"),
                    ownItems, ownTotal, sharedItems, sharedTotal,
                    total, paidAmount, outstanding, paid, tip));
            grandTotal = grandTotal.add(total);
        }

        int paidCount = (int) bills.stream().filter(ParticipantBillDto::paid).count();
        return new BillResponse(sessionId, bills, grandTotal, paidCount, bills.size());
    }

    @Override
    @Transactional
    public BillResponse pay(UUID sessionId, UUID userId, BigDecimal tipAmount) {
        if (!participantRepository.existsBySessionIdAndUserId(sessionId, userId))
            throw new ApiException("Bu masaya qoşulmamısan", HttpStatus.FORBIDDEN);

        BigDecimal tip = tipAmount != null ? tipAmount : BigDecimal.ZERO;

        // Cari subtotal (öz + shared pay)
        BigDecimal currentTotal = getBill(sessionId).participants().stream()
                .filter(b -> b.userId().equals(userId))
                .map(ParticipantBillDto::total)
                .findFirst().orElse(BigDecimal.ZERO);

        SessionPayment existing = paymentRepository.findBySessionIdAndUserId(sessionId, userId).orElse(null);
        BigDecimal paidSoFar = existing != null ? existing.getAmount() : BigDecimal.ZERO;
        BigDecimal outstanding = currentTotal.subtract(paidSoFar);
        if (outstanding.compareTo(BigDecimal.ZERO) <= 0)
            throw new ApiException("Ödəniləcək qalıq yoxdur", HttpStatus.BAD_REQUEST);

        // MOCK ödəniş — qalığı bağla, tip-i topla
        if (existing != null) {
            existing.setAmount(currentTotal);                          // cari-yə qədər ödənildi
            existing.setTipAmount(existing.getTipAmount().add(tip));   // tip kumulyativ
            paymentRepository.save(existing);
        } else {
            paymentRepository.save(SessionPayment.builder()
                    .sessionId(sessionId).userId(userId)
                    .amount(currentTotal).tipAmount(tip).build());
        }

        BillResponse bill = getBill(sessionId);
        messagingTemplate.convertAndSend("/topic/session/" + sessionId + "/bill", bill);
        return bill;
    }
}