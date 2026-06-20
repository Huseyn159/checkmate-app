package com.floop.checkmate_app.order.service;

import com.floop.checkmate_app.order.dto.*;
import java.util.List;
import java.util.UUID;

public interface OrderService {
    OrderResponse placeOrder(UUID sessionId, UUID userId, PlaceOrderRequest request);
    List<OrderResponse> getSessionOrders(UUID sessionId);
    OrderResponse createSharedOrder(
            java.util.UUID sessionId,
            java.util.UUID createdByUserId,
            java.util.List<SharedOrderLine> lines,
            java.util.Set<java.util.UUID> sharerIds);
    OrderResponse updateStatus(java.util.UUID orderId, java.util.UUID requesterId,
                               com.floop.checkmate_app.order.domain.OrderStatus status);
    List<OrderResponse> getKitchenOrders(java.util.UUID restaurantId, java.util.UUID requesterId);
}