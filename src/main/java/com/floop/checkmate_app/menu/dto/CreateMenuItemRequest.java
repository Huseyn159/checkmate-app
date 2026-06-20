package com.floop.checkmate_app.menu.dto;

public record CreateMenuItemRequest(
        @jakarta.validation.constraints.NotBlank String name,
        String description,
        @jakarta.validation.constraints.NotNull java.math.BigDecimal price,
        String imageUrl,
        Integer prepTimeMinutes) {}
