package com.floop.checkmate_app.auth.dto;

import jakarta.validation.constraints.*;

public record LoginRequest(
        @NotBlank(message = "Email daxil et") @Email(message = "Düzgün email daxil et") String email,
        @NotBlank(message = "Parol daxil et") String password
) {}
