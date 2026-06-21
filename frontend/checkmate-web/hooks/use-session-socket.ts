import { useEffect, useRef } from "react";
import { createStompClient } from "@/lib/ws";
import { useBill, usePay, BillResponse } from "@/hooks/use-bill";

export function useSessionSocket<T>(
    sessionId: string | undefined,
    onMessage: (data: T) => void
) {
    const cbRef = useRef(onMessage);
    cbRef.current = onMessage;

    useEffect(() => {
        if (!sessionId) return;
        const client = createStompClient();

        client.onConnect = () => {
            console.log("✅ WS qoşuldu, abunə:", sessionId);
            client.subscribe(`/topic/session/${sessionId}`, (msg) => {
                console.log("📨 WS mesaj gəldi", msg.body);
                cbRef.current(JSON.parse(msg.body));
            });
        };
        client.onStompError = (f) => console.error("❌ STOMP error", f);
        client.onWebSocketError = (e) => console.error("❌ WS error", e);
        client.onWebSocketClose = () => console.log("⚠️ WS bağlandı");

        client.activate();
        return () => { client.deactivate(); };
    }, [sessionId]);
}