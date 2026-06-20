package com.floop.checkmate_app.session.service;

import com.floop.checkmate_app.session.dto.SessionResponse;
import java.util.UUID;

public interface TableSessionService {
    SessionResponse join(String code, UUID userId);
    SessionResponse getById(UUID sessionId);
}