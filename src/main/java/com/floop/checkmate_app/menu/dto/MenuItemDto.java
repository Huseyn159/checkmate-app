package com.floop.checkmate_app.menu.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record MenuItemDto(
        UUID id, String name, String description, BigDecimal price,
        String imageUrl, Boolean isAvailable, BigDecimal avgRating, Integer prepTimeMinutes
) {}