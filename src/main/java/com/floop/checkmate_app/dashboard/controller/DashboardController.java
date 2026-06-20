package com.floop.checkmate_app.dashboard.controller;

import com.floop.checkmate_app.dashboard.dto.*;
import com.floop.checkmate_app.dashboard.service.DashboardService;
import com.floop.checkmate_app.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserService userService;

    @GetMapping("/restaurants")
    public List<OwnerRestaurantDto> myRestaurants(@AuthenticationPrincipal UserDetails p) {
        return dashboardService.getMyRestaurants(uid(p));
    }

    @GetMapping("/restaurants/{restaurantId}/reservations")
    public List<OwnerReservationDto> reservations(
            @AuthenticationPrincipal UserDetails p, @PathVariable UUID restaurantId) {
        return dashboardService.getReservations(restaurantId, uid(p));
    }

    @PostMapping("/reservations/{reservationId}/arrive")
    public void arrive(@AuthenticationPrincipal UserDetails p, @PathVariable UUID reservationId) {
        dashboardService.confirmArrival(reservationId, uid(p));
    }

    private UUID uid(UserDetails p) {
        return userService.getByEmail(p.getUsername()).getId();
    }
}