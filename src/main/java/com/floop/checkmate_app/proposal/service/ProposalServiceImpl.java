package com.floop.checkmate_app.proposal.service;

import com.floop.checkmate_app.common.exception.*;
import com.floop.checkmate_app.menu.domain.MenuItem;
import com.floop.checkmate_app.menu.repository.MenuItemRepository;
import com.floop.checkmate_app.order.dto.*;
import com.floop.checkmate_app.order.service.OrderService;
import com.floop.checkmate_app.proposal.domain.*;
import com.floop.checkmate_app.proposal.dto.*;
import com.floop.checkmate_app.proposal.repository.*;
import com.floop.checkmate_app.session.domain.*;
import com.floop.checkmate_app.session.repository.*;
import com.floop.checkmate_app.user.domain.UserEntity;
import com.floop.checkmate_app.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProposalServiceImpl implements ProposalService {

    private final OrderProposalRepository proposalRepository;
    private final ProposalItemRepository proposalItemRepository;
    private final ProposalVoteRepository voteRepository;
    private final MenuItemRepository menuItemRepository;
    private final TableSessionRepository sessionRepository;
    private final TableSessionParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final OrderService orderService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public ProposalResponse create(UUID sessionId, UUID proposerId, CreateProposalRequest req) {
        TableSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session tapılmadı"));
        if (session.getStatus() != SessionStatus.ACTIVE)
            throw new ApiException("Masa aktiv deyil", HttpStatus.BAD_REQUEST);
        if (!participantRepository.existsBySessionIdAndUserId(sessionId, proposerId))
            throw new ApiException("Bu masaya qoşulmamısan", HttpStatus.FORBIDDEN);

        OrderProposal proposal = proposalRepository.save(OrderProposal.builder()
                .sessionId(sessionId).proposerId(proposerId)
                .status(ProposalStatus.OPEN).build());

        for (OrderItemRequest ir : req.items()) {
            MenuItem mi = menuItemRepository.findById(ir.menuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Yemək tapılmadı"));
            proposalItemRepository.save(ProposalItem.builder()
                    .proposalId(proposal.getId()).menuItemId(mi.getId())
                    .itemName(mi.getName()).quantity(ir.quantity()).unitPrice(mi.getPrice())
                    .build());
        }

        // Təklif edən avtomatik "bəli"
        voteRepository.save(ProposalVote.builder()
                .proposalId(proposal.getId()).userId(proposerId).approve(true).build());

        return broadcast(proposal);
    }

    @Override
    @Transactional
    public ProposalResponse vote(UUID proposalId, UUID userId, boolean approve) {
        OrderProposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Təklif tapılmadı"));
        if (proposal.getStatus() != ProposalStatus.OPEN)
            throw new ApiException("Səsvermə bağlıdır", HttpStatus.BAD_REQUEST);
        if (!participantRepository.existsBySessionIdAndUserId(proposal.getSessionId(), userId))
            throw new ApiException("Bu masaya qoşulmamısan", HttpStatus.FORBIDDEN);

        ProposalVote vote = voteRepository.findByProposalIdAndUserId(proposalId, userId)
                .orElse(ProposalVote.builder().proposalId(proposalId).userId(userId).build());
        vote.setApprove(approve);
        voteRepository.save(vote);

        return broadcast(proposal);
    }

    @Override
    @Transactional
    public ProposalResponse finalize(UUID proposalId, UUID userId) {
        OrderProposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Təklif tapılmadı"));
        if (!proposal.getProposerId().equals(userId))
            throw new ApiException("Yalnız təklif edən yekunlaşdıra bilər", HttpStatus.FORBIDDEN);
        if (proposal.getStatus() != ProposalStatus.OPEN)
            throw new ApiException("Təklif artıq yekunlaşıb", HttpStatus.BAD_REQUEST);

        // "Bəli" deyənlər
        Set<UUID> yesVoters = voteRepository.findByProposalId(proposalId).stream()
                .filter(ProposalVote::getApprove)
                .map(ProposalVote::getUserId)
                .collect(Collectors.toSet());

        // Ən azı bir "bəli" varsa shared sifariş yarat (yalnız onlar bölüşür)
        if (!yesVoters.isEmpty()) {
            List<SharedOrderLine> lines = proposalItemRepository.findByProposalId(proposalId).stream()
                    .map(pi -> new SharedOrderLine(
                            pi.getMenuItemId(), pi.getItemName(), pi.getQuantity(), pi.getUnitPrice()))
                    .toList();
            orderService.createSharedOrder(
                    proposal.getSessionId(), proposal.getProposerId(), lines, yesVoters);
        }

        proposal.setStatus(ProposalStatus.FINALIZED);
        proposal.setFinalizedAt(Instant.now());
        proposalRepository.save(proposal);

        return broadcast(proposal);
    }

    /** Cavabı qurub masa topic-inə canlı yayımlayır. */
    private ProposalResponse broadcast(OrderProposal proposal) {
        ProposalResponse resp = buildResponse(proposal);
        messagingTemplate.convertAndSend(
                "/topic/session/" + proposal.getSessionId() + "/proposals", resp);
        return resp;
    }

    private ProposalResponse buildResponse(OrderProposal proposal) {
        List<ProposalItem> items = proposalItemRepository.findByProposalId(proposal.getId());
        BigDecimal total = items.stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<ProposalVote> votes = voteRepository.findByProposalId(proposal.getId());
        Map<UUID, UserEntity> users = userRepository.findAllById(
                        votes.stream().map(ProposalVote::getUserId).toList()).stream()
                .collect(Collectors.toMap(UserEntity::getId, u -> u));

        List<ProposalVoteDto> voteDtos = votes.stream()
                .map(v -> new ProposalVoteDto(v.getUserId(),
                        Optional.ofNullable(users.get(v.getUserId())).map(UserEntity::getFullName).orElse("?"),
                        v.getApprove()))
                .toList();

        int yes = (int) votes.stream().filter(ProposalVote::getApprove).count();
        int no = votes.size() - yes;

        String proposerName = userRepository.findById(proposal.getProposerId())
                .map(UserEntity::getFullName).orElse("?");

        List<ProposalItemDto> itemDtos = items.stream()
                .map(i -> new ProposalItemDto(i.getItemName(), i.getQuantity(), i.getUnitPrice()))
                .toList();

        return new ProposalResponse(proposal.getId(), proposal.getProposerId(), proposerName,
                proposal.getStatus(), itemDtos, total, voteDtos, yes, no);
    }

    @Override
    public List<ProposalResponse> getSessionProposals(UUID sessionId) {
        return proposalRepository.findBySessionId(sessionId).stream()
                .map(this::buildResponse)
                .toList();
    }
}