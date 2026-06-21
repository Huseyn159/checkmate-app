"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
    CalendarCheck, Clock, CheckCircle2, Wallet, CreditCard, Table2,
    UtensilsCrossed, ChefHat, Users, MapPin, ArrowRight,
} from "lucide-react";
import { useAuth } from "@/store/auth";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import { useMyRestaurants, useReservations, useConfirmArrival } from "@/hooks/use-dashboard";
import { useOwnerPayments } from "@/hooks/use-owner-payments";
import { Button } from "@/components/ui/button";

const STATUS: Record<string, { label: string; cls: string }> = {
    PENDING: { label: "Gözləyir", cls: "bg-warning/15 text-warning" },
    CONFIRMED: { label: "Təsdiqlənib", cls: "bg-primary/10 text-primary" },
    ARRIVED: { label: "Gəldi", cls: "bg-success/15 text-success" },
    COMPLETED: { label: "Bitib", cls: "bg-muted text-muted-foreground" },
    CANCELLED: { label: "Ləğv", cls: "bg-destructive/10 text-destructive" },
    NO_SHOW: { label: "Gəlmədi", cls: "bg-destructive/10 text-destructive" },
};
const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const az = (n: number) => Number(n ?? 0).toFixed(2);
const canArrive = (s: string) => !["ARRIVED", "CANCELLED", "NO_SHOW", "COMPLETED"].includes(s);

const LINKS = [
    { href: "/dashboard/payments", label: "Ödənişlər", icon: CreditCard },
    { href: "/dashboard/tables", label: "Masalar", icon: Table2 },
    { href: "/dashboard/menu", label: "Menyu", icon: UtensilsCrossed },
    { href: "/dashboard/kitchen", label: "Mətbəx", icon: ChefHat },
];

export default function DashboardPage() {
    const hydrated = useAuthHydrated();
    const router = useRouter();
    const token = useAuth((s) => s.accessToken);
    useEffect(() => { if (hydrated && !token) router.push("/login"); }, [hydrated, token, router]);

    const { data: restaurants } = useMyRestaurants();
    const restaurant = restaurants?.[0];
    const { data: reservations } = useReservations(restaurant?.id ?? "");
    const { data: pay } = useOwnerPayments(restaurant?.id ?? "");
    const confirmArrival = useConfirmArrival(restaurant?.id ?? "");
    const [filter, setFilter] = useState<"today" | "all">("today");

    if (!restaurant) {
        return (
            <div className="mx-auto max-w-md space-y-4 py-16 text-center">
                <p className="text-muted-foreground">Hələ restoranın yoxdur.</p>
                <Link href="/dashboard/new"><Button>Restoranını yarat</Button></Link>
            </div>
        );
    }

    const all = reservations ?? [];
    const today = all.filter((r) => r.date === todayStr());
    const pendingCount = today.filter((r) => r.status === "PENDING" || r.status === "CONFIRMED").length;
    const arrivedCount = today.filter((r) => r.status === "ARRIVED").length;
    const shown = filter === "today" ? today : all;

    const arrive = async (id: string) => {
        try { await confirmArrival.mutateAsync(id); toast.success("Gəldi qeyd olundu"); }
        catch (e: any) { toast.error(e.response?.data?.message ?? "Alınmadı"); }
    };

    const stats = [
        { label: "Bu gün rezerv", value: today.length, icon: CalendarCheck, tone: "text-primary" },
        { label: "Gözləyən", value: pendingCount, icon: Clock, tone: "text-warning" },
        { label: "Gəlib", value: arrivedCount, icon: CheckCircle2, tone: "text-success" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="font-display text-3xl font-bold tracking-tight">{restaurant.name}</h1>
                    <p className="text-muted-foreground">İdarə paneli</p>
                </div>
            </div>

            {/* Statistika */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
                            <div className={`flex items-center gap-2 ${s.tone}`}>
                                <Icon className="size-4" />
                                <span className="text-xs font-medium uppercase tracking-wide">{s.label}</span>
                            </div>
                            <p className="mt-1 font-display text-3xl font-bold">{s.value}</p>
                        </div>
                    );
                })}
                <Link href="/dashboard/payments" className="group rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm">
                    <div className="flex items-center gap-2 text-success">
                        <Wallet className="size-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">Alınan</span>
                    </div>
                    <p className="mt-1 font-display text-3xl font-bold">{az(pay?.totalReceived ?? 0)} ₼</p>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary">
                        Ödənişlər <ArrowRight className="size-3" />
                    </span>
                </Link>
            </div>

            {/* Sürətli keçidlər */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {LINKS.map((l) => {
                    const Icon = l.icon;
                    return (
                        <Link key={l.href} href={l.href}
                              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                                <Icon className="size-5" />
                            </div>
                            <span className="font-medium">{l.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Rezervlər */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-semibold">Rezervlər</h2>
                    <div className="flex rounded-lg border border-border bg-card p-0.5 text-sm">
                        {(["today", "all"] as const).map((f) => (
                            <button key={f} onClick={() => setFilter(f)}
                                    className={`rounded-md px-3 py-1.5 font-medium transition ${
                                        filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                                    }`}>
                                {f === "today" ? "Bu gün" : "Hamısı"}
                            </button>
                        ))}
                    </div>
                </div>

                {shown.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
                        {filter === "today" ? "Bu gün rezerv yoxdur." : "Rezerv yoxdur."}
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {shown.map((r) => {
                            const st = STATUS[r.status] ?? { label: r.status, cls: "bg-muted text-muted-foreground" };
                            return (
                                <div key={r.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
                                    <div className="min-w-0">
                                        <p className="font-medium">{r.customerName}</p>
                                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                            <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{r.date} · {r.time}</span>
                                            <span className="inline-flex items-center gap-1"><Users className="size-3.5" />{r.partySize}</span>
                                            {r.tableNumber && <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />Masa {r.tableNumber}</span>}
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${st.cls}`}>{st.label}</span>
                                        {canArrive(r.status) && (
                                            <Button size="sm" onClick={() => arrive(r.id)} disabled={confirmArrival.isPending}>
                                                Gəldi
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}