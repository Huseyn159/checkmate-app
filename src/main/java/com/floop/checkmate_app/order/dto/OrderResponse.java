package com.floop.checkmate_app.order.dto;

import com.floop.checkmate_app.order.domain.OrderStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id, UUID userId, String userName, Boolean isShared,
        OrderStatus status, BigDecimal totalAmount, List<OrderItemResponse> items,
        Integer tableNumber
) {}
