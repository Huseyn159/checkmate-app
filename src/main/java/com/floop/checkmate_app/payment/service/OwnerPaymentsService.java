package com.floop.checkmate_app.payment.service;

import com.floop.checkmate_app.payment.dto.BillResponse;
import com.floop.checkmate_app.payment.dto.OwnerPaymentsResponse;
import com.floop.checkmate_app.payment.dto.ParticipantBillDto;
import com.floop.checkmate_app.session.domain.TableSession;
import com.floop.checkmate_app.session.repository.TableSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OwnerPaymentsService {

    private final TableSessionRepository sessionRepository;
    private final BillService billService;

    public OwnerPaymentsResponse getPayments(UUID restaurantId) {
        List<TableSession> sessions = sessionRepository.findByRestaurantId(restaurantId);

        List<OwnerPaymentsResponse.TableSummary> summaries = new ArrayList<>();
        Map<LocalDate, BigDecimal> dailyMap = new TreeMap<>();
        BigDecimal totalReceived = BigDecimal.ZERO;
        BigDecimal totalOutstanding = BigDecimal.ZERO;
        BigDecimal totalTips = BigDecimal.ZERO;

        for (TableSession s : sessions) {
            BillResponse bill = billService.getBill(s.getId());

            BigDecimal received = bill.participants().stream()
                    .map(ParticipantBillDto::paidAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal outstanding = bill.participants().stream()
                    .map(ParticipantBillDto::outstanding).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal tips = bill.participants().stream()
                    .map(ParticipantBillDto::tipAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

            summaries.add(new OwnerPaymentsResponse.TableSummary(
                    s.getId(), s.getTableId(), s.getStatus().name(), s.getStartedAt(),
                    bill.grandTotal(), received, outstanding,
                    bill.paidCount(), bill.totalCount()));

            totalReceived = totalReceived.add(received);
            totalOutstanding = totalOutstanding.add(outstanding);
            totalTips = totalTips.add(tips);

            LocalDate day = (s.getStartedAt() != null ? s.getStartedAt() : Instant.now())
                    .atZone(ZoneId.systemDefault()).toLocalDate();
            dailyMap.merge(day, received, BigDecimal::add);
        }

        // siyahı: ən yenisi yuxarıda
        summaries.sort((a, b) -> {
            Instant x = a.startedAt(), y = b.startedAt();
            if (x == null) return 1;
            if (y == null) return -1;
            return y.compareTo(x);
        });

        List<OwnerPaymentsResponse.DailyRevenuePoint> daily = dailyMap.entrySet().stream()
                .map(e -> new OwnerPaymentsResponse.DailyRevenuePoint(e.getKey(), e.getValue()))
                .toList();

        return new OwnerPaymentsResponse(totalReceived, totalOutstanding, totalTips, daily, summaries);
    }
}