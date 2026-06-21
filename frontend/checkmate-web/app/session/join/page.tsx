"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ScanLine, QrCode, ArrowRight, Loader2 } from "lucide-react";
import { useJoinSession } from "@/hooks/use-session";
import { useAuth } from "@/store/auth";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import { Button } from "@/components/ui/button";

function CodeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const inputs = useRef<Array<HTMLInputElement | null>>([]);
    const chars = Array.from({ length: 6 }, (_, i) => value[i] ?? "");
    const focus = (i: number) => inputs.current[Math.max(0, Math.min(5, i))]?.focus();
    const setChars = (arr: string[]) => onChange(arr.join("").replace(/\D/g, "").slice(0, 6));

    const handleChange = (i: number, raw: string) => {
        const d = raw.replace(/\D/g, "");
        if (!d) return;
        const arr = chars.slice();
        let idx = i;
        for (const ch of d) { if (idx > 5) break; arr[idx] = ch; idx++; }
        setChars(arr);
        focus(idx);
    };
    const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            e.preventDefault();
            const arr = chars.slice();
            if (arr[i]) { arr[i] = ""; setChars(arr); }
            else if (i > 0) { arr[i - 1] = ""; setChars(arr); focus(i - 1); }
        } else if (e.key === "ArrowLeft") focus(i - 1);
        else if (e.key === "ArrowRight") focus(i + 1);
    };
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const d = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (d) { onChange(d); focus(d.length); }
    };

    return (
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2" onPaste={handlePaste}>
            {chars.map((c, i) => (
                <input
                    key={i}
                    ref={(el) => (inputs.current[i] = el)}
                    value={c}
                    inputMode="numeric"
                    maxLength={1}
                    autoFocus={i === 0}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    aria-label={`Rəqəm ${i + 1}`}
                    className="aspect-square w-full min-w-0 rounded-xl border-2 border-border bg-card text-center text-xl font-bold text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 sm:text-2xl"
                />
            ))}
        </div>
    );
}
export default function JoinSessionPage() {
    const router = useRouter();
    const hydrated = useAuthHydrated();
    const token = useAuth((s) => s.accessToken);
    const [code, setCode] = useState("");
    const [autoJoining, setAutoJoining] = useState(false);
    const joinSession = useJoinSession();
    const triedAuto = useRef(false);

    // ?code= oxu
    useEffect(() => {
        const c = new URLSearchParams(window.location.search).get("code");
        if (c) setCode(c.replace(/\D/g, "").slice(0, 6));
    }, []);

    // login qapısı — kodu redirect-də saxla
    useEffect(() => {
        if (!hydrated || token) return;
        const c = new URLSearchParams(window.location.search).get("code") ?? "";
        const target = c ? `/session/join?code=${c}` : "/session/join";
        router.replace(`/login?redirect=${encodeURIComponent(target)}`);
    }, [hydrated, token, router]);

    const doJoin = useCallback(async (value: string) => {
        if (value.length !== 6) { toast.error("6 rəqəmli kod daxil et"); return; }
        try {
            const session = await joinSession.mutateAsync(value);
            router.push(`/session/${session.id}`);
        } catch (err: any) {
            setAutoJoining(false);
            toast.error(err.response?.data?.message ?? "Qoşulma alınmadı");
        }
    }, [joinSession, router]);

    // QR-dan avto qoşulma
    useEffect(() => {
        if (!hydrated || !token || triedAuto.current) return;
        const c = (new URLSearchParams(window.location.search).get("code") ?? "")
            .replace(/\D/g, "").slice(0, 6);
        if (c.length === 6) {
            triedAuto.current = true;
            setAutoJoining(true);
            doJoin(c);
        }
    }, [hydrated, token, doJoin]);

    if (!hydrated || !token) {
        return (
            <div className="grid min-h-[100svh] place-items-center text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
            </div>
        );
    }

    if (autoJoining) {
        return (
            <div className="grid min-h-[100svh] place-items-center px-4">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="size-10 animate-spin text-primary" />
                    <p className="font-display text-lg font-semibold">Masaya qoşulursan…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative grid min-h-[100svh] place-items-center overflow-hidden px-4">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute left-1/2 top-0 size-[420px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
                <div className="absolute bottom-0 right-0 size-[320px] rounded-full bg-accent blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-sm rounded-3xl border border-border bg-card/90 p-8 text-center shadow-xl shadow-black/5 backdrop-blur"
            >
                <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                    className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-[#F59E0B] text-primary-foreground shadow-lg shadow-primary/25"
                >
                    <ScanLine className="size-8" />
                </motion.div>

                <h1 className="font-display text-2xl font-bold tracking-tight">Masaya qoşul</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                    Masadakı QR-ın 6 rəqəmli kodunu daxil et
                </p>

                <div className="mt-7">
                    <CodeInput value={code} onChange={setCode} />
                </div>

                <Button
                    onClick={() => doJoin(code)}
                    disabled={joinSession.isPending || code.length !== 6}
                    size="lg"
                    className="mt-7 h-12 w-full rounded-xl text-base font-semibold"
                >
                    {joinSession.isPending ? "Qoşulur…" : "Qoşul"}
                    {!joinSession.isPending && <ArrowRight className="size-4" />}
                </Button>

                <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <QrCode className="size-3.5" />
                    QR-ı telefonla oxudunsa avtomatik qoşulursan
                </p>
            </motion.div>
        </div>
    );
}