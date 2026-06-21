import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SessionResponse } from "@/lib/types";

export function useJoinSession() {
    return useMutation({
        mutationFn: async (code: string) =>
            (await api.post<SessionResponse>("/table-sessions/join", { code })).data,
    });
}

export function useSession(id: string) {
    return useQuery({
        queryKey: ["session", id],
        queryFn: async () =>
            (await api.get<SessionResponse>(`/table-sessions/${id}`)).data,
        enabled: !!id,
    });
}