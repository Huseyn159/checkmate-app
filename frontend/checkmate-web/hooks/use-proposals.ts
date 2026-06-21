import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface ProposalItemDto { itemName: string; quantity: number; unitPrice: number; }
export interface ProposalVoteDto { userId: string; userName: string; approve: boolean; }
export interface ProposalResponse {
    id: string;
    proposerId: string;
    proposerName: string;
    status: string;
    items: ProposalItemDto[];
    totalAmount: number;
    votes: ProposalVoteDto[];
    yesCount: number;
    noCount: number;
}

export function useSessionProposals(sessionId: string) {
    return useQuery({
        queryKey: ["session-proposals", sessionId],
        queryFn: async () =>
            (await api.get<ProposalResponse[]>(`/table-sessions/${sessionId}/proposals`)).data,
        enabled: !!sessionId,
    });
}

export function useCreateProposal(sessionId: string) {
    return useMutation({
        mutationFn: async (items: { menuItemId: string; quantity: number }[]) =>
            (await api.post<ProposalResponse>(`/table-sessions/${sessionId}/proposals`, { items })).data,
    });
}

export function useVote() {
    return useMutation({
        mutationFn: async ({ proposalId, approve }: { proposalId: string; approve: boolean }) =>
            (await api.post<ProposalResponse>(`/proposals/${proposalId}/vote`, { approve })).data,
    });
}

export function useFinalizeProposal() {
    return useMutation({
        mutationFn: async (proposalId: string) =>
            (await api.post<ProposalResponse>(`/proposals/${proposalId}/finalize`, {})).data,
    });
}