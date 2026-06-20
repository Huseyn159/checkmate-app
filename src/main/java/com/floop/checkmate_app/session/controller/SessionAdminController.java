package com.floop.checkmate_app.session.controller;

import com.floop.checkmate_app.common.exception.ApiException;
import com.floop.checkmate_app.common.exception.ResourceNotFoundException;
import com.floop.checkmate_app.reservation.domain.ReservationStatus;
import com.floop.checkmate_app.reservation.repository.ReservationRepository;
import com.floop.checkmate_app.restaurant.domain.Restaurant;
import com.floop.checkmate_app.restaurant.repository.RestaurantRepository;
import com.floop.checkmate_app.session.domain.SessionStatus;
import com.floop.checkmate_app.session.domain.TableSession;
import com.floop.checkmate_app.session.dto.SessionResponse;
import com.floop.checkmate_app.session.repository.TableSessionRepository;
import com.floop.checkmate_app.session.service.TableSessionService;
import com.floop.checkmate_app.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/table-sessions/{sessionId}")
@RequiredArgsConstructor
public class SessionAdminController {

    private final TableSessionRepository sessionRepository;
    private final RestaurantRepository restaurantRepository;
    private final ReservationRepository reservationRepository;
    private final UserService userService;
    private final TableSessionService sessionService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/close")
    @Transactional
    public void close(@PathVariable UUID sessionId,
                      @AuthenticationPrincipal UserDetails principal) {
        TableSession s = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session tapılmadı"));
        Restaurant r = restaurantRepository.findById(s.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restoran tapılmadı"));
        UUID userId = userService.getByEmail(principal.getUsername()).getId();
        if (!r.getOwnerId().equals(userId))
            throw new ApiException("İcazə yoxdur", HttpStatus.FORBIDDEN);

        s.setStatus(SessionStatus.CLOSED);
        s.setClosedAt(Instant.now());
        sessionRepository.save(s);

        // Rezervi də tamamla → "Rezervlərim"də "masadasınız" yox olsun
        reservationRepository.findById(s.getReservationId()).ifPresent(res -> {
            res.setStatus(ReservationStatus.COMPLETED);
            reservationRepository.save(res);
        });

        SessionResponse resp = sessionService.getById(sessionId);
        messagingTemplate.convertAndSend("/topic/session/" + sessionId, resp);
    }
}