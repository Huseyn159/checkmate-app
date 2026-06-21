"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    Vote,
    ThumbsUp,
    ThumbsDown,
    Check,
    X,
    Minus,
    Plus,
    UtensilsCrossed,
    LogOut
} from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { useStompTopic } from "@/hooks/use-stomp";
import { useMenu } from "@/hooks/use-restaurants";
import { useSessionOrders, usePlaceOrder, OrderResponse } from "@/hooks/use-orders";
import {
    useSessionProposals,
    useCreateProposal,
    useVote,
    useFinalizeProposal,
    ProposalResponse,
} from "@/hooks/use-proposals";
import { useBill, useCheckout, BillResponse } from "@/hooks/use-bill";
import { useAuth } from "@/store/auth";
import { SessionResponse, MenuItem } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const initials = (name?: string) =>
    (name ?? "?")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("") || "?";

const ORDER_STEPS = ["PENDING", "PREPARING", "READY", "DELIVERED"];

function StatusChip({ status }: { status: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        PENDING: { label: "Qəbul edildi", cls: "bg-warning/15 text-warning" },
        PREPARING: { label: "Hazırlanır", cls: "bg-primary/10 text-primary" },
        READY: { label: "Hazır", cls: "bg-success/15 text-success" },
        DELIVERED: { label: "Çatdırıldı", cls: "bg-muted text-muted-foreground" },
        CANCELLED: { label: "Ləğv", cls: "bg-destructive/10 text-destructive" },
    };
    const s = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground" };
    return (
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
    );
}

function OrderStatusTrack({ status }: { status: string }) {
    if (status === "CANCELLED") return null;
    const idx = ORDER_STEPS.indexOf(status);
    return (
        <div className="flex items-center gap-1.5">
            {ORDER_STEPS.map((s, i) => (
                <div
                    key={s}
                    className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-primary" : "bg-muted"}`}
                />
            ))}
        </div>
    );
}

