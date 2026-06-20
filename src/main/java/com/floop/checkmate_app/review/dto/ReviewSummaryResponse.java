package com.floop.checkmate_app.review.dto;
import java.math.BigDecimal;
import java.util.List;
public record ReviewSummaryResponse(BigDecimal avgRating, int totalRatings, List<ReviewResponse> reviews) {}