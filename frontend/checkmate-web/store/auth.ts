import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/lib/types";

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    user: User | null;
    setAuth: (data: { accessToken: string; refreshToken: string; user: User }) => void;
    logout: () => void;
}

export const useAuth = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            user: null,
            setAuth: ({ accessToken, refreshToken, user }) =>
                set({ accessToken, refreshToken, user }),
            logout: () => set({ accessToken: null, refreshToken: null, user: null }),
        }),
        { name: "checkmate-auth" } // localStorage açarı
    )
);