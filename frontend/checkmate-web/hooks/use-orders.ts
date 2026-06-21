import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface OrderItemResponse { itemName: string; quantity: number; unitPrice: number; }

export interface OrderResponse {
    id: string; userId: string; userName: string; isShared: boolean;
    status: string; totalAmount: number; items: OrderItemResponse[];
    tableNumber?: number;
}
export function useSessionOrders(sessionId: string) {
    return useQuery({
        queryKey: ["session-orders", sessionId],
        queryFn: async () =>
            (await api.get<OrderResponse[]>(`/table-sessions/${sessionId}/orders`)).data,
        enabled: !!sessionId,
    });
}

export function usePlaceOrder(sessionId: string) {
    return useMutation({
        mutationFn: async (body: { items: { menuItemId: string; quantity: number }[]; shared: boolean }) =>
            (await api.post<OrderResponse>(`/table-sessions/${sessionId}/orders`, body)).data,
    });
}