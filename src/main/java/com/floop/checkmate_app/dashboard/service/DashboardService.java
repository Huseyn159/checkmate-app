package com.floop.checkmate_app.dashboard.service;

import com.floop.checkmate_app.dashboard.dto.*;
import java.util.List;
import java.util.UUID;

public interface DashboardService {
    List<OwnerRestaurantDto> getMyRestaurants(UUID ownerId);
    List<OwnerReservationDto> getReservations(UUID restaurantId, UUID ownerId);
    void confirmArrival(UUID reservationId, UUID ownerId);
}