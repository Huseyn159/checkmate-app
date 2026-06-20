package com.floop.checkmate_app.restaurant.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record RestaurantDetailDto(
        UUID id, String name, String description, String category, String priceRange,
        String address, Double latitude, Double longitude, String phone,
        String coverUrl, String status,
        BigDecimal avgRating, Integer totalRatings
) {}