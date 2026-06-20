package com.floop.checkmate_app.restaurant.controller;

import com.floop.checkmate_app.common.dto.PageResponse;
import com.floop.checkmate_app.restaurant.domain.PriceRange;
import com.floop.checkmate_app.restaurant.dto.*;
import com.floop.checkmate_app.restaurant.service.RestaurantService;
import com.floop.checkmate_app.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;
    private final UserService userService;

    @GetMapping
    public PageResponse<RestaurantSummaryDto> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) PriceRange priceRange,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        var filter = new RestaurantFilter(category, priceRange, search, minRating);
        var pageable = PageRequest.of(page, size, Sort.by("avgRating").descending());
        return restaurantService.search(filter, pageable);
    }

    @GetMapping("/{id}")
    public RestaurantDetailDto getOne(@PathVariable UUID id) {
        return restaurantService.getById(id);
    }

    @PostMapping
    public ResponseEntity<RestaurantDetailDto> create(
            @org.springframework.security.core.annotation.AuthenticationPrincipal
            org.springframework.security.core.userdetails.UserDetails principal,
            @jakarta.validation.Valid @RequestBody CreateRestaurantRequest request) {
        UUID ownerId = userService.getByEmail(principal.getUsername()).getId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(restaurantService.create(ownerId, request));
    }
}