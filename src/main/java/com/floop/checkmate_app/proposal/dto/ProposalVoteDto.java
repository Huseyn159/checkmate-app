package com.floop.checkmate_app.proposal.dto;

import java.util.UUID;

public record ProposalVoteDto(UUID userId, String userName, Boolean approve) {}
