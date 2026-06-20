package com.floop.checkmate_app.review.controller;

import com.floop.checkmate_app.review.dto.*;
import com.floop.checkmate_app.review.service.ReviewService;
import com.floop.checkmate_app.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/restaurants/{restaurantId}/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;

    @GetMapping
    public ReviewSummaryResponse list(@PathVariable UUID restaurantId) {
        return reviewService.getSummary(restaurantId);
    }

    @GetMapping("/me")
    public MyReviewResponse mine(@AuthenticationPrincipal UserDetails principal,
                                 @PathVariable UUID restaurantId) {
        if (principal == null) return new MyReviewResponse(false, null);
        return reviewService.getMine(restaurantId, uid(principal));
    }

    @PostMapping
    public ReviewResponse submit(@AuthenticationPrincipal UserDetails principal,
                                 @PathVariable UUID restaurantId,
                                 @Valid @RequestBody ReviewRequest request) {
        var u = userService.getByEmail(principal.getUsername());
        return reviewService.submit(restaurantId, u.getId(), u.getFullName(), request);
    }

    private UUID uid(UserDetails principal) {
        return userService.getByEmail(principal.getUsername()).getId();
    }
}