package com.floop.checkmate_app.user.dto;


import com.floop.checkmate_app.user.domain.UserEntity;
import java.util.UUID;

public record UserDto(
        UUID id,
        String email,
        String fullName,
        String phone,
        String avatarUrl,
        String role,
        Integer trustScore
) {
    public static UserDto from(UserEntity u) {
        return new UserDto(u.getId(), u.getEmail(), u.getFullName(),
                u.getPhone(), u.getAvatarUrl(), u.getRole().name(), u.getTrustScore());
    }
}