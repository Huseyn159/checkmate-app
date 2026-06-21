"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import { useAuth } from "@/store/auth";
import { useMyRestaurants } from "@/hooks/use-dashboard";
import { useKitchenOrders, useUpdateOrderStatus } from "@/hooks/use-kitchen";
import { useStompTopic } from "@/hooks/use-stomp";
import { OrderResponse } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const NEXT: Record<string, { status: string; label: string } | undefined> = {
    PENDING: { status: "PREPARING", label: "Hazırlanmağa başla" },
    PREPARING: { status: "READY", label: "Hazır et" },
    READY: { status: "DELIVERED", label: "Çatdırıldı" },
};
const STATUS_LABEL: Record<string, string> = { PENDING: "Yeni", PREPARING: "Hazırlanır", READY: "Hazır" };

export default function KitchenPage() {
    const router = useRouter();
    const hydrated = useAuthHydrated();
    const token = useAuth((s) => s.accessToken);
    useEffect(() => { if (hydrated && !token) router.push("/login"); }, [hydrated, token, router]);

    const { data: restaurants } = useMyRestaurants();
    const restaurant = restaurants?.[0];
    const { data } = useKitchenOrders(restaurant?.id ?? "");
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    useEffect(() => { if (data) setOrders(data); }, [data]);

    useStompTopic<OrderResponse>(`/topic/kitchen/${restaurant?.id ?? ""}`, (o) =>
        setOrders((prev) => {
            if (o.status === "DELIVERED" || o.status === "CANCELLED") return prev.filter((x) => x.id !== o.id);
            const i = prev.findIndex((x) => x.id === o.id);
            if (i >= 0) { const c = [...prev]; c[i] = o; return c; }
            return [...prev, o];
        })
    );

    const update = useUpdateOrderStatus();
    const advance = (o: OrderResponse) => {
        const n = NEXT[o.status];
        if (n) update.mutate({ orderId: o.id, status: n.status });
    };

    if (!hydrated) return <div className="p-8">Yüklənir...</div>;
    if (!restaurant) return <div className="p-8 max-w-5xl mx-auto">Restoranın yoxdur.</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Mətbəx — {restaurant.name}</h1>
                <Link href="/dashboard" className="text-sm underline">← Dashboard</Link>
            </div>

            {orders.length === 0 && <p className="text-muted-foreground">Aktiv sifariş yoxdur</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map((o) => (
                    <div key={o.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold">Masa #{o.tableNumber ?? "?"}</span>
                            <Badge variant={o.status === "READY" ? "default" : "secondary"}>
                                {STATUS_LABEL[o.status] ?? o.status}
                            </Badge>
                        </div>
                        {o.isShared && <Badge variant="outline">Ortaq</Badge>}
                        <div className="text-sm">
                            {o.items.map((it, i) => <p key={i}>{it.quantity}× {it.itemName}</p>)}
                        </div>
                        {NEXT[o.status] && (
                            <Button className="w-full" onClick={() => advance(o)} disabled={update.isPending}>
                                {NEXT[o.status]!.label}
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}