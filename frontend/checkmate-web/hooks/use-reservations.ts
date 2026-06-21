import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CreateReservationRequest, ReservationResponse } from "@/lib/types";

export function useCreateReservation() {
    return useMutation({
        mutationFn: async (req: CreateReservationRequest & { confirm?: boolean }) =>
            (await api.post<ReservationResponse>("/reservations", req)).data,
    });
}

export function useMyReservations() {
    return useQuery({
        queryKey: ["my-reservations"],
        queryFn: async () =>
            (await api.get<ReservationResponse[]>("/reservations/me")).data,
    });
}

export function useCancelReservation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.post(`/reservations/${id}/cancel`, {});
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["my-reservations"] }),
    });
}