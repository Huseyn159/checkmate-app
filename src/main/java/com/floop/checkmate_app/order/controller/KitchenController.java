package com.floop.checkmate_app.order.controller;

import com.floop.checkmate_app.order.dto.OrderResponse;
import com.floop.checkmate_app.order.service.OrderService;
import com.floop.checkmate_app.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class KitchenController {

    private final OrderService orderService;
    private final UserService userService;

    public record StatusRequest(String status) {}


    @GetMapping("/restaurants/{restaurantId}/kitchen")
    public java.util.List<com.floop.checkmate_app.order.dto.OrderResponse> kitchen(
            @AuthenticationPrincipal UserDetails p, @PathVariable UUID restaurantId) {
        UUID uid = userService.getByEmail(p.getUsername()).getId();
        return orderService.getKitchenOrders(restaurantId, uid);
    }

    @PostMapping("/orders/{orderId}/status")
    public OrderResponse updateStatus(@AuthenticationPrincipal UserDetails p,
                                      @PathVariable UUID orderId, @RequestBody StatusRequest req) {
        UUID uid = userService.getByEmail(p.getUsername()).getId();
        return orderService.updateStatus(orderId, uid,
                com.floop.checkmate_app.order.domain.OrderStatus.valueOf(req.status()));
    }

}
