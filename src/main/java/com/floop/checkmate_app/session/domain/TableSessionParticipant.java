package com.floop.checkmate_app.session.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "table_session_participants")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TableSessionParticipant {

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @CreationTimestamp @Column(name = "joined_at", updatable = false)
    private Instant joinedAt;
}