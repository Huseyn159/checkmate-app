package com.floop.checkmate_app.proposal.service;

import com.floop.checkmate_app.proposal.dto.*;
import java.util.UUID;

public interface ProposalService {
    ProposalResponse create(UUID sessionId, UUID proposerId, CreateProposalRequest request);
    ProposalResponse vote(UUID proposalId, UUID userId, boolean approve);
    ProposalResponse finalize(UUID proposalId, UUID userId);
    java.util.List<com.floop.checkmate_app.proposal.dto.ProposalResponse> getSessionProposals(java.util.UUID sessionId);
}