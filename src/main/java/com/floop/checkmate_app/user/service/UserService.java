package com.floop.checkmate_app.user.service;


import com.floop.checkmate_app.user.domain.UserEntity;

public interface UserService {
    UserEntity getByEmail(String email);
    UserEntity getById(java.util.UUID id);
}