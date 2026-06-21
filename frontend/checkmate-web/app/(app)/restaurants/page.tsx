"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, QrCode, X, SlidersHorizontal, Navigation, Star, UtensilsCrossed } from "lucide-react";
import { useRestaurants, useDishSearch } from "@/hooks/use-restaurants";
import { RestaurantCard } from "@/components/restaurant-card";
import { categoryIcon } from "@/lib/categories";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const priceRank: Record<string, number> = { CHEAP: 1, MODERATE: 2, EXPENSIVE: 3 };
const priceLabel: Record<string, string> = { CHEAP: "₼", MODERATE: "₼₼", EXPENSIVE: "₼₼₼" };
const prices = [
    { label: "Hamısı", value: "" }, { label: "₼", value: "CHEAP" },
    { label: "₼₼", value: "MODERATE" }, { label: "₼₼₼", value: "EXPENSIVE" },
];
const sorts = [
    { label: "Reytinq", value: "rating" }, { label: "Yaxınlıq", value: "distance" },
    { label: "Ucuzdan", value: "priceAsc" }, { label: "Bahadan", value: "priceDesc" },
];
function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371, toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

function DishResultCard({ r }: { r: any }) {
    return (
        <Link href={`/restaurants/${r.id}`}
              className="group block overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/5">
            <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                {r.coverUrl ? <img src={r.coverUrl} alt={r.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    : <div className="flex h-full w-full items-center justify-center text-muted-foreground"><span className="font-display text-3xl">{r.name?.[0] ?? "?"}</span></div>}
                {(r.totalRatings ?? 0) > 0 && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/95 px-2.5 py-1 text-xs font-semibold shadow-sm">
                        <Star className="size-3.5 fill-warning text-warning" /> {Number(r.avgRating).toFixed(1)}
                    </div>
                )}
            </div>
            <div className="p-4 pb-3">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold leading-tight">{r.name}</h3>
                    <span className="shrink-0 text-sm font-medium text-muted-foreground">{priceLabel[r.priceRange ?? ""] ?? ""}</span>
                </div>
                {r.category && <p className="mt-1 text-sm text-muted-foreground">{r.category}</p>}
            </div>
            <div className="border-t border-border bg-muted/30 px-4 py-3">
                <p className="mb-2 text-xs font-medium text-primary">Axtardığın yemək burada var:</p>
                <div className="space-y-2">
                    {r.matchedDishes.slice(0, 3).map((d: any) => (
                        <div key={d.id} className="flex items-center gap-3">
                            {d.imageUrl ? <img src={d.imageUrl} alt={d.name} className="size-10 shrink-0 rounded-lg object-cover" />
                                : <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"><UtensilsCrossed className="size-4" /></div>}
                            <span className="min-w-0 flex-1 truncate text-sm font-medium">{d.name}</span>
                            <span className="shrink-0 text-sm font-semibold text-primary">{Number(d.price).toFixed(2)} ₼</span>
                        </div>
                    ))}
                </div>
            </div>
        </Link>
    );
}

export default function RestaurantsPage() {
    const { data, isLoading, isError } = useRestaurants({ size: 60 });
    const all = data?.content ?? [];

    const [mode, setMode] = useState<"restaurant" | "dish">("restaurant");
    const [search, setSearch] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [category, setCategory] = useState("");
    const [priceRange, setPriceRange] = useState("");
    const [sort, setSort] = useState("rating");
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [locating, setLocating] = useState(false);

    const { data: dishData, isLoading: dishLoading } = useDishSearch(mode === "dish" ? search : "");
    const categories = useMemo(() => Array.from(new Set(all.map((r) => r.category).filter(Boolean))) as string[], [all]);

    const requestLocation = () => {
        if (!navigator.geolocation) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setSort("distance"); setLocating(false); },
            () => setLocating(false), { enableHighAccuracy: true, timeout: 8000 });
    };

    const list = useMemo(() => {
        let l = [...all];
        const q = search.trim().toLowerCase();
        if (q) l = l.filter((r) => r.name?.toLowerCase().includes(q) || (r.category ?? "").toLowerCase().includes(q));
        if (category) l = l.filter((r) => r.category === category);
        if (priceRange) l = l.filter((r) => r.priceRange === priceRange);
        if (sort === "rating") l.sort((a, b) => Number(b.avgRating ?? 0) - Number(a.avgRating ?? 0));
        else if (sort === "priceAsc") l.sort((a, b) => (priceRank[a.priceRange ?? ""] ?? 9) - (priceRank[b.priceRange ?? ""] ?? 9));
        else if (sort === "priceDesc") l.sort((a, b) => (priceRank[b.priceRange ?? ""] ?? 0) - (priceRank[a.priceRange ?? ""] ?? 0));
        else if (sort === "distance" && coords) {
            const d = (r: any) => r.latitude != null && r.longitude != null ? haversine(coords.lat, coords.lng, r.latitude, r.longitude) : Infinity;
            l.sort((a, b) => d(a) - d(b));
        }
        return l;
    }, [all, search, category, priceRange, sort, coords]);

    const activeCount = (category ? 1 : 0) + (priceRange ? 1 : 0) + (sort !== "rating" ? 1 : 0);
    const reset = () => { setCategory(""); setPriceRange(""); setSort("rating"); };
    const chip = (active: boolean) =>
        `inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
            active ? "bg-primary text-primary-foreground shadow-sm" : "border border-border bg-card text-foreground hover:bg-muted"}`;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                        Harada yemək <span className="text-primary">istəyirsən?</span>
                    </h1>
                    <p className="mt-2 text-muted-foreground">Restoranları kəşf et, masa rezerv et, hesabı bölüş.</p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/session/join"><QrCode className="size-4" /> Masaya qoşul</Link>
                </Button>
            </div>

            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} className="h-12 rounded-xl pl-11"
                           placeholder={mode === "dish" ? "Yemək axtar (məs. kabab, suşi)…" : "Restoran axtar…"} />
                </div>
                <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-full border border-border p-0.5">
                        <button onClick={() => setMode("restaurant")}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${mode === "restaurant" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Restoran</button>
                        <button onClick={() => setMode("dish")}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${mode === "dish" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Yemək</button>
                    </div>
                    {mode === "restaurant" && (
                        <button onClick={() => setShowFilters((s) => !s)}
                                className="ml-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">
                            <SlidersHorizontal className="size-4" /> Filtr
                            {activeCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-primary text-xs text-primary-foreground">{activeCount}</span>}
                        </button>
                    )}
                </div>
            </div>

            {mode === "restaurant" && showFilters && (
                <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
                    <div>
                        <p className="mb-2 text-sm font-medium">Kateqoriya</p>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => setCategory("")} className={chip(category === "")}>Hamısı</button>
                            {categories.map((c) => { const Icon = categoryIcon(c);
                                return <button key={c} onClick={() => setCategory(category === c ? "" : c)} className={chip(category === c)}><Icon className="size-4" /> {c}</button>;
                            })}
                        </div>
                    </div>
                    <div>
                        <p className="mb-2 text-sm font-medium">Qiymət</p>
                        <div className="flex flex-wrap gap-2">
                            {prices.map((p) => <button key={p.label} onClick={() => setPriceRange(p.value)} className={chip(priceRange === p.value)}>{p.label}</button>)}
                        </div>
                    </div>
                    <div>
                        <p className="mb-2 text-sm font-medium">Sıralama</p>
                        <div className="flex flex-wrap gap-2">
                            {sorts.map((s) => <button key={s.value}
                                                      onClick={() => (s.value === "distance" && !coords ? requestLocation() : setSort(s.value))} className={chip(sort === s.value)}>
                                {s.value === "distance" && <Navigation className="size-3.5" />}
                                {s.value === "distance" && locating ? "Yer alınır…" : s.label}
                            </button>)}
                        </div>
                    </div>
                    {activeCount > 0 && (
                        <button onClick={reset} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                            <X className="size-4" /> Filtrləri sıfırla
                        </button>
                    )}
                </div>
            )}

            {mode === "dish" ? (
                dishLoading ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-80 w-full rounded-2xl" />)}</div>
                ) : search.trim().length < 2 ? (
                    <p className="text-sm text-muted-foreground">Yemək adı yaz (ən azı 2 hərf) — onu təklif edən restoranlar çıxacaq.</p>
                ) : !dishData || dishData.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-card p-10 text-center"><p className="text-muted-foreground">"{search}" yeməyini təklif edən restoran tapılmadı.</p></div>
                ) : (
                    <>
                        <p className="text-sm text-muted-foreground">{dishData.length} restoran «{search}» təklif edir</p>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{dishData.map((r) => <DishResultCard key={r.id} r={r} />)}</div>
                    </>
                )
            ) : (
                isLoading ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}</div>
                ) : isError ? (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">Restoranlar yüklənə bilmədi.</div>
                ) : list.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-card p-10 text-center"><p className="text-muted-foreground">Bu filtrə uyğun restoran tapılmadı.</p></div>
                ) : (
                    <>
                        <p className="text-sm text-muted-foreground">{list.length} restoran</p>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((r) => <RestaurantCard key={r.id} r={r} />)}</div>
                    </>
                )
            )}
        </div>
    );
}