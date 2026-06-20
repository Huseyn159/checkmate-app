package com.floop.checkmate_app.order.dto;

import jakarta.validation.constraints.*;
import java.util.List;
import java.util.UUID;

public record OrderItemRequest(
        @NotNull UUID menuItemId,
        @NotNull @Min(1) Integer quantity
) {}

