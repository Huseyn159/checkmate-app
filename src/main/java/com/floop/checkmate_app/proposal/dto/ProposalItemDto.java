package com.floop.checkmate_app.proposal.dto;

import com.floop.checkmate_app.proposal.domain.ProposalStatus;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProposalItemDto(String itemName, Integer quantity, BigDecimal unitPrice) {}

