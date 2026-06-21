"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { motion } from "framer-motion";
import {
    Calendar, Clock, Users, Minus, Plus, Check, MessageSquare, ArrowRight, MapPin, LayoutGrid,
} from "lucide-react";
import { useCreateReservation } from "@/hooks/use-reservations";
import { useRestaurant } from "@/hooks/use-restaurants";
import { useTableOptions, useFloor } from "@/hooks/use-tables";
import { useAuth } from "@/store/auth";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import { ZONES, FEATURES, zoneOf, featureOf, zoneLabel, featureLabel } from "@/lib/table-catalog";
import { ReservationResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const TIME_SLOTS = (() => {
    const out: string[] = [];
    for (let m = 11 * 60; m <= 23 * 60; m += 30) {
        const h = Math.floor(m / 60), mm = m % 60;
        out.push(`${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
    }
    return out;
})();
function Section({ icon: Icon, title, children }: {
    icon?: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode;
}) {
    return (
        <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium">
                {Icon ? <Icon className="size-4 text-primary" /> : null}{title}
            </Label>
            {children}
        </div>
    );
}
function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between py-1.5 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}

export default function ReservePage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const hydrated = useAuthHydrated();
    const token = useAuth((s) => s.accessToken);
    const { data: restaurant } = useRestaurant(id);
    const { data: options } = useTableOptions(id);
    const createReservation = useCreateReservation();

    const [result, setResult] = useState<ReservationResponse | null>(null);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [partySize, setPartySize] = useState(2);
    const [zone, setZone] = useState("");
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
    const [selectedTableNo, setSelectedTableNo] = useState<string | null>(null);
    const [features, setFeatures] = useState<string[]>([]);
    const [note, setNote] = useState("");
    const [showFloor, setShowFloor] = useState(false);

    const { data: floor, isLoading: floorLoading } = useFloor(id, date, time);

    // login qapısı
    useEffect(() => {
        if (hydrated && !token) {
            router.replace(`/login?redirect=${encodeURIComponent(`/restaurants/${id}/reserve`)}`);
        }
    }, [hydrated, token, id, router]);

    // tarix dəyişəndə saat + masa seçimini sıfırla
    useEffect(() => { setTime(""); setSelectedTableId(null); setSelectedTableNo(null); }, [date]);

    // restoranın real zona/xüsusiyyətləri varsa onları, yoxdursa ümumi kataloqu göstər
    const hasOptions = !!options && options.zones.length > 0;
    const zoneKeys = hasOptions ? options!.zones : ZONES.map((z) => z.key);
    const featureKeys = hasOptions ? options!.features : FEATURES.map((f) => f.key);

    const slotDisabled = (slot: string) => {
        if (!date) return false;
        const dt = new Date(`${date}T${slot}:00`);
        return dt.getTime() < Date.now() + 2 * 60 * 60 * 1000;
    };
    const toggleFeature = (val: string) =>
        setFeatures((prev) => prev.includes(val) ? prev.filter((f) => f !== val) : [...prev, val]);

    const pickZone = (z: string) => {
        setZone(z);
        setSelectedTableId(null); setSelectedTableNo(null); // zona seçimi masa seçimini ləğv edir
    };

    const grouped = useMemo(() => {
        const m: Record<string, typeof floor> = {} as any;
        (floor ?? []).forEach((t) => { (m[t.zone] ??= [] as any).push(t); });
        return m;
    }, [floor]);

    const pickTable = (t: { id: string; tableNumber: string; zone: string; available: boolean }) => {
        if (!t.available) return;
        if (selectedTableId === t.id) { setSelectedTableId(null); setSelectedTableNo(null); return; }
        setSelectedTableId(t.id); setSelectedTableNo(t.tableNumber); setZone(t.zone);
    };

    const openFloor = () => {
        if (!date || !time) { toast.error("Əvvəlcə tarix və saat seç"); return; }
        setShowFloor((s) => !s);
    };

    const doCreate = async (confirm: boolean) => {
        const res = await createReservation.mutateAsync({
            restaurantId: id, date, time, partySize,
            zone: zone || undefined,
            features: features.length ? features : undefined,
            specialNote: note || undefined,
            confirm,
        });
        setResult(res); toast.success("Rezerv qəbul edildi!");
    };
    const submit = async () => {
        if (!token) { router.replace(`/login?redirect=${encodeURIComponent(`/restaurants/${id}/reserve`)}`); return; }
        if (!date || !time) { toast.error("Tarix və saat seç"); return; }
        try {
            await doCreate(false);
        } catch (err: any) {
            const msg = err.response?.data?.message ?? "";
            if (msg.startsWith("CONFIRM_TIGHT::")) {
                if (window.confirm(msg.replace("CONFIRM_TIGHT::", ""))) {
                    try { await doCreate(true); }
                    catch (e: any) { toast.error(e.response?.data?.message ?? "Rezerv alınmadı"); }
                }
                return;
            }
            toast.error(msg || "Rezerv alınmadı");
        }
    };

    if (!hydrated || !token) return null;

    if (result) {
        const joinUrl = typeof window !== "undefined"
            ? `${window.location.origin}/session/join?code=${result.sessionCode}`
            : result.sessionCode;
        return (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        className="mx-auto max-w-md space-y-6 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
                    <Check className="size-8" />
                </div>
                <div>
                    <h1 className="font-display text-2xl font-semibold">Rezervin qəbul edildi!</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{restaurant?.name}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5 text-left">
                    <Row label="Masa" value={`#${result.tableNumber} · ${zoneLabel(result.zone)}`} />
                    <Row label="Tarix" value={`${result.date} · ${result.time}`} />
                    <Row label="Qonaq" value={`${result.partySize} nəfər`} />
                </div>
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5">
                    <div className="rounded-xl border border-border bg-white p-3">
                        <QRCode value={joinUrl} size={150} />
                    </div>
                    <p className="text-sm text-muted-foreground">Masaya qoşulma kodu</p>
                    <p className="font-display text-2xl font-bold tracking-[0.3em]">{result.sessionCode}</p>
                    <p className="text-xs text-muted-foreground">Rezerv pulsuzdur · hesabı gələndə masada bölürsən</p>
                </div>
                <Button onClick={() => router.push("/profile")} variant="outline" className="w-full">Rezervlərim</Button>
            </motion.div>
        );
    }

    return (
        <div className="mx-auto max-w-xl space-y-8">
            <div>
                <h1 className="font-display text-3xl font-semibold tracking-tight">Masa rezerv et</h1>
                <p className="mt-1 text-muted-foreground">{restaurant?.name}</p>
            </div>

            <Section icon={Calendar} title="Tarix">
                <Input type="date" value={date} min={new Date().toISOString().split("T")[0]}
                       onChange={(e) => setDate(e.target.value)} className="h-12 rounded-xl" />
            </Section>

            <Section icon={Clock} title="Saat">
                <div className="grid max-h-56 grid-cols-4 gap-2 overflow-y-auto rounded-xl sm:grid-cols-6">
                    {TIME_SLOTS.map((slot) => {
                        const disabled = slotDisabled(slot);
                        return (
                            <button key={slot} disabled={disabled} onClick={() => setTime(slot)}
                                    className={`rounded-xl border px-2 py-2.5 text-sm font-medium transition ${
                                        disabled ? "cursor-not-allowed border-border bg-muted/40 text-muted-foreground/40"
                                            : time === slot ? "border-primary bg-primary text-primary-foreground"
                                                : "border-border bg-card hover:bg-muted"}`}>
                                {slot}
                            </button>
                        );
                    })}
                </div>
                {date && <p className="text-xs text-muted-foreground">Rezerv ən azı 2 saat əvvəldən olmalıdır.</p>}
            </Section>

            <Section icon={Users} title="Qonaq sayı">
                <div className="flex items-center gap-4">
                    <Button type="button" variant="outline" size="icon" className="size-11 rounded-xl"
                            onClick={() => setPartySize((p) => Math.max(1, p - 1))}><Minus className="size-4" /></Button>
                    <span className="w-10 text-center text-2xl font-semibold">{partySize}</span>
                    <Button type="button" variant="outline" size="icon" className="size-11 rounded-xl"
                            onClick={() => setPartySize((p) => Math.min(20, p + 1))}><Plus className="size-4" /></Button>
                </div>
            </Section>

            {/* Zona — opsional */}
            <Section title="Zona (opsional)">
                <div className="flex flex-wrap gap-2.5">
                    <button onClick={() => pickZone("")}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                                zone === "" ? "border-primary bg-accent text-primary"
                                    : "border-border bg-card text-muted-foreground hover:bg-muted"}`}>
                        Fərqi yoxdur
                    </button>
                    {zoneKeys.map((zk) => {
                        const z = zoneOf(zk); const Icon = z?.icon; const active = zone === zk;
                        return (
                            <button key={zk} onClick={() => pickZone(zk)}
                                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                                        active ? "border-primary bg-accent text-primary"
                                            : "border-border bg-card text-muted-foreground hover:bg-muted"}`}>
                                {Icon && <Icon className="size-4" />} {zoneLabel(zk)}
                            </button>
                        );
                    })}
                </div>
            </Section>

            {/* Zalı gör — opsional */}
            <div className="space-y-3">
                <Button type="button" variant="outline" onClick={openFloor} className="w-full justify-center gap-2">
                    <LayoutGrid className="size-4" /> {showFloor ? "Zalı gizlət" : "Zalı gör (boş masalar)"}
                </Button>

                {showFloor && (
                    floorLoading ? (
                        <p className="text-sm text-muted-foreground">Yüklənir…</p>
                    ) : !floor || floor.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                            Bu restoran hələ zal planı qurmayıb. Yuxarıdan zona seç — uyğun masa avtomatik ayrılacaq.
                        </p>
                    ) : (
                        <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-success" /> Boş</span>
                                <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-warning" /> Sıx (~1 saat)</span>
                                <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-destructive/60" /> Dolu</span>
                            </div>
                            {Object.entries(grouped).map(([z, tbls]) => {
                                const ZIcon = zoneOf(z)?.icon;
                                return (
                                    <div key={z} className="rounded-2xl border border-border bg-muted/30 p-3">
                                        <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium">
                                            {ZIcon && <ZIcon className="size-4 text-primary" />} {zoneLabel(z)}
                                        </p>
                                        <div className="flex flex-wrap gap-2.5">
                                            {(tbls ?? []).map((t) => {
                                                const sel = selectedTableId === t.id;
                                                const taken = !t.available && !t.tight;
                                                const dotColor = t.available ? "bg-success" : t.tight ? "bg-warning" : "bg-destructive/60";
                                                return (
                                                    <button key={t.id} disabled={taken} onClick={() => pickTable(t)}
                                                            className={`flex flex-col items-center justify-center gap-1 rounded-2xl border-2 p-2 transition ${
                                                                taken ? "cursor-not-allowed border-destructive/30 bg-destructive/5 opacity-70"
                                                                    : sel ? "border-primary bg-primary/10 ring-2 ring-primary/25"
                                                                        : t.tight ? "border-warning/50 bg-warning/10 hover:border-warning"
                                                                            : "border-success/40 bg-success/5 hover:border-success"}`}
                                                            style={{ width: 86, minHeight: 86 }}>
                                                        <span className="text-sm font-bold">#{t.tableNumber}</span>
                                                        <div className="flex max-w-[64px] flex-wrap justify-center gap-0.5">
                                                            {Array.from({ length: Math.min(t.capacity, 8) }).map((_, i) => (
                                                                <span key={i} className={`size-1.5 rounded-full ${dotColor}`} />
                                                            ))}
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground">{t.capacity} nəfər</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                            {selectedTableNo && (
                                <p className="text-sm font-medium text-primary">Seçildi: #{selectedTableNo} ({zoneLabel(zone)})</p>
                            )}
                        </div>
                    )
                )}
            </div>

            {/* Xüsusiyyətlər — opsional */}
            {featureKeys.length > 0 && (
                <Section title="Xüsusiyyətlər (opsional)">
                    <div className="flex flex-wrap gap-2.5">
                        {featureKeys.map((fk) => {
                            const f = featureOf(fk); const Icon = f?.icon; const active = features.includes(fk);
                            return (
                                <button key={fk} onClick={() => toggleFeature(fk)}
                                        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                                            active ? "border-primary bg-accent text-primary"
                                                : "border-border bg-card text-muted-foreground hover:bg-muted"}`}>
                                    {Icon && <Icon className="size-4" />} {featureLabel(fk)}
                                </button>
                            );
                        })}
                    </div>
                </Section>
            )}

            <Section icon={MessageSquare} title="Qeyd (opsional)">
                <Input value={note} onChange={(e) => setNote(e.target.value)}
                       placeholder="Ad günüdür, pəncərə kənarı arzuolunandır…" className="h-12 rounded-xl" />
            </Section>

            <Button onClick={submit} disabled={createReservation.isPending} size="lg"
                    className="h-12 w-full rounded-xl text-base font-semibold">
                {createReservation.isPending ? "Göndərilir…"
                    : selectedTableNo ? `Masa #${selectedTableNo} rezerv et` : "Masa rezerv et"}
                {!createReservation.isPending && <ArrowRight className="size-4" />}
            </Button>
        </div>
    );
}