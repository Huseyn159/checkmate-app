package com.floop.checkmate_app.restaurant.dto;

import com.floop.checkmate_app.restaurant.domain.PriceRange;
import java.math.BigDecimal;

public record RestaurantFilter(
        String category,
        PriceRange priceRange,
        String search,
        BigDecimal minRating
) {}