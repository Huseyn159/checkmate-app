"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
    CreditCard, Check, Loader2, AlertCircle, ArrowRight, Wallet, Clock, Heart,
    RefreshCw, X,
} from "lucide-react";
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { useAuth } from "@/store/auth";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import { useMyRestaurants } from "@/hooks/use-dashboard";
import { useConnectStatus, useStartOnboarding } from "@/hooks/use-connect";
import { useOwnerPayments, useCloseSession } from "@/hooks/use-owner-payments";
import { Button } from "@/components/ui/button";

const MONTHS = ["Yan","Fev","Mar","Apr","May","İyn","İyl","Avq","Sen","Okt","Noy","Dek"];
const az = (n: number) => Number(n ?? 0).toFixed(2);
const fmtDay = (iso: string) => { const [, m, d] = iso.split("-"); return `${+d} ${MONTHS[+m - 1]}`; };
const STATUS: Record<string, { label: string; cls: string }> = {
    ACTIVE: { label: "Açıq", cls: "bg-success/15 text-success" },
    OPEN: { label: "Açıq", cls: "bg-success/15 text-success" },
    CLOSED: { label: "Bağlı", cls: "bg-muted text-muted-foreground" },
    COMPLETED: { label: "Bağlı", cls: "bg-muted text-muted-foreground" },
};
const isOpen = (s: string) => s === "ACTIVE" || s === "OPEN";

