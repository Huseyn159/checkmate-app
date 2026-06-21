import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface AdminRestaurant {
    id: string; name: string; description: string; category: string;
    priceRange: string; address: string; phone: string;
    coverUrl: string; voen: string; status: string; ownerName: string;
}

export function usePendingRestaurants() {
    return useQuery({
        queryKey: ["admin-pending"],
        queryFn: async () => (await api.get<AdminRestaurant[]>("/admin/restaurants/pending")).data,
        retry: false,   // admin deyilsə (403) təkrar cəhd etmə
    });
}

export function useApproveRestaurant() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => (await api.post(`/admin/restaurants/${id}/approve`)).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-pending"] }),
    });
}

export function useRejectRestaurant() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, reason }: { id: string; reason: string }) =>
            (await api.post(`/admin/restaurants/${id}/reject`, { reason })).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-pending"] }),
    });
}