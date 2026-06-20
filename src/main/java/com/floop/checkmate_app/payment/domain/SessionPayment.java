package com.floop.checkmate_app.payment.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name = "session_payments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SessionPayment {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "session_id", nullable = false)
    private UUID sessionId;
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    @Column(name = "tip_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal tipAmount;
    @CreationTimestamp @Column(name = "paid_at", updatable = false)
    private Instant paidAt;
}