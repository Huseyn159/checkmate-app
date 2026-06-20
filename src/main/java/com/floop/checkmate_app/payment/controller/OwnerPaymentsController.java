package com.floop.checkmate_app.payment.controller;

import com.floop.checkmate_app.common.exception.ApiException;
import com.floop.checkmate_app.common.exception.ResourceNotFoundException;
import com.floop.checkmate_app.payment.dto.OwnerPaymentsResponse;
import com.floop.checkmate_app.payment.service.OwnerPaymentsService;
import com.floop.checkmate_app.restaurant.domain.Restaurant;
import com.floop.checkmate_app.restaurant.repository.RestaurantRepository;
import com.floop.checkmate_app.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/owner/restaurants/{restaurantId}")
@RequiredArgsConstructor
public class OwnerPaymentsController {

    private final OwnerPaymentsService ownerPaymentsService;
    private final RestaurantRepository restaurantRepository;
    private final UserService userService;

    @GetMapping("/payments")
    public OwnerPaymentsResponse payments(@PathVariable UUID restaurantId,
                                          @AuthenticationPrincipal UserDetails principal) {
        Restaurant r = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restoran tapılmadı"));
        UUID userId = userService.getByEmail(principal.getUsername()).getId();
        if (!r.getOwnerId().equals(userId))
            throw new ApiException("Bu restoran sənin deyil", HttpStatus.FORBIDDEN);
        return ownerPaymentsService.getPayments(restaurantId);
    }
}