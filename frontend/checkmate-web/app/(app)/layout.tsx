import { Navbar } from "@/components/navbar";

export default function AppLayout({
                                      children,
                                  }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-dvh flex-col">
            <Navbar />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
                {children}
            </main>
        </div>
    );
}