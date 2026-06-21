import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface ConnectStatus {
    connected: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    ready: boolean;
    onboardingUrl: string | null;
}

export function useConnectStatus(restaurantId: string) {
    return useQuery({
        queryKey: ["connect-status", restaurantId],
        queryFn: async () =>
            (await api.get<ConnectStatus>(`/connect/restaurants/${restaurantId}/status`)).data,
        enabled: !!restaurantId,
    });
}

export function useStartOnboarding(restaurantId: string) {
    return useMutation({
        mutationFn: async () =>
            (await api.post<{ url: string }>(`/connect/restaurants/${restaurantId}/onboard`, {})).data,
    });
}