package com.floop.checkmate_app.order.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record SharedOrderLine(UUID menuItemId, String itemName, int quantity, BigDecimal unitPrice) {}