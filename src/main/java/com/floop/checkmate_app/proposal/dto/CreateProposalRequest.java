package com.floop.checkmate_app.proposal.dto;

import com.floop.checkmate_app.order.dto.OrderItemRequest;   // təkrar istifadə
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record CreateProposalRequest(@NotEmpty List<OrderItemRequest> items) {}

