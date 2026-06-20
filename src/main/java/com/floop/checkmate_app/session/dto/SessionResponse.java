package com.floop.checkmate_app.session.dto;

import com.floop.checkmate_app.session.domain.SessionStatus;
import java.util.List;
import java.util.UUID;

public record SessionResponse(
        UUID id,
        UUID reservationId,
        UUID restaurantId,
        UUID tableId,
        SessionStatus status,
        List<ParticipantDto> participants
) {}