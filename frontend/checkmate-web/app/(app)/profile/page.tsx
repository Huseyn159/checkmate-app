"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar, Clock, Users, MapPin, QrCode, X, CalendarX, UtensilsCrossed, ArrowRight,
} from "lucide-react";
import { useAuth } from "@/store/auth";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import { useMyReservations, useCancelReservation } from "@/hooks/use-reservations";
import { Button } from "@/components/ui/button";

const joinUrl = (code: string) =>
    `${typeof window !== "undefined" ? window.location.origin : ""}/session/join?code=${code}`;

type Res = {
    id: string;
    restaurantName?: string;
    tableNumber?: string | number;
    zone?: string;
    date: string;
    time: string;
    partySize: number;
    status: string;
    depositAmount?: number;
    sessionCode?: string;
};

const STATUS: Record<string, { label: string; cls: string }> = {
    PENDING: { label: "Gözləyir", cls: "bg-warning/15 text-warning" },
    CONFIRMED: { label: "Təsdiqlənib", cls: "bg-primary/10 text-primary" },
    ARRIVED: { label: "Masadasınız", cls: "bg-success/15 text-success" },
    COMPLETED: { label: "Bitib", cls: "bg-muted text-muted-foreground" },
    CANCELLED: { label: "Ləğv edilib", cls: "bg-destructive/10 text-destructive" },
    NO_SHOW: { label: "Gəlinmədi", cls: "bg-destructive/10 text-destructive" },
};
const isActive = (s: string) => s === "PENDING" || s === "CONFIRMED" || s === "ARRIVED";
const isCancellable = (s: string) => s === "PENDING" || s === "CONFIRMED";

function Meta({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Icon className="size-4 shrink-0" />
            {children}
        </span>
    );
}

function ReservationCard({
                             r, onCancel, onShowQr, canceling,
                         }: {
    r: Res;
    onCancel: (id: string) => void;
    onShowQr: (r: Res) => void;
    canceling: boolean;
}) {
    const st = STATUS[r.status] ?? { label: r.status, cls: "bg-muted text-muted-foreground" };
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="rounded-2xl border border-border bg-card p-5"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="font-display text-lg font-semibold leading-tight">
                        {r.restaurantName ?? "Rezervasiya"}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                        <Meta icon={Calendar}>{r.date}</Meta>
                        <Meta icon={Clock}>{r.time}</Meta>
                        <Meta icon={Users}>{r.partySize} nəfər</Meta>
                        {r.tableNumber != null && (
                            <Meta icon={MapPin}>
                                Masa {r.tableNumber}{r.zone ? ` · ${r.zone}` : ""}
                            </Meta>
                        )}
                    </div>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${st.cls}`}>
                    {st.label}
                </span>
            </div>

            {isActive(r.status) && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                    {r.sessionCode && (
                        <span className="rounded-lg bg-muted px-3 py-1.5 font-mono text-sm font-semibold tracking-[0.2em]">
                            {r.sessionCode}
                        </span>
                    )}
                    {r.sessionCode && (
                        <Button variant="outline" size="sm" onClick={() => onShowQr(r)}>
                            <QrCode className="size-4" /> QR
                        </Button>
                    )}
                    {r.status === "ARRIVED" && (
                        <Button asChild size="sm">
                            <Link href="/session/join">Masaya keç <ArrowRight className="size-4" /></Link>
                        </Button>
                    )}
                    {isCancellable(r.status) && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="ml-auto border-destructive/40 text-destructive hover:bg-destructive/10"
                            onClick={() => onCancel(r.id)}
                            disabled={canceling}
                        >
                            Ləğv et
                        </Button>
                    )}
                </div>
            )}
        </motion.div>
    );
}

export default function ProfilePage() {
    const hydrated = useAuthHydrated();
    const router = useRouter();
    const token = useAuth((s) => s.accessToken);
    const user = useAuth((s) => s.user);
    useEffect(() => {
        if (hydrated && !token) router.push("/login");
    }, [hydrated, token, router]);

    const { data, isLoading } = useMyReservations();
    const cancel = useCancelReservation();
    const [qrFor, setQrFor] = useState<Res | null>(null);

    const items = (data ?? []) as unknown as Res[];
    const active = items.filter((r) => isActive(r.status));
    const past = items.filter((r) => !isActive(r.status));

    const doCancel = async (id: string) => {
        if (!window.confirm("Rezervi ləğv etmək istəyirsən?")) return;
        try {
            await cancel.mutateAsync(id);
            toast.success("Rezerv ləğv edildi");
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? "Alınmadı");
        }
    };

    return (
        <div className="mx-auto max-w-3xl space-y-8">
            <div>
                <h1 className="font-display text-3xl font-bold tracking-tight">Rezervlərim</h1>
                <p className="mt-1 text-muted-foreground">
                    {user?.fullName ? `${user.fullName}, ` : ""}bütün rezervlərin burada.
                </p>
            </div>

            {isLoading ? (
                <p className="text-sm text-muted-foreground">Yüklənir…</p>
            ) : items.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-10 text-center">
                    <div className="mx-auto grid size-14 place-items-center rounded-full bg-accent text-primary">
                        <UtensilsCrossed className="size-7" />
                    </div>
                    <p className="mt-4 text-muted-foreground">Hələ rezervin yoxdur.</p>
                    <Button asChild className="mt-5">
                        <Link href="/restaurants">Restoranları kəşf et</Link>
                    </Button>
                </div>
            ) : (
                <>
                    {active.length > 0 && (
                        <section className="space-y-3">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                Aktiv
                            </h2>
                            <AnimatePresence initial={false}>
                                {active.map((r) => (
                                    <ReservationCard key={r.id} r={r} onCancel={doCancel} onShowQr={setQrFor} canceling={cancel.isPending} />
                                ))}
                            </AnimatePresence>
                        </section>
                    )}

                    {past.length > 0 && (
                        <section className="space-y-3">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                Keçmiş
                            </h2>
                            {past.map((r) => (
                                <ReservationCard key={r.id} r={r} onCancel={doCancel} onShowQr={setQrFor} canceling={cancel.isPending} />
                            ))}
                        </section>
                    )}
                </>
            )}

            {/* QR overlay */}
            <AnimatePresence>
                {qrFor && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setQrFor(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-xs rounded-3xl bg-card p-6 text-center"
                        >
                            <button onClick={() => setQrFor(null)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
                                <X className="size-5" />
                            </button>
                            <h3 className="font-display text-lg font-semibold">{qrFor.restaurantName ?? "Masa kodu"}</h3>
                            <div className="mx-auto mt-4 w-fit rounded-xl border border-border bg-white p-3">
                                <QRCode value={joinUrl(qrFor.sessionCode ?? "")} size={160} />
                            </div>
                            <p className="mt-3 font-display text-2xl font-bold tracking-[0.3em]">
                                {qrFor.sessionCode}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">Restoranda bunu göstər.</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}