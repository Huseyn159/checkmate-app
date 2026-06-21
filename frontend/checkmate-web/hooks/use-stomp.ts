import { useEffect, useRef } from "react";
import { createStompClient } from "@/lib/ws";

export function useStompTopic<T>(topic: string | undefined, onMessage: (data: T) => void) {
    const cbRef = useRef(onMessage);
    cbRef.current = onMessage;

    useEffect(() => {
        if (!topic) return;
        const client = createStompClient();
        client.onConnect = () => {
            client.subscribe(topic, (msg) => cbRef.current(JSON.parse(msg.body)));
        };
        client.activate();
        return () => { client.deactivate(); };
    }, [topic]);
}