package com.floop.checkmate_app.order.service;

import com.floop.checkmate_app.common.exception.*;
import com.floop.checkmate_app.menu.domain.MenuItem;
import com.floop.checkmate_app.menu.repository.MenuItemRepository;
import com.floop.checkmate_app.order.domain.*;
import com.floop.checkmate_app.order.dto.*;
import com.floop.checkmate_app.order.repository.*;
import com.floop.checkmate_app.restaurant.repository.RestaurantRepository;
import com.floop.checkmate_app.session.domain.*;
import com.floop.checkmate_app.session.repository.*;
import com.floop.checkmate_app.table_entity.repository.RestaurantTableRepository;
import com.floop.checkmate_app.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final TableSessionRepository sessionRepository;
    private final TableSessionParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final OrderShareRepository orderShareRepository;
    private final RestaurantRepository restaurantRepository;
    private final RestaurantTableRepository tableRepository;


    @Override
    @Transactional
    public OrderResponse placeOrder(UUID sessionId, UUID userId, PlaceOrderRequest req) {
        TableSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session tapılmadı"));
        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new ApiException("Masa aktiv deyil", HttpStatus.BAD_REQUEST);
        }
        if (!participantRepository.existsBySessionIdAndUserId(sessionId, userId)) {
            throw new ApiException("Bu masaya qoşulmamısan", HttpStatus.FORBIDDEN);
        }

        // 1. Order yarat (total sonra hesablanır)
        Order order = orderRepository.save(Order.builder()
                .sessionId(sessionId).userId(userId)
                .isShared(req.shared())
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .build());

        // 2. Hər item — qiymət/ad snapshot, line hesabla
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItemRequest ir : req.items()) {
            MenuItem mi = menuItemRepository.findById(ir.menuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Yemək tapılmadı"));
            BigDecimal line = mi.getPrice().multiply(BigDecimal.valueOf(ir.quantity()));
            total = total.add(line);
            orderItemRepository.save(OrderItem.builder()
                    .orderId(order.getId())
                    .menuItemId(mi.getId())
                    .itemName(mi.getName())          // snapshot
                    .quantity(ir.quantity())
                    .unitPrice(mi.getPrice())        // snapshot
                    .build());
        }
        order.setTotalAmount(total);
        orderRepository.save(order);

        OrderResponse response = buildResponse(order);

        // 3. Canlı yayım: masaya (hər kəs sifarişi görsün) + mətbəxə (KDS)
        messagingTemplate.convertAndSend("/topic/session/" + sessionId + "/orders", response);
        messagingTemplate.convertAndSend("/topic/kitchen/" + session.getRestaurantId(), response);

        return response;
    }

    @Override
    public List<OrderResponse> getSessionOrders(UUID sessionId) {
        return orderRepository.findBySessionId(sessionId).stream()
                .map(this::buildResponse)
                .toList();
    }

    private OrderResponse buildResponse(Order order) {
        List<OrderItemResponse> items = orderItemRepository.findByOrderId(order.getId()).stream()
                .map(i -> new OrderItemResponse(i.getItemName(), i.getQuantity(), i.getUnitPrice()))
                .toList();
        String userName = userRepository.findById(order.getUserId())
                .map(u -> u.getFullName()).orElse("?");
        Integer tableNumber = Integer.valueOf(sessionRepository.findById(order.getSessionId())
                .flatMap(s -> tableRepository.findById(s.getTableId()))
                .map(t -> t.getTableNumber()).orElse(null));
        return new OrderResponse(order.getId(), order.getUserId(), userName,
                order.getIsShared(), order.getStatus(), order.getTotalAmount(), items, tableNumber);
    }


    @Override
    @Transactional
    public OrderResponse createSharedOrder(UUID sessionId, UUID createdBy,
                                           List<SharedOrderLine> lines, Set<UUID> sharerIds) {
        TableSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session tapılmadı"));

        Order order = orderRepository.save(Order.builder()
                .sessionId(sessionId).userId(createdBy).isShared(true)
                .status(OrderStatus.PENDING).totalAmount(BigDecimal.ZERO).build());

        BigDecimal total = BigDecimal.ZERO;
        for (SharedOrderLine l : lines) {
            total = total.add(l.unitPrice().multiply(BigDecimal.valueOf(l.quantity())));
            orderItemRepository.save(OrderItem.builder()
                    .orderId(order.getId()).menuItemId(l.menuItemId())
                    .itemName(l.itemName()).quantity(l.quantity()).unitPrice(l.unitPrice())
                    .build());
        }
        order.setTotalAmount(total);
        orderRepository.save(order);

        // "bəli" deyənləri bölüşən kimi qeyd et
        for (UUID uid : sharerIds) {
            orderShareRepository.save(OrderShare.builder()
                    .orderId(order.getId()).userId(uid).build());
        }

        OrderResponse response = buildResponse(order);
        messagingTemplate.convertAndSend("/topic/session/" + sessionId + "/orders", response);
        messagingTemplate.convertAndSend("/topic/kitchen/" + session.getRestaurantId(), response);
        return response;
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(UUID orderId, UUID requesterId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sifariş tapılmadı"));
        TableSession session = sessionRepository.findById(order.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Session tapılmadı"));
        var rest = restaurantRepository.findById(session.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restoran tapılmadı"));
        if (!requesterId.equals(rest.getOwnerId()))
            throw new ApiException("İcazə yoxdur", HttpStatus.FORBIDDEN);

        order.setStatus(status);
        orderRepository.save(order);

        OrderResponse resp = buildResponse(order);
        // Hər üç yerə yayım: müştəri + zal (session topic), mətbəx (kitchen topic)
        messagingTemplate.convertAndSend("/topic/session/" + order.getSessionId() + "/orders", resp);
        messagingTemplate.convertAndSend("/topic/kitchen/" + session.getRestaurantId(), resp);
        return resp;
    }

    @Override
    public List<OrderResponse> getKitchenOrders(UUID restaurantId, UUID requesterId) {
        var rest = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restoran tapılmadı"));
        if (!requesterId.equals(rest.getOwnerId()))
            throw new ApiException("İcazə yoxdur", HttpStatus.FORBIDDEN);

        List<UUID> sessionIds = sessionRepository.findByRestaurantId(restaurantId).stream()
                .map(s -> s.getId()).toList();
        if (sessionIds.isEmpty()) return List.of();

        var active = java.util.EnumSet.of(OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY);
        return orderRepository.findBySessionIdIn(sessionIds).stream()
                .filter(o -> active.contains(o.getStatus()))
                .map(this::buildResponse)
                .toList();
    }
}