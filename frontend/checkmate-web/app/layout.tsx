import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";

const jakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-jakarta",
    display: "swap",
});

export const metadata: Metadata = {
    title: "CheckMate",
    description: "Rezerv et, sifariş ver, hesabı böl.",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="az" className={jakarta.variable} suppressHydrationWarning>
        <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
            {children}
            <Toaster />
        </Providers>
        </body>
        </html>
    );
}