package com.floop.checkmate_app.search.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record MatchedDishDto(UUID id, String name, BigDecimal price, String imageUrl) {}