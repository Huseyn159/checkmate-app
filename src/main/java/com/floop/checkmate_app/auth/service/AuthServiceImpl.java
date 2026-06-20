package com.floop.checkmate_app.auth.service;

import com.floop.checkmate_app.auth.dto.*;
import com.floop.checkmate_app.common.exception.ApiException;
import com.floop.checkmate_app.common.security.JwtService;
import com.floop.checkmate_app.user.domain.*;
import com.floop.checkmate_app.user.dto.UserDto;
import com.floop.checkmate_app.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    @org.springframework.beans.factory.annotation.Value("${app.google.client-id:}")
    private String googleClientId;
    private final org.springframework.web.client.RestClient googleHttp =
            org.springframework.web.client.RestClient.create();


    @Override
    public AuthResponse googleLogin(GoogleLoginRequest req) {
        com.floop.checkmate_app.auth.dto.GoogleTokenInfo info;
        try {
            info = googleHttp.get()
                    .uri("https://oauth2.googleapis.com/tokeninfo?id_token={t}", req.idToken())
                    .retrieve().body(com.floop.checkmate_app.auth.dto.GoogleTokenInfo.class);
        } catch (Exception e) {
            throw new ApiException("Google token doğrulanmadı", HttpStatus.UNAUTHORIZED);
        }
        if (info == null || info.email() == null)
            throw new ApiException("Google token etibarsızdır", HttpStatus.UNAUTHORIZED);
        if (googleClientId != null && !googleClientId.isBlank() && !googleClientId.equals(info.aud()))
            throw new ApiException("Google client uyğun deyil", HttpStatus.UNAUTHORIZED);

        UserEntity user = userRepository.findByEmail(info.email()).orElseGet(() ->
                userRepository.save(UserEntity.builder()
                        .email(info.email())
                        .fullName(info.name() != null ? info.name() : info.email())
                        .avatarUrl(info.picture())
                        .role(Role.CUSTOMER)
                        .trustScore(50)
                        .build()));   // passwordHash null — Google istifadəçisi
        return buildResponse(user);
    }



    @Override
    @Transactional
    public AuthResponse register(RegisterRequest r) {
        if (userRepository.existsByEmail(r.email())) {
            throw new ApiException("Bu email artıq qeydiyyatdan keçib", HttpStatus.CONFLICT);
        }
        UserEntity user = UserEntity.builder()
                .email(r.email())
                .passwordHash(passwordEncoder.encode(r.password()))
                .fullName(r.fullName())
                .phone(r.phone())
                .role(Role.CUSTOMER)
                .trustScore(50)
                .build();
        userRepository.save(user);
        return buildResponse(user);
    }

    @Override
    public AuthResponse login(LoginRequest r) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(r.email(), r.password()));
        UserEntity user = userRepository.findByEmail(r.email())
                .orElseThrow(() -> new ApiException("İstifadəçi tapılmadı", HttpStatus.NOT_FOUND));
        return buildResponse(user);
    }

    @Override
    public AuthResponse refresh(RefreshRequest r) {
        if (!jwtService.isValid(r.refreshToken())) {
            throw new ApiException("Refresh token etibarsızdır", HttpStatus.UNAUTHORIZED);
        }
        UserEntity user = userRepository.findByEmail(jwtService.extractEmail(r.refreshToken()))
                .orElseThrow(() -> new ApiException("İstifadəçi tapılmadı", HttpStatus.NOT_FOUND));
        return buildResponse(user);
    }

    private AuthResponse buildResponse(UserEntity user) {
        return new AuthResponse(
                jwtService.generateAccessToken(user),
                jwtService.generateRefreshToken(user),
                UserDto.from(user));
    }
}