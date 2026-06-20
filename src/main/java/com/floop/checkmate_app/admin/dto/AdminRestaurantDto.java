package com.floop.checkmate_app.admin.dto;

import java.util.UUID;

public record AdminRestaurantDto(
        UUID id, String name, String description, String category,
        String priceRange, String address, String phone,
        String coverUrl, String voen, String status, String ownerName
) {}

