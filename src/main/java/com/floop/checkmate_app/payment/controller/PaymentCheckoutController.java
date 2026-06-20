package com.floop.checkmate_app.payment.controller;

import com.floop.checkmate_app.payment.dto.BillResponse;
import com.floop.checkmate_app.payment.dto.ConfirmRequest;
import com.floop.checkmate_app.payment.dto.PayRequest;
import com.floop.checkmate_app.payment.service.StripeCheckoutService;
import com.floop.checkmate_app.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/table-sessions/{sessionId}/checkout")
@RequiredArgsConstructor
public class PaymentCheckoutController {

    private final StripeCheckoutService stripeCheckoutService;
    private final UserService userService;

    @PostMapping
    public Map<String, String> create(@AuthenticationPrincipal UserDetails principal,
                                      @PathVariable UUID sessionId,
                                      @RequestBody PayRequest request) {
        UUID userId = userService.getByEmail(principal.getUsername()).getId();
        return Map.of("url", stripeCheckoutService.createCheckout(sessionId, userId, request.tipAmount()));
    }

    @PostMapping("/confirm")
    public BillResponse confirm(@AuthenticationPrincipal UserDetails principal,
                                @PathVariable UUID sessionId,
                                @RequestBody ConfirmRequest request) {
        UUID userId = userService.getByEmail(principal.getUsername()).getId();
        return stripeCheckoutService.confirm(sessionId, userId, request.checkoutId());
    }
}