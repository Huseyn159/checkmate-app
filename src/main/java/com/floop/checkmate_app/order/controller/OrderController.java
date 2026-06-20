package com.floop.checkmate_app.order.controller;

import com.floop.checkmate_app.order.dto.*;
import com.floop.checkmate_app.order.service.OrderService;
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
@RequestMapping("/api/v1/table-sessions/{sessionId}/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<OrderResponse> place(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID sessionId,
            @Valid @RequestBody PlaceOrderRequest request) {
        UUID userId = userService.getByEmail(principal.getUsername()).getId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.placeOrder(sessionId, userId, request));
    }

    @GetMapping
    public List<OrderResponse> list(@PathVariable UUID sessionId) {
        return orderService.getSessionOrders(sessionId);
    }
}