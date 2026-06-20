package com.floop.checkmate_app.auth.dto;

import com.floop.checkmate_app.user.dto.UserDto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        UserDto user
) {}