package com.floop.checkmate_app.common.security;

import com.floop.checkmate_app.user.domain.UserEntity;

public interface JwtService {
    String generateAccessToken(UserEntity user);
    String generateRefreshToken(UserEntity user);
    String extractEmail(String token);
    boolean isValid(String token);
}