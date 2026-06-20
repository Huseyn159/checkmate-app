package com.floop.checkmate_app.order.dto;

import com.floop.checkmate_app.order.domain.OrderStatus;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record OrderItemResponse(String itemName, Integer quantity, BigDecimal unitPrice) {}

