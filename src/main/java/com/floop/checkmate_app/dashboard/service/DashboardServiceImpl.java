package com.floop.checkmate_app.dashboard.service;

import com.floop.checkmate_app.common.exception.*;
import com.floop.checkmate_app.dashboard.dto.*;
import com.floop.checkmate_app.reservation.domain.*;
import com.floop.checkmate_app.reservation.repository.ReservationRepository;
import com.floop.checkmate_app.restaurant.domain.Restaurant;
import com.floop.checkmate_app.restaurant.repository.RestaurantRepository;
import com.floop.checkmate_app.table_entity.repository.RestaurantTableRepository;
import com.floop.checkmate_app.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final RestaurantRepository restaurantRepository;
    private final ReservationRepository reservationRepository;
    private final RestaurantTableRepository tableRepository;
    private final UserRepository userRepository;

    @Override
    public List<OwnerRestaurantDto> getMyRestaurants(UUID ownerId) {
        return restaurantRepository.findByOwnerId(ownerId).stream()
                .map(r -> new OwnerRestaurantDto(r.getId(), r.getName(), r.getStatus().name()))
                .toList();
    }

    @Override
    public List<OwnerReservationDto> getReservations(UUID restaurantId, UUID ownerId) {
        verifyOwner(restaurantId, ownerId);
        var reservations = reservationRepository
                .findByRestaurantIdOrderByReservationDateAscReservationTimeAsc(restaurantId);

        // müştəri adları (N+1 olmadan)
        Map<UUID, String> names = userRepository.findAllById(
                        reservations.stream().map(Reservation::getUserId).toList()).stream()
                .collect(Collectors.toMap(u -> u.getId(), u -> u.getFullName()));

        return reservations.stream().map(r -> {
            Integer tableNo = r.getTableId() == null ? null :
                    Integer.valueOf(tableRepository.findById(r.getTableId())
                            .map(t -> t.getTableNumber()).orElse(null));
            return new OwnerReservationDto(
                    r.getId(),
                    names.getOrDefault(r.getUserId(), "?"),
                    r.getReservationDate().toString(),
                    r.getReservationTime().toString(),
                    r.getPartySize(),
                    r.getStatus().name(),
                    tableNo,
                    r.getSpecialNote(),
                    r.getSessionCode());
        }).toList();
    }

    @Override
    @Transactional
    public void confirmArrival(UUID reservationId, UUID ownerId) {
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Rezervasiya tapılmadı"));
        verifyOwner(r.getRestaurantId(), ownerId);
        r.setStatus(ReservationStatus.ARRIVED);
        reservationRepository.save(r);
    }

    private void verifyOwner(UUID restaurantId, UUID ownerId) {
        Restaurant rest = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restoran tapılmadı"));
        if (!ownerId.equals(rest.getOwnerId()))
            throw new ApiException("Bu restoran sənə aid deyil", HttpStatus.FORBIDDEN);
    }
}