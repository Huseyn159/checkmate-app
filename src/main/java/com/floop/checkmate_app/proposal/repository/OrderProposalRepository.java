package com.floop.checkmate_app.proposal.repository;

import com.floop.checkmate_app.proposal.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface OrderProposalRepository extends JpaRepository<OrderProposal, UUID> {
    List<OrderProposal> findBySessionId(UUID sessionId);
}