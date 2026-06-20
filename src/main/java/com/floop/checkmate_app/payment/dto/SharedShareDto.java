package com.floop.checkmate_app.payment.dto;

import java.math.BigDecimal;

public record SharedShareDto(String description, BigDecimal orderTotal,
                             Integer sharers, BigDecimal yourShare) {}
