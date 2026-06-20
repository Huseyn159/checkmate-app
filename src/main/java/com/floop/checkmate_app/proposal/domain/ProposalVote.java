package com.floop.checkmate_app.proposal.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name = "proposal_votes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProposalVote {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "proposal_id", nullable = false)
    private UUID proposalId;
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    @Column(nullable = false)
    private Boolean approve;
    @CreationTimestamp @Column(name = "voted_at", updatable = false)
    private Instant votedAt;
}