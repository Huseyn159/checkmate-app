package com.floop.checkmate_app.review.dto;
import java.time.Instant;
import java.util.UUID;
public record ReviewResponse(UUID id, String userName, int rating, String comment, Instant createdAt) {}