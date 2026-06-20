package com.floop.checkmate_app.session.service;

import com.floop.checkmate_app.common.exception.ApiException;
import com.floop.checkmate_app.common.exception.ResourceNotFoundException;
import com.floop.checkmate_app.reservation.domain.Reservation;
import com.floop.checkmate_app.reservation.domain.ReservationStatus;
import com.floop.checkmate_app.reservation.repository.ReservationRepository;
import com.floop.checkmate_app.session.domain.*;
import com.floop.checkmate_app.session.dto.*;
import com.floop.checkmate_app.session.repository.*;
import com.floop.checkmate_app.user.domain.UserEntity;
import com.floop.checkmate_app.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TableSessionServiceImpl implements TableSessionService {

    private final ReservationRepository reservationRepository;
    private final TableSessionRepository sessionRepository;
    private final TableSessionParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;   // WebSocket yayımı üçün

    private static final ZoneId APP_ZONE = ZoneId.of("Asia/Baku");

    @Override
    @Transactional
    public SessionResponse join(String code, UUID userId) {
        Reservation reservation = reservationRepository.findBySessionCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Bu kodla rezerv tapılmadı"));

        ReservationStatus st = reservation.getStatus();
        // Bitmiş / ləğv / gəlmədi → qoşulmaq olmaz
        if (st == ReservationStatus.CANCELLED
                || st == ReservationStatus.NO_SHOW
                || st == ReservationStatus.COMPLETED) {
            throw new ApiException("Bu rezerv artıq aktiv deyil", HttpStatus.BAD_REQUEST);
        }
        // Yalnız restoran gəlişi təsdiqləyəndən sonra (ARRIVED)
        if (st != ReservationStatus.ARRIVED) {
            throw new ApiException(
                    "Restoran hələ gəlişini təsdiqləməyib — masaya çatanda \"Gəldi\" qeyd olunacaq, sonra qoşula bilərsən",
                    HttpStatus.BAD_REQUEST);
        }

        // Session yoxdursa yarat (lazy), varsa götür
        TableSession session = sessionRepository.findByReservationId(reservation.getId())
                .orElseGet(() -> sessionRepository.save(TableSession.builder()
                        .reservationId(reservation.getId())
                        .restaurantId(reservation.getRestaurantId())
                        .tableId(reservation.getTableId())
                        .status(SessionStatus.ACTIVE)
                        .build()));

        if (!participantRepository.existsBySessionIdAndUserId(session.getId(), userId)) {
            participantRepository.save(TableSessionParticipant.builder()
                    .sessionId(session.getId())
                    .userId(userId)
                    .build());
        }

        SessionResponse response = buildResponse(session);
        messagingTemplate.convertAndSend("/topic/session/" + session.getId(), response);
        return response;
    }

    @Override
    public SessionResponse getById(UUID sessionId) {
        TableSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session tapılmadı"));
        return buildResponse(session);
    }

    private SessionResponse buildResponse(TableSession session) {
        List<TableSessionParticipant> parts =
                participantRepository.findBySessionId(session.getId());

        List<UUID> userIds = parts.stream()
                .map(TableSessionParticipant::getUserId).toList();
        Map<UUID, UserEntity> users = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(UserEntity::getId, u -> u));

        List<ParticipantDto> participantDtos = parts.stream()
                .map(p -> {
                    UserEntity u = users.get(p.getUserId());
                    return new ParticipantDto(p.getUserId(), u != null ? u.getFullName() : "?");
                })
                .toList();

        return new SessionResponse(session.getId(), session.getReservationId(),
                session.getRestaurantId(), session.getTableId(),
                session.getStatus(), participantDtos);
    }
}