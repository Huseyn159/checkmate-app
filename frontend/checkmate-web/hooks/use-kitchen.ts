import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { OrderResponse } from "@/hooks/use-orders";

export function useKitchenOrders(restaurantId: string) {
    return useQuery({
        queryKey: ["kitchen", restaurantId],
        queryFn: async () => (await api.get<OrderResponse[]>(`/dashboard/restaurants/${restaurantId}/kitchen`)).data,
        enabled: !!restaurantId,
    });
}

export function useUpdateOrderStatus() {
    return useMutation({
        mutationFn: async ({ orderId, status }: { orderId: string; status: string }) =>
            (await api.post(`/dashboard/orders/${orderId}/status`, { status })).data,
    });
}