export default function PaymentsPage() {
    const hydrated = useAuthHydrated();
    const router = useRouter();
    const token = useAuth((s) => s.accessToken);
    useEffect(() => { if (hydrated && !token) router.push("/login"); }, [hydrated, token, router]);

    const { data: restaurants } = useMyRestaurants();
    const restaurant = restaurants?.[0];
    const { data: status, isLoading: stLoading, isError: stError, refetch } = useConnectStatus(restaurant?.id ?? "");
    const onboarding = useStartOnboarding(restaurant?.id ?? "");
    const { data: pay, isLoading: payLoading } = useOwnerPayments(restaurant?.id ?? "");
    const closeSession = useCloseSession();

    useEffect(() => {
        const q = new URLSearchParams(window.location.search);
        if (q.get("done") || q.get("refresh")) {
            refetch();
            if (q.get("done")) toast.success("Stripe statusu yeniləndi");
            window.history.replaceState({}, "", "/dashboard/payments");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const start = async () => {
        try { const { url } = await onboarding.mutateAsync(); window.location.href = url; }
        catch (e: any) { toast.error(e.response?.data?.message ?? "Alınmadı"); }
    };
    const doClose = async (sessionId: string, outstanding: number) => {
        if (outstanding > 0 && !window.confirm(`Bu masada ${az(outstanding)} ₼ qalıq var. Yenə də bağlansın?`)) return;
        try { await closeSession.mutateAsync(sessionId); toast.success("Masa bağlandı"); }
        catch (e: any) { toast.error(e.response?.data?.message ?? "Alınmadı"); }
    };

    if (!restaurant) {
        return (
            <div className="mx-auto max-w-4xl p-8 space-y-4">
                <p className="text-muted-foreground">Hələ restoranın yoxdur.</p>
                <Link href="/dashboard/new"><Button>Restoranını yarat</Button></Link>
            </div>
        );
    }

    const active = status?.ready;
    const partial = status?.connected && !active;
    const daily = pay?.daily ?? [];

    return (
        <div className="mx-auto max-w-4xl p-8 space-y-6">
            <div>
                <h1 className="font-display text-3xl font-bold">Ödənişlər</h1>
                <p className="text-muted-foreground">{restaurant.name}</p>
            </div>

            {/* Stripe status */}
            <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-start gap-4">
                    <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                        <CreditCard className="size-6" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h2 className="font-semibold">Stripe ilə qəbul</h2>
                            {stLoading ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                                    <Loader2 className="size-3 animate-spin" /> yoxlanır
                                </span>
                            ) : stError ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                                    <X className="size-3" /> yoxlanmadı
                                </span>
                            ) : active ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
                                    <Check className="size-3" /> Aktiv
                                </span>
                            ) : partial ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-1 text-xs font-medium text-warning">
                                    <AlertCircle className="size-3" /> Tamamlanmayıb
                                </span>
                            ) : (
                                <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">Qurulmayıb</span>
                            )}
                            <button onClick={() => refetch()} className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                                <RefreshCw className="size-3" /> Yenilə
                            </button>
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {stError
                                ? "Status yoxlanmadı — bir az sonra yenidən yoxla."
                                : active
                                    ? "Ödəniş qəbul edirsən."
                                    : partial
                                        ? "Hesab yaradılıb, onboarding tam deyil."
                                        : "Stripe ilə qoşul ki, müştərilər kartla ödəyə bilsin."}
                        </p>

                        {status?.connected && !stError && (
                            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                                <span>Kartla qəbul: {status.chargesEnabled ? "✓" : "—"}</span>
                                <span>Payout (banka): {status.payoutsEnabled ? "✓" : "gözləyir"}</span>
                            </div>
                        )}

                        {!active && !stError && (
                            <Button className="mt-4" onClick={start} disabled={onboarding.isPending}>
                                {onboarding.isPending ? "Yönləndirilir…" : partial ? "Onboarding-i tamamla" : "Ödənişləri qur"}
                                <ArrowRight className="size-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Cəmi kartlar */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-success"><Wallet className="size-4" /><span className="text-xs font-medium uppercase tracking-wide">Alınan</span></div>
                    <p className="mt-1 font-display text-2xl font-bold">{az(pay?.totalReceived ?? 0)} ₼</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-warning"><Clock className="size-4" /><span className="text-xs font-medium uppercase tracking-wide">Qalıq</span></div>
                    <p className="mt-1 font-display text-2xl font-bold">{az(pay?.totalOutstanding ?? 0)} ₼</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-primary"><Heart className="size-4" /><span className="text-xs font-medium uppercase tracking-wide">Bəxşiş</span></div>
                    <p className="mt-1 font-display text-2xl font-bold">{az(pay?.totalTips ?? 0)} ₼</p>
                </div>
            </div>

            {/* Günlük gəlir */}
            <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className="mb-4 font-semibold">Günlük gəlir</h2>
                {payLoading ? (
                    <div className="grid h-[220px] place-items-center text-muted-foreground"><Loader2 className="size-5 animate-spin" /></div>
                ) : daily.length === 0 ? (
                    <div className="grid h-[220px] place-items-center text-sm text-muted-foreground">Hələ ödəniş yoxdur.</div>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={daily} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
                            <defs>
                                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#E85D2C" stopOpacity={0.35} />
                                    <stop offset="100%" stopColor="#E85D2C" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#EFE3D6" vertical={false} />
                            <XAxis dataKey="date" tickFormatter={fmtDay} tick={{ fontSize: 12, fill: "#7C6F63" }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: "#7C6F63" }} tickLine={false} axisLine={false} width={40} />
                            <Tooltip formatter={(v: number) => [`${az(v)} ₼`, "Alınan"]} labelFormatter={(l: string) => fmtDay(l)} contentStyle={{ borderRadius: 12, border: "1px solid #EFE3D6", fontSize: 13 }} />
                            <Area type="monotone" dataKey="received" stroke="#E85D2C" strokeWidth={2.5} fill="url(#rev)" />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Masaların hesabları */}
            <div className="space-y-3">
                <h2 className="font-semibold">Masaların hesabları</h2>
                {payLoading ? (
                    <p className="text-sm text-muted-foreground">Yüklənir…</p>
                ) : (pay?.sessions.length ?? 0) === 0 ? (
                    <p className="text-sm text-muted-foreground">Hələ sessiya yoxdur.</p>
                ) : (
                    pay!.sessions.map((s) => {
                        const st = STATUS[s.status] ?? { label: s.status, cls: "bg-muted text-muted-foreground" };
                        const pct = s.total > 0 ? Math.min(100, (s.received / s.total) * 100) : 0;
                        return (
                            <div key={s.sessionId} className="rounded-2xl border border-border bg-card p-4">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">Masa · {s.tableId.slice(0, 4)}</span>
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${st.cls}`}>{st.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(s.startedAt).toLocaleString("az", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                        {isOpen(s.status) && (
                                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs"
                                                    onClick={() => doClose(s.sessionId, s.outstanding)}
                                                    disabled={closeSession.isPending}>
                                                Bağla
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                                    <div className="h-full bg-success" style={{ width: `${pct}%` }} />
                                </div>
                                <div className="mt-2 flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Cəmi <span className="font-medium text-foreground">{az(s.total)} ₼</span></span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-success">Alınan {az(s.received)} ₼</span>
                                        {s.outstanding > 0 && (
                                            <span className="rounded-full bg-warning/15 px-2.5 py-1 text-xs font-medium text-warning">qalıq {az(s.outstanding)} ₼</span>
                                        )}
                                        <span className="text-xs text-muted-foreground">{s.paidCount}/{s.totalCount}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}