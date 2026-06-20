package com.floop.checkmate_app.search.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record DishSearchResultDto(
        UUID id, String name, String category, String priceRange,
        BigDecimal avgRating, Integer totalRatings, String coverUrl, String address,
        Double latitude, Double longitude,
        List<MatchedDishDto> matchedDishes) {}