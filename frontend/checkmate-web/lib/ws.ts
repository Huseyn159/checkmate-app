import { Client } from "@stomp/stompjs";

export function createStompClient() {
    return new Client({
        brokerURL: `${process.env.NEXT_PUBLIC_WS_URL}/ws`,
        reconnectDelay: 3000,   // bağlantı qopsa 3s sonra yenidən qoşul
    });
}