export default function SessionPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const user = useAuth((s) => s.user);

    // Session + canlı iştirakçılar
    const { data: sessionData } = useSession(id);
    const [session, setSession] = useState<SessionResponse | null>(null);
    useEffect(() => {
        if (sessionData) setSession(sessionData);
    }, [sessionData]);
    useStompTopic<SessionResponse>(`/topic/session/${id}`, setSession);

    // Menyu
    const { data: menu } = useMenu(session?.restaurantId ?? "");
    const itemMap = useMemo(() => {
        const m: Record<string, MenuItem> = {};
        menu?.forEach((c) => c.items.forEach((i) => (m[i.id] = i)));
        return m;
    }, [menu]);

    // Sifarişlər + canlı
    const { data: ordersData } = useSessionOrders(id);
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    useEffect(() => {
        if (ordersData) setOrders(ordersData);
    }, [ordersData]);
    useStompTopic<OrderResponse>(`/topic/session/${id}/orders`, (o) =>
        setOrders((prev) => {
            const i = prev.findIndex((x) => x.id === o.id);
            if (i >= 0) {
                const c = [...prev];
                c[i] = o;
                return c;
            }
            return [...prev, o];
        })
    );

    // Təkliflər (vote) + canlı
    const { data: proposalsData } = useSessionProposals(id);
    const [proposals, setProposals] = useState<ProposalResponse[]>([]);
    useEffect(() => {
        if (proposalsData) setProposals(proposalsData);
    }, [proposalsData]);
    useStompTopic<ProposalResponse>(`/topic/session/${id}/proposals`, (p) =>
        setProposals((prev) => {
            const i = prev.findIndex((x) => x.id === p.id);
            if (i >= 0) {
                const c = [...prev];
                c[i] = p;
                return c;
            }
            return [...prev, p];
        })
    );
    const openProposals = proposals.filter((p) => p.status === "OPEN");

    // Hesab + canlı
    const { data: billData, refetch: refetchBill } = useBill(id);
    const [bill, setBill] = useState<BillResponse | null>(null);
    useEffect(() => {
        if (billData) setBill(billData);
    }, [billData]);
    useStompTopic<BillResponse>(`/topic/session/${id}/bill`, setBill);
    const checkout = useCheckout(id);
    const [tipPct, setTipPct] = useState(0);
    const myBill = bill?.participants.find((p) => p.userId === user?.id);
    const tipAmount = myBill ? +((myBill.outstanding * tipPct) / 100).toFixed(2) : 0;

    // Səbət
    const [cart, setCart] = useState<Record<string, number>>({});
    const placeOrder = usePlaceOrder(id);
    const createProposal = useCreateProposal(id);
    const vote = useVote();
    const finalize = useFinalizeProposal();

    const add = (iid: string) => setCart((c) => ({ ...c, [iid]: (c[iid] || 0) + 1 }));
    const remove = (iid: string) =>
        setCart((c) => {
            const n = { ...c };
            if (n[iid] > 1) n[iid]--;
            else delete n[iid];
            return n;
        });
    const cartEntries = Object.entries(cart);
    const cartCount = cartEntries.reduce((s, [, q]) => s + q, 0);
    const cartTotal = cartEntries.reduce((s, [iid, q]) => s + (itemMap[iid]?.price ?? 0) * q, 0);
    const cartItems = () =>
        cartEntries.map(([menuItemId, quantity]) => ({ menuItemId, quantity }));

    const submitOwn = async () => {
        if (!cartCount) return;
        try {
            await placeOrder.mutateAsync({ items: cartItems(), shared: false });
            setCart({});
            toast.success("Sifariş verildi");
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? "Alınmadı");
        }
    };
    const proposeToTable = async () => {
        if (!cartCount) return;
        try {
            await createProposal.mutateAsync(cartItems());
            setCart({});
            toast.success("Masaya təklif edildi");
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? "Alınmadı");
        }
    };
    const castVote = async (pid: string, approve: boolean) => {
        try {
            await vote.mutateAsync({ proposalId: pid, approve });
        } catch {
            toast.error("Səs alınmadı");
        }
    };
    const doFinalize = async (pid: string) => {
        try {
            await finalize.mutateAsync(pid);
            toast.success("Yekunlaşdı");
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? "Alınmadı");
        }
    };
    const doPay = async () => {
        try {
            const { url } = await checkout.mutateAsync(tipAmount);
            window.location.href = url; // Stripe Checkout-a yönləndir
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? "Ödəniş başlamadı");
        }
    };

    const leaveSession = () => {
        if (window.confirm("Sessiyadan çıxmaq istəyirsən? Ödənilməmiş hesabın qalsa, restoran görəcək. İstənilən vaxt kodla yenidən qoşula bilərsən.")) {
            router.push("/restaurants");
        }
    };

    if (!session)
        return (
            <div className="grid min-h-[100svh] place-items-center text-sm text-muted-foreground">
                Yüklənir…
            </div>
        );

    return (
        <div className="mx-auto max-w-md px-4 pb-32 pt-4">
            {/* Sticky başlıq + presence */}
            <div className="sticky top-0 z-30 -mx-4 border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex size-2.5 rounded-full bg-success" />
              </span>
                            <h1 className="font-display text-lg font-semibold">Masa sessiyası</h1>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {session.participants.length} nəfər masada
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={leaveSession}
                            className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted"
                        >
                            <LogOut className="size-3.5" /> Çıx
                        </button>
                        <div className="flex -space-x-2">
                            {session.participants.slice(0, 5).map((p) => (
                                <span
                                    key={p.userId}
                                    title={p.fullName}
                                    className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground ring-2 ring-background"
                                >
                  {initials(p.fullName)}
                </span>
                            ))}
                            {session.participants.length > 5 && (
                                <span className="grid size-8 place-items-center rounded-full bg-muted text-xs font-medium text-muted-foreground ring-2 ring-background">
                  +{session.participants.length - 5}
                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Canlı səsvermə */}
            <div className="mt-4 space-y-3">
                <AnimatePresence>
                    {openProposals.map((p) => {
                        const myVote = p.votes.find((v) => v.userId === user?.id);
                        const isProposer = p.proposerId === user?.id;
                        const voters = session.participants.length || 1;
                        const yesPct = Math.min(100, (p.yesCount / voters) * 100);
                        const noPct = Math.min(100, (p.noCount / voters) * 100);
                        return (
                            <motion.div
                                key={p.id}
                                layout
                                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                className="overflow-hidden rounded-2xl border border-primary/30 bg-card shadow-lg shadow-primary/5"
                            >
                                <div className="flex items-center gap-3 border-b border-border bg-accent/50 px-4 py-3">
                  <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {initials(p.proposerName)}
                  </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold leading-tight">
                                            {p.proposerName} təklif edir
                                        </p>
                                        <p className="text-xs text-muted-foreground">Masaya səsvermə</p>
                                    </div>
                                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    <Vote className="size-3.5" /> Səs ver
                  </span>
                                </div>

                                <div className="space-y-1.5 px-4 py-3">
                                    {p.items.map((it, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm">
                      <span>
                        <span className="text-muted-foreground">{it.quantity}×</span>{" "}
                          {it.itemName}
                      </span>
                                            <span className="text-muted-foreground">
                        {(it.unitPrice * it.quantity).toFixed(2)} ₼
                      </span>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between border-t border-border pt-2 text-sm font-semibold">
                                        <span>Cəmi</span>
                                        <span className="text-primary">
                      {Number(p.totalAmount).toFixed(2)} ₼
                    </span>
                                    </div>
                                </div>

                                <div className="space-y-2 px-4 pb-3">
                                    <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                                        <motion.div
                                            className="bg-success"
                                            animate={{ width: `${yesPct}%` }}
                                            transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                        />
                                        <motion.div
                                            className="bg-destructive"
                                            animate={{ width: `${noPct}%` }}
                                            transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex -space-x-1.5">
                                                {p.votes
                                                    .filter((v) => v.approve)
                                                    .map((v) => (
                                                        <span
                                                            key={v.userId}
                                                            title={v.userName}
                                                            className="grid size-6 place-items-center rounded-full bg-success/15 text-[10px] font-semibold text-success ring-2 ring-card"
                                                        >
                              {initials(v.userName)}
                            </span>
                                                    ))}
                                            </div>
                                            <span className="font-medium text-success">{p.yesCount} lehinə</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                      <span className="font-medium text-destructive">
                        {p.noCount} əleyhinə
                      </span>
                                            <div className="flex -space-x-1.5">
                                                {p.votes
                                                    .filter((v) => !v.approve)
                                                    .map((v) => (
                                                        <span
                                                            key={v.userId}
                                                            title={v.userName}
                                                            className="grid size-6 place-items-center rounded-full bg-destructive/15 text-[10px] font-semibold text-destructive ring-2 ring-card"
                                                        >
                              {initials(v.userName)}
                            </span>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 px-4 pb-4">
                                    <Button
                                        variant="outline"
                                        className={`flex-1 ${
                                            myVote?.approve
                                                ? "border-success bg-success text-success-foreground hover:bg-success/90"
                                                : ""
                                        }`}
                                        onClick={() => castVote(p.id, true)}
                                    >
                                        <ThumbsUp className="size-4" /> Qoşuluram
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className={`flex-1 ${
                                            myVote && !myVote.approve
                                                ? "border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                : ""
                                        }`}
                                        onClick={() => castVote(p.id, false)}
                                    >
                                        <ThumbsDown className="size-4" /> Yox
                                    </Button>
                                </div>

                                {isProposer && (
                                    <div className="border-t border-border px-4 py-3">
                                        <Button
                                            className="w-full"
                                            onClick={() => doFinalize(p.id)}
                                            disabled={finalize.isPending}
                                        >
                                            <Check className="size-4" /> Yekunlaşdır
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <Tabs
                defaultValue="menu"
                className="mt-4"
                onValueChange={(v) => {
                    if (v === "bill") refetchBill();
                }}
            >
                <TabsList className="w-full">
                    <TabsTrigger value="menu" className="flex-1">
                        Menyu
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="flex-1">
                        Sifarişlər{orders.length > 0 && ` (${orders.length})`}
                    </TabsTrigger>
                    <TabsTrigger value="bill" className="flex-1">
                        Hesab
                    </TabsTrigger>
                </TabsList>

                {/* MENYU */}
                <TabsContent value="menu" className="mt-4 space-y-6">
                    {menu?.map((cat) => (
                        <div key={cat.id} className="space-y-2.5">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                {cat.name}
                            </h3>
                            <div className="space-y-2.5">
                                {cat.items.map((item) => {
                                    const qty = cart[item.id] ?? 0;
                                    const disabled = item.isAvailable === false;
                                    return (
                                        <div
                                            key={item.id}
                                            className={`flex items-center gap-3 rounded-2xl border border-border bg-card p-2.5 ${
                                                disabled ? "opacity-50" : ""
                                            }`}
                                        >
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="size-14 shrink-0 rounded-xl object-cover"
                                                />
                                            ) : (
                                                <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                                                    <UtensilsCrossed className="size-5" />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{item.name}</p>
                                                <p className="text-sm font-semibold text-primary">
                                                    {Number(item.price).toFixed(2)} ₼
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {qty > 0 && (
                                                    <>
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            className="size-8 rounded-lg"
                                                            onClick={() => remove(item.id)}
                                                            disabled={disabled}
                                                        >
                                                            <Minus className="size-4" />
                                                        </Button>
                                                        <span className="w-4 text-center text-sm font-medium">{qty}</span>
                                                    </>
                                                )}
                                                <Button
                                                    size="icon"
                                                    variant={qty > 0 ? "default" : "outline"}
                                                    className="size-8 rounded-lg"
                                                    onClick={() => add(item.id)}
                                                    disabled={disabled}
                                                >
                                                    <Plus className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </TabsContent>

                {/* SİFARİŞLƏR */}
                <TabsContent value="orders" className="mt-4 space-y-3">
                    {orders.length === 0 && (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            Hələ sifariş yoxdur.
                        </p>
                    )}
                    {orders.map((o) => (
                        <motion.div
                            key={o.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border border-border bg-card p-4"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                    {initials(o.userName)}
                  </span>
                                    <div>
                                        <p className="text-sm font-medium leading-tight">{o.userName}</p>
                                        {o.isShared && (
                                            <span className="text-xs text-primary">Masaya bölüşülən</span>
                                        )}
                                    </div>
                                </div>
                                <StatusChip status={o.status} />
                            </div>
                            <div className="mt-3 space-y-1">
                                {o.items.map((it, i) => (
                                    <p key={i} className="text-sm text-muted-foreground">
                                        {it.quantity}× {it.itemName}
                                    </p>
                                ))}
                            </div>
                            {o.status !== "CANCELLED" && (
                                <div className="mt-3">
                                    <OrderStatusTrack status={o.status} />
                                </div>
                            )}
                            <p className="mt-2 text-right text-sm font-semibold">
                                {Number(o.totalAmount).toFixed(2)} ₼
                            </p>
                        </motion.div>
                    ))}
                </TabsContent>

                {/* HESAB */}
                <TabsContent value="bill" className="mt-4 space-y-4">
                    {!bill ? (
                        <p className="text-muted-foreground">Yüklənir…</p>
                    ) : (
                        <>
                            <div className="rounded-2xl border border-border bg-card p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Masanın cəmi</p>
                                        <p className="font-display text-2xl font-bold">
                                            {Number(bill.grandTotal).toFixed(2)} ₼
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                    {bill.paidCount}/{bill.totalCount} ödədi
                  </span>
                                </div>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                                    <motion.div
                                        className="h-full bg-success"
                                        animate={{
                                            width: `${bill.totalCount ? (bill.paidCount / bill.totalCount) * 100 : 0}%`,
                                        }}
                                        transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                    />
                                </div>
                            </div>

                            {myBill && (
                                <div className="overflow-hidden rounded-2xl border border-primary/30 bg-card">
                                    <div className="border-b border-border bg-accent/50 px-4 py-3">
                                        <p className="text-sm font-semibold">Sənin hesabın</p>
                                    </div>
                                    <div className="space-y-2 px-4 py-3">
                                        {myBill.ownItems.map((it, i) => (
                                            <div key={i} className="flex justify-between text-sm">
                        <span>
                          {it.quantity}× {it.name}
                        </span>
                                                <span>{Number(it.amount).toFixed(2)} ₼</span>
                                            </div>
                                        ))}
                                        {myBill.sharedItems.map((s, i) => (
                                            <div
                                                key={i}
                                                className="flex justify-between text-sm text-muted-foreground"
                                            >
                        <span>
                          {s.description} (÷{s.sharers})
                        </span>
                                                <span>{Number(s.yourShare).toFixed(2)} ₼</span>
                                            </div>
                                        ))}
                                        {myBill.ownItems.length === 0 &&
                                            myBill.sharedItems.length === 0 && (
                                                <p className="text-sm text-muted-foreground">
                                                    Hələ sifariş yoxdur.
                                                </p>
                                            )}
                                        <div className="flex justify-between border-t border-border pt-2 text-sm font-medium">
                                            <span>Ara cəm</span>
                                            <span>{Number(myBill.total).toFixed(2)} ₼</span>
                                        </div>
                                        {myBill.paidAmount > 0 && (
                                            <div className="flex justify-between text-sm text-success">
                                                <span>Ödənilib</span>
                                                <span>{Number(myBill.paidAmount).toFixed(2)} ₼</span>
                                            </div>
                                        )}
                                    </div>

                                    {myBill.outstanding > 0 ? (
                                        <div className="space-y-3 border-t border-border px-4 py-3">
                                            <div className="flex justify-between text-sm font-medium">
                                                <span>Qalıq</span>
                                                <span>{Number(myBill.outstanding).toFixed(2)} ₼</span>
                                            </div>
                                            <div>
                                                <p className="mb-1.5 text-xs text-muted-foreground">Bəxşiş</p>
                                                <div className="flex gap-2">
                                                    {[0, 10, 15, 20].map((pct) => (
                                                        <button
                                                            key={pct}
                                                            onClick={() => setTipPct(pct)}
                                                            className={`flex-1 rounded-xl border px-2 py-2 text-sm font-medium transition ${
                                                                tipPct === pct
                                                                    ? "border-primary bg-primary text-primary-foreground"
                                                                    : "border-border bg-card hover:bg-muted"
                                                            }`}
                                                        >
                                                            {pct === 0 ? "Yox" : `${pct}%`}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-sm text-muted-foreground">
                                                <span>Bəxşiş</span>
                                                <span>{tipAmount.toFixed(2)} ₼</span>
                                            </div>
                                            <div className="flex justify-between text-base font-bold">
                                                <span>Ödəniləcək</span>
                                                <span className="text-primary">
                          {(myBill.outstanding + tipAmount).toFixed(2)} ₼
                        </span>
                                            </div>
                                            <Button
                                                className="h-11 w-full"
                                                onClick={doPay}
                                                disabled={checkout.isPending}
                                            >
                                                {checkout.isPending ? "Yönləndirilir…" : "Kartla ödə"}
                                            </Button>
                                        </div>
                                    ) : myBill.paidAmount > 0 ? (
                                        <div className="flex items-center gap-2 border-t border-border bg-success/5 px-4 py-3 text-sm font-medium text-success">
                                            <Check className="size-4" /> Tam ödənildi
                                            {myBill.tipAmount > 0 &&
                                                ` · bəxşiş ${Number(myBill.tipAmount).toFixed(2)} ₼`}
                                        </div>
                                    ) : null}
                                </div>
                            )}

                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-muted-foreground">Masadakılar</p>
                                {bill.participants
                                    .filter((p) => p.userId !== user?.id)
                                    .map((p) => (
                                        <div
                                            key={p.userId}
                                            className="flex items-center justify-between rounded-2xl border border-border bg-card p-3"
                                        >
                                            <div className="flex items-center gap-2.5">
                        <span className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                          {initials(p.userName)}
                        </span>
                                                <span className="text-sm font-medium">{p.userName}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {Number(p.total).toFixed(2)} ₼
                        </span>
                                                {p.outstanding > 0 ? (
                                                    <span className="rounded-full bg-warning/15 px-2.5 py-1 text-xs font-medium text-warning">
                            qalıq {Number(p.outstanding).toFixed(2)} ₼
                          </span>
                                                ) : p.paidAmount > 0 ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
                            <Check className="size-3" /> ödədi
                          </span>
                                                ) : (
                                                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                            —
                          </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </>
                    )}
                </TabsContent>
            </Tabs>

            {/* Səbət bar */}
            <AnimatePresence>
                {cartCount > 0 && (
                    <motion.div
                        initial={{ y: 90 }}
                        animate={{ y: 0 }}
                        exit={{ y: 90 }}
                        transition={{ type: "spring", stiffness: 260, damping: 28 }}
                        className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border bg-background/95 p-4 backdrop-blur"
                    >
                        <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{cartCount} məhsul</span>
                            <span className="font-semibold">{cartTotal.toFixed(2)} ₼</span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={submitOwn}
                                disabled={placeOrder.isPending}
                            >
                                Özüm üçün
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={proposeToTable}
                                disabled={createProposal.isPending}
                            >
                                Masaya təklif et
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Sessiya bağlandı — overlay */}
            <AnimatePresence>
                {(session as { status?: string }).status === "CLOSED" && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-6 backdrop-blur"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 220, damping: 20 }}
                            className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 text-center shadow-xl"
                        >
                            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-success/15 text-success">
                                <Check className="size-7" />
                            </div>
                            <h2 className="font-display text-xl font-bold">Sessiya bitdi</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Restoran hesabı bağladı. Masadan rahat çıxa bilərsən — nuş olsun!
                            </p>
                            <Button className="mt-6 w-full" onClick={() => router.push("/restaurants")}>
                                Ana səhifəyə qayıt
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}