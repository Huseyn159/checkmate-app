package com.floop.checkmate_app.payment.service;

import com.floop.checkmate_app.payment.dto.BillResponse;
import java.math.BigDecimal;
import java.util.UUID;

public interface BillService {
    BillResponse getBill(UUID sessionId);
    BillResponse pay(UUID sessionId, UUID userId, BigDecimal tipAmount);
}