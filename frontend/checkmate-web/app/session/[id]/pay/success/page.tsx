"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, X } from "lucide-react";
import { useConfirmCheckout } from "@/hooks/use-bill";
import { Button } from "@/components/ui/button";

export default function PaySuccessPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const confirm = useConfirmCheckout(id);
    const [state, setState] = useState<"loading" | "ok" | "error">("loading");
    const [msg, setMsg] = useState("");

    useEffect(() => {
        const cs = new URLSearchParams(window.location.search).get("cs");
        if (!cs) { setState("error"); setMsg("Ödəniş məlumatı tapılmadı."); return; }
        confirm.mutateAsync(cs)
            .then(() => {
                setState("ok");
                setTimeout(() => router.replace(`/session/${id}`), 1800);
            })
            .catch((e: any) => {
                setState("error");
                setMsg(e.response?.data?.message ?? "Ödəniş təsdiqlənmədi.");
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="grid min-h-[100svh] place-items-center px-4">
            <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 text-center">
                {state === "loading" && (
                    <>
                        <Loader2 className="mx-auto size-12 animate-spin text-primary" />
                        <h1 className="mt-4 font-display text-xl font-semibold">Ödəniş təsdiqlənir…</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Bir az gözlə.</p>
                    </>
                )}
                {state === "ok" && (
                    <>
                        <div className="mx-auto grid size-14 place-items-center rounded-full bg-success/15 text-success">
                            <Check className="size-7" />
                        </div>
                        <h1 className="mt-4 font-display text-xl font-semibold">Ödəniş uğurlu!</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Hesaba qaytarılırsan…</p>
                    </>
                )}
                {state === "error" && (
                    <>
                        <div className="mx-auto grid size-14 place-items-center rounded-full bg-destructive/10 text-destructive">
                            <X className="size-7" />
                        </div>
                        <h1 className="mt-4 font-display text-xl font-semibold">Alınmadı</h1>
                        <p className="mt-1 text-sm text-muted-foreground">{msg}</p>
                        <Link href={`/session/${id}`}>
                            <Button className="mt-5 w-full">Hesaba qayıt</Button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}