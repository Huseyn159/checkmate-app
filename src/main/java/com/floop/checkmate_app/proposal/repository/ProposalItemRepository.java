package com.floop.checkmate_app.proposal.repository;

import com.floop.checkmate_app.proposal.domain.ProposalItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface ProposalItemRepository extends JpaRepository<ProposalItem, UUID> {
    List<ProposalItem> findByProposalId(UUID proposalId);
}