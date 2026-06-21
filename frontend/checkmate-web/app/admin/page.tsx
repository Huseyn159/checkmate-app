"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import { useAuth } from "@/store/auth";
import { usePendingRestaurants, useApproveRestaurant, useRejectRestaurant } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
    const router = useRouter();
    const hydrated = useAuthHydrated();
    const token = useAuth((s) => s.accessToken);
    useEffect(() => { if (hydrated && !token) router.push("/login"); }, [hydrated, token, router]);

    const { data: pending, isError } = usePendingRestaurants();
    const approve = useApproveRestaurant();
    const reject = useRejectRestaurant();
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [reason, setReason] = useState("");

    if (!hydrated) return <div className="p-8">Yüklənir...</div>;
    if (isError) return (
        <div className="p-8 max-w-4xl mx-auto">
            <p className="text-muted-foreground">Bu səhifə yalnız admin üçündür.</p>
        </div>
    );

    const doApprove = async (id: string) => {
        try { await approve.mutateAsync(id); toast.success("Təsdiqləndi"); }
        catch (e: any) { toast.error(e.response?.data?.message ?? "Alınmadı"); }
    };
    const doReject = async (id: string) => {
        if (!reason.trim()) { toast.error("Səbəb yaz"); return; }
        try {
            await reject.mutateAsync({ id, reason: reason.trim() });
            toast.success("Rədd edildi");
            setRejectingId(null); setReason("");
        } catch (e: any) { toast.error(e.response?.data?.message ?? "Alınmadı"); }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Admin — Təsdiq gözləyən restoranlar</h1>

            {pending?.length === 0 && <p className="text-muted-foreground">Gözləyən restoran yoxdur</p>}

            <div className="grid gap-4">
                {pending?.map((r) => (
                    <div key={r.id} className="border rounded-lg overflow-hidden">
                        {r.coverUrl && <img src={r.coverUrl} alt="" className="h-44 w-full object-cover" />}
                        <div className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">{r.name}</h2>
                                <Badge variant="secondary">{r.category}</Badge>
                            </div>
                            {r.description && <p className="text-sm text-muted-foreground">{r.description}</p>}
                            <div className="text-sm space-y-1">
                                <p>📍 {r.address}</p>
                                <p>📞 {r.phone}</p>
                                <p>VÖEN: {r.voen}</p>
                                <p>Sahib: {r.ownerName}</p>
                            </div>

                            {rejectingId === r.id ? (
                                <div className="flex gap-2 pt-2">
                                    <Input placeholder="Rədd səbəbi" value={reason} onChange={(e) => setReason(e.target.value)} />
                                    <Button variant="destructive" onClick={() => doReject(r.id)} disabled={reject.isPending}>Rədd et</Button>
                                    <Button variant="ghost" onClick={() => { setRejectingId(null); setReason(""); }}>Ləğv</Button>
                                </div>
                            ) : (
                                <div className="flex gap-2 pt-2">
                                    <Button onClick={() => doApprove(r.id)} disabled={approve.isPending}>Təsdiqlə</Button>
                                    <Button variant="outline" onClick={() => setRejectingId(r.id)}>Rədd et</Button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}