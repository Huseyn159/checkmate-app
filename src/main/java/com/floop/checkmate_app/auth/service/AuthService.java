package com.floop.checkmate_app.auth.service;

import com.floop.checkmate_app.auth.dto.*;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refresh(RefreshRequest request);
    AuthResponse googleLogin(GoogleLoginRequest req);
}