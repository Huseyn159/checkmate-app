package com.floop.checkmate_app.payment.controller;

import com.floop.checkmate_app.payment.dto.*;
import com.floop.checkmate_app.payment.service.BillService;
import com.floop.checkmate_app.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/table-sessions/{sessionId}")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;
    private final UserService userService;

    @GetMapping("/bill")
    public BillResponse getBill(@PathVariable UUID sessionId) {
        return billService.getBill(sessionId);
    }

    @PostMapping("/pay")
    public BillResponse pay(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID sessionId,
            @RequestBody PayRequest request) {
        UUID userId = userService.getByEmail(principal.getUsername()).getId();
        return billService.pay(sessionId, userId, request.tipAmount());
    }
}