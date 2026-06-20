package com.floop.checkmate_app.session.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "table_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TableSession {

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "reservation_id", nullable = false)
    private UUID reservationId;

    @Column(name = "restaurant_id", nullable = false)
    private UUID restaurantId;

    @Column(name = "table_id", nullable = false)
    private UUID tableId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status;

    @CreationTimestamp @Column(name = "started_at", updatable = false)
    private Instant startedAt;

    @Column(name = "closed_at")
    private Instant closedAt;
}