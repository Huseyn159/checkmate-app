package com.floop.checkmate_app.session.controller;

import com.floop.checkmate_app.session.dto.*;
import com.floop.checkmate_app.session.service.TableSessionService;
import com.floop.checkmate_app.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
import com.floop.checkmate_app.common.exception.ApiException;
import com.floop.checkmate_app.reservation.domain.ReservationStatus;
import org.springframework.http.HttpStatus;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/v1/table-sessions")
@RequiredArgsConstructor
public class TableSessionController {

    private final TableSessionService sessionService;
    private final UserService userService;

    @PostMapping("/join")
    public SessionResponse join(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody JoinSessionRequest request) {
        UUID userId = userService.getByEmail(principal.getUsername()).getId();
        return sessionService.join(request.code(), userId);
    }

    @GetMapping("/{id}")
    public SessionResponse getSession(@PathVariable UUID id) {
        return sessionService.getById(id);
    }
}