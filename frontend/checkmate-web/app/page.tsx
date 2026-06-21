"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useInView, animate } from "framer-motion";
import {
    CalendarCheck,
    UtensilsCrossed,
    Users,
    Receipt,
    ArrowRight,
    ChevronDown,
} from "lucide-react";
import { useRef } from "react";
import { useAuth } from "@/store/auth";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import { roleHome } from "@/lib/auth-nav";
import { Button } from "@/components/ui/button";

// İstəsən bunu öz şəklinlə dəyiş (Cloudinary və ya public/ faylı da olar).
const HERO_IMAGE =
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2400&q=85";

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
const item = {
    hidden: { opacity: 0, y: 26 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

function Reveal({
                    children,
                    delay = 0,
                    className = "",
                }: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

function Stat({
                  value,
                  suffix = "",
                  label,
              }: {
    value: number;
    suffix?: string;
    label: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.5 });
    const [n, setN] = useState(0);
    useEffect(() => {
        if (!inView) return;
        const controls = animate(0, value, {
            duration: 1.4,
            ease: [0.22, 1, 0.36, 1],
            onUpdate: (v) => setN(Math.round(v)),
        });
        return () => controls.stop();
    }, [inView, value]);
    return (
        <div ref={ref} className="text-center">
            <div className="font-display text-4xl font-bold text-primary sm:text-5xl">
                {n}
                {suffix}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{label}</div>
        </div>
    );
}

const features = [
    {
        icon: CalendarCheck,
        title: "Ağıllı masa seçimi",
        desc: "Üstünlüklərinə görə (pəncərə, terras, səssiz) ən uyğun masa avtomatik ayrılır.",
    },
    {
        icon: UtensilsCrossed,
        title: "Masada birbaşa sifariş",
        desc: "QR ilə masaya qoşul, menyudan seç — mətbəx anında görür.",
    },
    {
        icon: Users,
        title: "Səsvermə ilə sifariş",
        desc: "Bölüşülən yeməyi masa birlikdə təsdiqləyir, kim ödəyəcəyi aydın olur.",
    },
    {
        icon: Receipt,
        title: "Hesabı ədalətlə böl",
        desc: "Hər kəs öz payını + bölüşülən hissəni + bəxşişi ödəyir. Mübahisə yoxdur.",
    },
];

const steps = [
    { n: "01", t: "Restoran seç", d: "Kəşf et, filtrlə, bəyəndiyini aç." },
    { n: "02", t: "Masanı tut", d: "Tarix, saat, zona seç — QR al." },
    { n: "03", t: "Gəl & qoşul", d: "Masadakı kodla sessiyaya qoşul." },
    { n: "04", t: "Sifariş & böl", d: "Sifariş ver, hesabı bölüş, öde." },
];

export default function Home() {
    const router = useRouter();
    const hydrated = useAuthHydrated();
    const user = useAuth((s) => s.user);
    const [scrolled, setScrolled] = useState(false);

    const { scrollY } = useScroll();
    const heroImgY = useTransform(scrollY, [0, 800], [0, 160]);
    const heroTextY = useTransform(scrollY, [0, 600], [0, 90]);
    const heroTextO = useTransform(scrollY, [0, 450], [1, 0]);
    const cueO = useTransform(scrollY, [0, 200], [1, 0]);

    useEffect(() => {
        if (hydrated && user) router.replace(roleHome(user.role));
    }, [hydrated, user, router]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    if (hydrated && user) return null;

    return (
        <div className="bg-background text-foreground">
            <header
                className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
                    scrolled ? "border-b border-border bg-background/80 backdrop-blur" : ""
                }`}
            >
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <Link
                        href="/"
                        className={`font-display text-xl tracking-tight ${
                            scrolled ? "" : "text-white"
                        }`}
                    >
                        CheckMate<span className="text-primary">.</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Button
                            asChild
                            variant="ghost"
                            className={scrolled ? "" : "text-white hover:bg-white/15 hover:text-white"}
                        >
                            <Link href="/login">Daxil ol</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/register">Qeydiyyat</Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero — parallaks + Ken Burns zoom */}
            <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
                <motion.div
                    style={{ y: heroImgY }}
                    className="absolute -top-[8%] left-0 h-[116%] w-full"
                >
                    <motion.div
                        initial={{ scale: 1.05 }}
                        animate={{ scale: 1.14 }}
                        transition={{
                            duration: 20,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatType: "reverse",
                        }}
                        className="h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
                    />
                </motion.div>

                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(180deg, rgba(18,13,10,0.72) 0%, rgba(18,13,10,0.5) 40%, rgba(18,13,10,0.9) 100%)",
                    }}
                />

                <motion.div
                    style={{ y: heroTextY, opacity: heroTextO }}
                    className="relative z-10 mx-auto max-w-3xl px-6 text-center text-white"
                >
                    <motion.div variants={container} initial="hidden" animate="show">
                        <motion.div
                            variants={item}
                            className="mb-6 inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/90 backdrop-blur"
                        >
                            Masaya gəl, qalanını biz edək
                        </motion.div>
                        <motion.h1
                            variants={item}
                            className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl"
                        >
                            Restoranı seç.
                            <br />
                            Masanı tut. <span className="text-primary">Hesabı böl.</span>
                        </motion.h1>
                        <motion.p
                            variants={item}
                            className="mx-auto mt-6 max-w-xl text-lg text-white/80"
                        >
                            Rezervasiya, masada sifariş və hesab bölüşmə — hamısı bir tətbiqdə.
                        </motion.p>
                        <motion.div
                            variants={item}
                            className="mt-9 flex flex-wrap items-center justify-center gap-3"
                        >
                            <Button asChild size="lg" className="h-12 px-6 text-base">
                                <Link href="/restaurants">
                                    Restoranları kəşf et
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="secondary"
                                className="h-12 bg-white/15 px-6 text-base text-white hover:bg-white/25"
                            >
                                <Link href="/register">Qeydiyyat</Link>
                            </Button>
                        </motion.div>
                    </motion.div>
                </motion.div>

                <motion.div
                    style={{ opacity: cueO }}
                    className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/70"
                >
                    <ChevronDown className="size-6 animate-bounce" />
                </motion.div>
            </section>

            {/* Features */}
            <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
                <Reveal className="mb-12 text-center">
                    <h2 className="font-display text-3xl font-bold sm:text-4xl">
                        Niyə CheckMate?
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        Yeməyə çıxmağın hər anını rahatlaşdırır.
                    </p>
                </Reveal>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((f, i) => {
                        const Icon = f.icon;
                        return (
                            <Reveal key={f.title} delay={i * 0.08}>
                                <div className="h-full rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5">
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-accent text-primary">
                                        <Icon className="size-6" />
                                    </div>
                                    <h3 className="mt-4 font-display text-lg font-semibold">
                                        {f.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {f.desc}
                                    </p>
                                </div>
                            </Reveal>
                        );
                    })}
                </div>
            </section>

            {/* How it works */}
            <section className="bg-muted/60 py-24">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <Reveal className="mb-12 text-center">
                        <h2 className="font-display text-3xl font-bold sm:text-4xl">
                            Necə işləyir?
                        </h2>
                    </Reveal>
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {steps.map((s, i) => (
                            <Reveal key={s.n} delay={i * 0.08}>
                                <div>
                  <span className="font-display text-5xl font-bold text-primary/25">
                    {s.n}
                  </span>
                                    <h3 className="mt-2 font-display text-lg font-semibold">{s.t}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="mx-auto max-w-5xl px-6 py-24">
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
                    <Stat value={120} suffix="+" label="Restoran" />
                    <Stat value={15} suffix=" dəq" label="Orta rezerv vaxtı" />
                    <Stat value={98} suffix="%" label="Məmnunluq" />
                </div>
            </section>

            {/* Final CTA */}
            <section className="bg-primary py-20 text-primary-foreground">
                <Reveal className="mx-auto max-w-3xl px-6 text-center">
                    <h2 className="font-display text-4xl font-bold sm:text-5xl">
                        Növbəti masan səni gözləyir
                    </h2>
                    <p className="mt-4 text-primary-foreground/85">
                        Bir neçə toxunuşla rezerv et, gəl və dadını çıxar.
                    </p>
                    <Button
                        asChild
                        size="lg"
                        variant="secondary"
                        className="mt-8 h-12 bg-white px-6 text-base text-primary hover:bg-white/90"
                    >
                        <Link href="/register">
                            İndi başla
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                </Reveal>
            </section>

            <footer className="border-t border-border py-10">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
          <span className="font-display text-lg text-foreground">
            CheckMate<span className="text-primary">.</span>
          </span>
                    <span>© 2026 CheckMate</span>
                    <div className="flex gap-4">
                        <Link href="/restaurants" className="hover:text-foreground">
                            Restoranlar
                        </Link>
                        <Link href="/login" className="hover:text-foreground">
                            Daxil ol
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}