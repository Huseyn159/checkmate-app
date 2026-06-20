package com.floop.checkmate_app.payment.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record OwnerPaymentsResponse(
        BigDecimal totalReceived,
        BigDecimal totalOutstanding,
        BigDecimal totalTips,
        List<DailyRevenuePoint> daily,
        List<TableSummary> sessions
) {
    public record DailyRevenuePoint(LocalDate date, BigDecimal received) {}

    public record TableSummary(
            UUID sessionId,
            UUID tableId,
            String status,
            Instant startedAt,
            BigDecimal total,
            BigDecimal received,
            BigDecimal outstanding,
            int paidCount,
            int totalCount
    ) {}
}