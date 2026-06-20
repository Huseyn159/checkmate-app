package com.floop.checkmate_app.proposal.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name = "order_proposals")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderProposal {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "session_id", nullable = false)
    private UUID sessionId;
    @Column(name = "proposer_id", nullable = false)
    private UUID proposerId;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private ProposalStatus status;
    @CreationTimestamp @Column(name = "created_at", updatable = false)
    private Instant createdAt;
    @Column(name = "finalized_at")
    private Instant finalizedAt;
}