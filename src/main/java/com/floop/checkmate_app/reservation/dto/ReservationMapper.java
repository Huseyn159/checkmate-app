package com.floop.checkmate_app.reservation.dto;

import com.floop.checkmate_app.reservation.domain.Reservation;
import com.floop.checkmate_app.table_entity.domain.RestaurantTable;
import org.springframework.stereotype.Component;

@Component
public class ReservationMapper {

    // İki mənbədən (rezerv + masa) birləşdirir, ona görə manual
    public ReservationResponse toResponse(Reservation r, RestaurantTable t) {
        return new ReservationResponse(
                r.getId(), r.getRestaurantId(),
                t.getTableNumber(), t.getZone().name(),
                r.getReservationDate(), r.getReservationTime(), r.getPartySize(),
                r.getStatus(), r.getDepositAmount(), r.getSessionCode(), r.getQrCode());
    }
}