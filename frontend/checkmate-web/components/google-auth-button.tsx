"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { roleHome } from "@/lib/auth-nav";
import { AuthResponse } from "@/lib/types";

declare global { interface Window { google?: any } }
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export function GoogleAuthButton() {
    const ref = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const setAuth = useAuth((s) => s.setAuth);

    useEffect(() => {
        if (!CLIENT_ID) return;
        const handle = async (resp: any) => {
            try {
                const res = await api.post<AuthResponse>("/auth/google", { idToken: resp.credential });
                setAuth(res.data);
                toast.success("Xoş gəldin!");
                const redirect = new URLSearchParams(window.location.search).get("redirect");
                router.replace(redirect || roleHome(res.data.user.role));
            } catch (e: any) {
                toast.error(e.response?.data?.message ?? "Google ilə giriş alınmadı");
            }
        };
        const init = () => {
            if (!window.google || !ref.current) return;
            window.google.accounts.id.initialize({ client_id: CLIENT_ID, callback: handle });
            window.google.accounts.id.renderButton(ref.current, {
                theme: "outline", size: "large", width: 320, text: "continue_with", shape: "pill",
            });
        };
        if (window.google) { init(); return; }
        const s = document.createElement("script");
        s.src = "https://accounts.google.com/gsi/client";
        s.async = true; s.defer = true; s.onload = init;
        document.head.appendChild(s);
    }, [router, setAuth]);

    if (!CLIENT_ID) return null;
    return <div ref={ref} className="flex justify-center" />;
}