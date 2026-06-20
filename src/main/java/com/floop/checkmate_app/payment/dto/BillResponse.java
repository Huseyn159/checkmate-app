package com.floop.checkmate_app.payment.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record BillResponse(
        UUID sessionId,
        List<ParticipantBillDto> participants,
        BigDecimal grandTotal,
        Integer paidCount,
        Integer totalCount
) {}
