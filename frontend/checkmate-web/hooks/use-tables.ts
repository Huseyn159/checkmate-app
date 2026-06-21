import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface TableDto {
    id: string; tableNumber: number; capacity: number; zone: string; features: string[];
}

export function useTables(restaurantId: string) {
    return useQuery({
        queryKey: ["tables", restaurantId],
        queryFn: async () => (await api.get<TableDto[]>(`/dashboard/restaurants/${restaurantId}/tables`)).data,
        enabled: !!restaurantId,
    });
}

export function useAddTable(restaurantId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (body: { tableNumber: number; capacity: number; zone: string; features: string[] }) =>
            (await api.post(`/dashboard/restaurants/${restaurantId}/tables`, body)).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["tables", restaurantId] }),
    });
}

export interface TableOptions { zones: string[]; features: string[]; }

export function useTableOptions(restaurantId: string) {
    return useQuery({
        queryKey: ["table-options", restaurantId],
        queryFn: async () =>
            (await api.get<TableOptions>(`/restaurants/${restaurantId}/table-options`)).data,
        enabled: !!restaurantId,
    });
}


export interface FloorTable {
    id: string; tableNumber: string; capacity: number;
    zone: string; features: string[]; available: boolean;tight: boolean;
}

export function useFloor(restaurantId: string, date: string, time: string) {
    return useQuery({
        queryKey: ["floor", restaurantId, date, time],
        queryFn: async () =>
            (await api.get<FloorTable[]>(`/restaurants/${restaurantId}/floor`, {
                params: { date, time },
            })).data,
        enabled: !!restaurantId && !!date && !!time,
    });
}

export function useDeleteTable(restaurantId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (tableId: string) => (await api.delete(`/dashboard/tables/${tableId}`)).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["tables", restaurantId] }),
    });

}