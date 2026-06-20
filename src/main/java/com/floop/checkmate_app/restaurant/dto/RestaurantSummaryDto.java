package com.floop.checkmate_app.restaurant.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record RestaurantSummaryDto(
        UUID id, String name, String category, String priceRange,
        String coverUrl, String address,
        BigDecimal avgRating, Integer totalRatings
) {}