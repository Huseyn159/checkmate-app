package com.floop.checkmate_app.proposal.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity @Table(name = "proposal_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProposalItem {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "proposal_id", nullable = false)
    private UUID proposalId;
    @Column(name = "menu_item_id", nullable = false)
    private UUID menuItemId;
    @Column(name = "item_name", nullable = false)
    private String itemName;
    @Column(nullable = false)
    private Integer quantity;
    @Column(name = "unit_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal unitPrice;
}