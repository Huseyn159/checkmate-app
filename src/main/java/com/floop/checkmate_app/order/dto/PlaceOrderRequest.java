package com.floop.checkmate_app.order.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record PlaceOrderRequest(
        @NotEmpty List<OrderItemRequest> items,
        boolean shared
) {}
