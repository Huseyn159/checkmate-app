package com.floop.checkmate_app.payment.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ParticipantBillDto(
        UUID userId, String userName,
        List<BillLineDto> ownItems, BigDecimal ownTotal,
        List<SharedShareDto> sharedItems, BigDecimal sharedTotal,
        BigDecimal total,
        BigDecimal paidAmount,      // indiyə qədər ödənilmiş (tip xaric)
        BigDecimal outstanding,     // qalıq = total - paidAmount
        Boolean paid, BigDecimal tipAmount
) {}
