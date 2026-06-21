import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface TableSummary {
    sessionId: string; tableId: string; status: string; startedAt: string;
    total: number; received: number; outstanding: number; paidCount: number; totalCount: number;
}
export interface DailyRevenuePoint { date: string; received: number; }
export interface OwnerPayments {
    totalReceived: number; totalOutstanding: number; totalTips: number;
    daily: DailyRevenuePoint[]; sessions: TableSummary[];
}

export function useCloseSession() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (sessionId: string) => {
            await api.post(`/table-sessions/${sessionId}/close`, {});
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["owner-payments"] }),
    });
}

export function useOwnerPayments(restaurantId: string) {
    return useQuery({
        queryKey: ["owner-payments", restaurantId],
        queryFn: async () =>
            (await api.get<OwnerPayments>(`/owner/restaurants/${restaurantId}/payments`)).data,
        enabled: !!restaurantId,
        refetchInterval: 15000, // canlı kimi yenilənsin
    });

}