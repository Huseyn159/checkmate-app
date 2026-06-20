package com.floop.checkmate_app.proposal.repository;

import com.floop.checkmate_app.proposal.domain.ProposalVote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface ProposalVoteRepository extends JpaRepository<ProposalVote, UUID> {
    List<ProposalVote> findByProposalId(UUID proposalId);
    Optional<ProposalVote> findByProposalIdAndUserId(UUID proposalId, UUID userId);
}