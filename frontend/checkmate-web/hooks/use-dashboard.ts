import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface OwnerRestaurant { id: string; name: string; status: string; }
export interface OwnerReservation {
    id: string; customerName: string; date: string; time: string;
    partySize: number; status: string; tableNumber: number | null;
    specialNote: string | null; sessionCode: string;
}

export function useMyRestaurants() {
    return useQuery({
        queryKey: ["my-restaurants"],
        queryFn: async () => (await api.get<OwnerRestaurant[]>("/dashboard/restaurants")).data,
    });
}

export function useReservations(restaurantId: string) {
    return useQuery({
        queryKey: ["dashboard-reservations", restaurantId],
        queryFn: async () =>
            (await api.get<OwnerReservation[]>(`/dashboard/restaurants/${restaurantId}/reservations`)).data,
        enabled: !!restaurantId,
    });
}

export function useConfirmArrival(restaurantId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (reservationId: string) =>
            (await api.post(`/dashboard/reservations/${reservationId}/arrive`)).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard-reservations", restaurantId] }),
    });
}

export function useCreateRestaurant() {
    return useMutation({
        mutationFn: async (body: {
            name: string; description: string; category: string;
            priceRange: string; address: string; phone: string;
            voen: string; coverUrl: string; lat: number; lng: number;
        }) => (await api.post("/restaurants", body)).data,
    });

}