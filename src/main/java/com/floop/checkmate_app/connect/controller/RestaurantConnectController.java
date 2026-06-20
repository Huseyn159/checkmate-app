
package com.floop.checkmate_app.connect.controller;

import com.floop.checkmate_app.common.exception.ApiException;
import com.floop.checkmate_app.common.exception.ResourceNotFoundException;
import com.floop.checkmate_app.connect.dto.ConnectStatusResponse;
import com.floop.checkmate_app.connect.service.StripeConnectService;
import com.floop.checkmate_app.restaurant.domain.Restaurant;
import com.floop.checkmate_app.restaurant.repository.RestaurantRepository;
import com.floop.checkmate_app.user.service.UserService;
import com.stripe.exception.StripeException;
import com.stripe.model.Account;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/connect/restaurants/{restaurantId}")
@RequiredArgsConstructor
public class RestaurantConnectController {

    private final RestaurantRepository restaurantRepository;
    private final UserService userService;
    private final StripeConnectService stripeConnectService;

    @PostMapping("/onboard")
    public Map<String, String> onboard(@PathVariable UUID restaurantId,
                                       @AuthenticationPrincipal UserDetails principal) {
        Restaurant r = getOwned(restaurantId, principal);
        try {
            if (r.getStripeAccountId() == null) {
                r.setStripeAccountId(stripeConnectService.createAccount());
                restaurantRepository.save(r);
            }
            return Map.of("url", stripeConnectService.createOnboardingLink(r.getStripeAccountId(), restaurantId));
        } catch (StripeException e) {
            throw new ApiException("Stripe xətası: " + e.getMessage(), HttpStatus.BAD_GATEWAY);
        }
    }

    @GetMapping("/status")
    public ConnectStatusResponse status(@PathVariable UUID restaurantId,
                                        @AuthenticationPrincipal UserDetails principal) {
        Restaurant r = getOwned(restaurantId, principal);
        if (r.getStripeAccountId() == null)
            return new ConnectStatusResponse(false, false, false, false, null);

        try {
            Account a = stripeConnectService.retrieve(r.getStripeAccountId());
            boolean charges = Boolean.TRUE.equals(a.getChargesEnabled());
            boolean payouts = Boolean.TRUE.equals(a.getPayoutsEnabled());
            boolean transfersActive = a.getCapabilities() != null
                    && "active".equals(a.getCapabilities().getTransfers());
            boolean ready = transfersActive || charges; // destination charge qəbul edə bilir

            r.setChargesEnabled(charges);
            r.setPayoutsEnabled(payouts);
            restaurantRepository.save(r);

            String continueUrl = null;
            if (!ready) {
                try {
                    continueUrl = stripeConnectService.createOnboardingLink(r.getStripeAccountId(), restaurantId);
                } catch (StripeException ignore) { /* link alınmasa da status qaytarılsın */ }
            }
            return new ConnectStatusResponse(true, charges, payouts, ready, continueUrl);
        } catch (StripeException e) {
            throw new ApiException("Stripe xətası: " + e.getMessage(), HttpStatus.BAD_GATEWAY);
        }
    }

    private Restaurant getOwned(UUID restaurantId, UserDetails principal) {
        Restaurant r = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restoran tapılmadı"));
        UUID userId = userService.getByEmail(principal.getUsername()).getId();
        if (!r.getOwnerId().equals(userId))
            throw new ApiException("Bu restoran sənin deyil", HttpStatus.FORBIDDEN);
        return r;
    }
}