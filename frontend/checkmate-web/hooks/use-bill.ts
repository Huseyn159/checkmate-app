import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface BillLineDto { name: string; quantity: number; amount: number; }
export interface SharedShareDto { description: string; orderTotal: number; sharers: number; yourShare: number; }
export interface ParticipantBillDto {
    userId: string; userName: string;
    ownItems: BillLineDto[]; ownTotal: number;
    sharedItems: SharedShareDto[]; sharedTotal: number;
    total: number;
    paidAmount: number;
    outstanding: number;
    paid: boolean;
    tipAmount: number;
}
export interface BillResponse {
    sessionId: string;
    participants: ParticipantBillDto[];
    grandTotal: number;
    paidCount: number;
    totalCount: number;
}

export function useBill(sessionId: string) {
    return useQuery({
        queryKey: ["bill", sessionId],
        queryFn: async () => (await api.get<BillResponse>(`/table-sessions/${sessionId}/bill`)).data,
        enabled: !!sessionId,
    });
}

export function useCheckout(sessionId: string) {
    return useMutation({
        mutationFn: async (tipAmount: number) =>
            (await api.post<{ url: string }>(`/table-sessions/${sessionId}/checkout`, { tipAmount })).data,
    });
}

export function useConfirmCheckout(sessionId: string) {
    return useMutation({
        mutationFn: async (checkoutId: string) =>
            (await api.post<BillResponse>(`/table-sessions/${sessionId}/checkout/confirm`, { checkoutId })).data,
    });
}

export function usePay(sessionId: string) {
    return useMutation({
        mutationFn: async (tipAmount: number) =>
            (await api.post<BillResponse>(`/table-sessions/${sessionId}/pay`, { tipAmount })).data,
    });


}