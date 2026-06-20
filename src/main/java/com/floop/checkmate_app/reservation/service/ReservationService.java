package com.floop.checkmate_app.reservation.service;

import com.floop.checkmate_app.reservation.dto.*;
import java.util.List;
import java.util.UUID;

public interface ReservationService {
    ReservationResponse create(UUID userId, CreateReservationRequest request);
    void cancel(UUID userId, UUID reservationId);
    List<ReservationResponse> getUserReservations(UUID userId);
}