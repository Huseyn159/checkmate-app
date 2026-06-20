package com.floop.checkmate_app.dashboard.dto;
import java.util.UUID;

public record OwnerReservationDto(
        UUID id,
        String customerName,
        String date,
        String time,
        Integer partySize,
        String status,
        Integer tableNumber,
        String specialNote,
        String sessionCode
) {}