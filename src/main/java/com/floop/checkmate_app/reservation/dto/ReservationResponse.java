package com.floop.checkmate_app.reservation.dto;

import com.floop.checkmate_app.reservation.domain.ReservationStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record ReservationResponse(
        UUID id,
        UUID restaurantId,
        String tableNumber,
        String zone,
        LocalDate date,
        LocalTime time,
        Integer partySize,
        ReservationStatus status,
        BigDecimal depositAmount,
        String sessionCode,
        String qrCode
) {}