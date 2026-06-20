package com.floop.checkmate_app.proposal.dto;

import com.floop.checkmate_app.proposal.domain.ProposalStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProposalResponse(
        UUID id,
        UUID proposerId,
        String proposerName,
        ProposalStatus status,
        List<ProposalItemDto> items,
        BigDecimal totalAmount,
        List<ProposalVoteDto> votes,
        int yesCount,
        int noCount
) {}
