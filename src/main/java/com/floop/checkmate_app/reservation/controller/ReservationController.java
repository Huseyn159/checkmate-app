package com.floop.checkmate_app.reservation.controller;

import com.floop.checkmate_app.reservation.dto.*;
import com.floop.checkmate_app.reservation.service.ReservationService;
import com.floop.checkmate_app.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ReservationResponse> create(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody CreateReservationRequest request) {
        UUID userId = currentUserId(principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reservationService.create(userId, request));
    }

    @GetMapping("/me")
    public List<ReservationResponse> myReservations(
            @AuthenticationPrincipal UserDetails principal) {
        return reservationService.getUserReservations(currentUserId(principal));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID id) {
        reservationService.cancel(currentUserId(principal), id);
        return ResponseEntity.noContent().build();
    }

    private UUID currentUserId(UserDetails principal) {
        // principal.getUsername() = email (JWT-də subject)
        return userService.getByEmail(principal.getUsername()).getId();
    }
}