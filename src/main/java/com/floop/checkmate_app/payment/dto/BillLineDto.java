package com.floop.checkmate_app.payment.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record BillLineDto(String name, Integer quantity, BigDecimal amount) {}

