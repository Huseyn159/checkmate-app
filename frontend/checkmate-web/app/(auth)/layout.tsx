import Link from "next/link";

export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <div className="grid min-h-dvh lg:grid-cols-2">
            <div
                className="relative hidden bg-cover bg-center lg:block"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80')",
                }}
            >
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(to top, rgba(26,19,16,0.88), rgba(26,19,16,0.45) 45%, rgba(26,19,16,0.2))",
                    }}
                />
                <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
                    <Link href="/" className="font-display text-2xl tracking-tight">
                        CheckMate<span style={{ color: "#E8A06A" }}>.</span>
                    </Link>
                    <div className="max-w-md">
                        <h2 className="font-display text-4xl font-semibold leading-tight">
                            Masaya gəl, qalanını biz edək.
                        </h2>
                        <p className="mt-4 text-white/80">
                            Rezerv et, masada birbaşa sifariş ver, hesabı dostlarınla bölüş —
                            hamısı bir yerdə.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/70">
                        <span>Rezervasiya</span>
                        <span className="size-1 rounded-full bg-white/40" />
                        <span>Masada sifariş</span>
                        <span className="size-1 rounded-full bg-white/40" />
                        <span>Hesab bölüşmə</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-sm">{children}</div>
            </div>
        </div>
    );
}