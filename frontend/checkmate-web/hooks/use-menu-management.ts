import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// QEYD: aşağıdakı invalidate açarı useMenu-nun açarı ilə eyni olmalıdır.
// use-restaurants.ts-də useMenu queryKey ["menu", restaurantId]-dirsə, belə qalsın.
const menuKey = (id: string) => ["menu", id];

export function useAddCategory(restaurantId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (body: { name: string; displayOrder?: number }) =>
            (await api.post(`/dashboard/restaurants/${restaurantId}/categories`, body)).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: menuKey(restaurantId) }),
    });
}

export function useAddItem(restaurantId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ categoryId, ...body }: {
            categoryId: string; name: string; description?: string;
            price: number; imageUrl?: string; prepTimeMinutes?: number;
        }) => (await api.post(`/dashboard/categories/${categoryId}/items`, body)).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: menuKey(restaurantId) }),
    });
}

export function useDeleteItem(restaurantId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (itemId: string) => (await api.delete(`/dashboard/menu-items/${itemId}`)).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: menuKey(restaurantId) }),
    });
}

export function useDeleteCategory(restaurantId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (categoryId: string) => (await api.delete(`/dashboard/categories/${categoryId}`)).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: menuKey(restaurantId) }),
    });
}

export function useSubmitForReview(restaurantId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async () => (await api.post(`/dashboard/restaurants/${restaurantId}/submit`)).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["my-restaurants"] }),
    });
}