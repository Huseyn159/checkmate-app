package com.floop.checkmate_app.reservation.dto;

import com.floop.checkmate_app.table_entity.domain.TableZone;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record CreateReservationRequest(
        @NotNull UUID restaurantId,
        @NotNull @FutureOrPresent LocalDate date,
        @NotNull LocalTime time,
        @NotNull @Min(1) @Max(20) Integer partySize,
        TableZone zone,            // opsional preference
        List<String> features,     // opsional preference
        String specialNote,
        Boolean confirm
) {}