package com.floop.checkmate_app.proposal.controller;

import com.floop.checkmate_app.proposal.dto.*;
import com.floop.checkmate_app.proposal.service.ProposalService;
import com.floop.checkmate_app.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ProposalController {

    private final ProposalService proposalService;
    private final UserService userService;

    @PostMapping("/api/v1/table-sessions/{sessionId}/proposals")
    public ResponseEntity<ProposalResponse> create(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID sessionId,
            @Valid @RequestBody CreateProposalRequest request) {
        UUID userId = uid(principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(proposalService.create(sessionId, userId, request));
    }

    @PostMapping("/api/v1/proposals/{proposalId}/vote")
    public ProposalResponse vote(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID proposalId,
            @RequestBody VoteRequest request) {
        return proposalService.vote(proposalId, uid(principal), request.approve());
    }

    @PostMapping("/api/v1/proposals/{proposalId}/finalize")
    public ProposalResponse finalize(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID proposalId) {
        return proposalService.finalize(proposalId, uid(principal));
    }

    @GetMapping("/api/v1/table-sessions/{sessionId}/proposals")
    public java.util.List<ProposalResponse> list(@PathVariable UUID sessionId) {
        return proposalService.getSessionProposals(sessionId);
    }

    private UUID uid(UserDetails principal) {
        return userService.getByEmail(principal.getUsername()).getId();
    }
}