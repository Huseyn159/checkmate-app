package com.floop.checkmate_app.session.repository;

import com.floop.checkmate_app.session.domain.TableSessionParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface TableSessionParticipantRepository
        extends JpaRepository<TableSessionParticipant, UUID> {
    List<TableSessionParticipant> findBySessionId(UUID sessionId);
    boolean existsBySessionIdAndUserId(UUID sessionId, UUID userId);
}