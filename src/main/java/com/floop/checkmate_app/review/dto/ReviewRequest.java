package com.floop.checkmate_app.review.dto;
import jakarta.validation.constraints.*;
public record ReviewRequest(@Min(1) @Max(5) int rating, @Size(max = 500) String comment) {}