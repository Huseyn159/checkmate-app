package com.floop.checkmate_app.restaurant.dto;

import com.floop.checkmate_app.restaurant.domain.PriceRange;
import jakarta.validation.constraints.*;



public record CreateRestaurantRequest(
        @NotBlank String name,
        String description,
        @NotBlank String category,
        @NotNull PriceRange priceRange,
        @NotBlank String address,
        @NotNull Double lat,
        @NotNull Double lng,
        @NotBlank String phone,
        @NotBlank @Pattern(regexp = "\\d{10}", message = "VÖEN 10 rəqəm olmalıdır") String voen,
        @NotBlank(message = "Foto məcburidir") String coverUrl
) {}