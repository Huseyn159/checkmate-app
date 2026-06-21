"use client";

import { ReviewsSection } from "@/components/reviews-section";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, MapPin, Clock } from "lucide-react";
import { useRestaurant, useMenu } from "@/hooks/use-restaurants";
import { useAuth } from "@/store/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const priceLabel: Record<string, string> = {
    CHEAP: "₼",
    MODERATE: "₼₼",
    EXPENSIVE: "₼₼₼",
};

export default function RestaurantDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const token = useAuth((s) => s.accessToken);
    const { data: r, isLoading } = useRestaurant(id);
    const { data: menu } = useMenu(id);
    const [preview, setPreview] = useState<string | null>(null);

    const goReserve = () => {
        const target = `/restaurants/${id}/reserve`;
        if (!token) {
            router.push(`/login?redirect=${encodeURIComponent(target)}`);
        } else {
            router.push(target);
        }
    };

    if (isLoading || !r) {
        return (
            <div className="mx-auto max-w-2xl space-y-4">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6 pb-10">
            <div className="relative h-56 overflow-hidden rounded-2xl sm:h-72">
                {r.coverUrl ? (
                    <img src={r.coverUrl} alt={r.name} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="font-display text-5xl text-muted-foreground">
              {r.name?.[0] ?? "?"}
            </span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                <div className="absolute inset-x-5 bottom-5 text-white">
                    <div className="flex items-end justify-between gap-3">
                        <div>
                            <h1 className="font-display text-3xl font-semibold">{r.name}</h1>
                            <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur">
                  {r.category}
                </span>
                                <span className="rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur">
                  {priceLabel[r.priceRange] ?? r.priceRange}
                </span>
                            </div>
                        </div>
                        {(r.totalRatings ?? 0) > 0 && (
                            <div className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-2 backdrop-blur">
                                <Star className="size-4 fill-warning text-warning" />
                                <span className="font-medium">{Number(r.avgRating).toFixed(1)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Button
                onClick={goReserve}
                size="lg"
                className="h-12 w-full rounded-xl text-base font-semibold"
            >
                Masa rezerv et
            </Button>

            {r.description && (
                <div>
                    <h2 className="mb-2 font-display text-lg font-semibold">Haqqında</h2>
                    <p className="text-sm leading-7 text-muted-foreground">{r.description}</p>
                </div>
            )}

            {/* Düzəldilmiş xəritə linki hissəsi */}
            {r.address && r.latitude && r.longitude && (
                <a
                    href={`https://maps.google.com/?q=${r.latitude},${r.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition hover:bg-muted/50"
                >
                    <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 size-5 text-primary" />
                        <div>
                            <p className="text-xs text-muted-foreground">Ünvan</p>
                            <p className="font-medium">{r.address}</p>
                        </div>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-primary">Yol göstər</span>
                </a>
            )}

            <div>
                <h2 className="mb-4 font-display text-xl font-semibold">Menyu</h2>
                <div className="space-y-7">
                    {menu?.map((cat) => (
                        <div key={cat.id} className="space-y-3">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                {cat.name}
                            </h3>
                            <div className="space-y-3">
                                {cat.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`flex gap-4 rounded-2xl border border-border bg-card p-3 transition hover:shadow-sm ${
                                            item.isAvailable === false ? "opacity-60" : ""
                                        }`}
                                    >
                                        {item.imageUrl && (
                                            <button
                                                type="button"
                                                onClick={() => setPreview(item.imageUrl!)}
                                                className="shrink-0 overflow-hidden rounded-xl"
                                                aria-label={`${item.name} şəklini böyüt`}
                                            >
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="size-16 object-cover transition hover:scale-105"
                                                />
                                            </button>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <p className="font-medium">{item.name}</p>
                                                <span className="shrink-0 font-semibold text-primary">
                          {Number(item.price).toFixed(2)} ₼
                        </span>
                                            </div>
                                            {item.description && (
                                                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                                    {item.description}
                                                </p>
                                            )}
                                            {item.prepTimeMinutes ? (
                                                <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="size-3.5" /> {item.prepTimeMinutes} dəq
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {menu && menu.length === 0 && (
                        <p className="text-sm text-muted-foreground">Menyu hələ əlavə edilməyib.</p>
                    )}
                </div>
            </div>

            <ReviewsSection restaurantId={r.id} />

            {/* Şəkil böyütmə */}
            {preview && (
                <div
                    onClick={() => setPreview(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
                >
                    <img
                        src={preview}
                        alt=""
                        className="max-h-[70vh] max-w-sm rounded-2xl object-contain shadow-2xl"
                    />
                </div>
            )}
        </div>
    );
}