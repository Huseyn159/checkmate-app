package com.floop.checkmate_app.auth.dto;


import jakarta.validation.constraints.*;

public record RegisterRequest(
        @NotBlank(message = "Email daxil et") @Email(message = "Düzgün email daxil et") String email,
        @NotBlank(message = "Parol daxil et") @Size(min = 6, message = "Parol ən azı 6 simvol olmalıdır") String password,
        @NotBlank(message = "Ad daxil et") String fullName,
        String phone
) {}