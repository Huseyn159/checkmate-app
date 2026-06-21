"use client";

import Link from "next/link";
import { Star, MapPin } from "lucide-react";

type R = {
    id: string;
    name: string;
    category?: string;
    priceRange?: string;
    avgRating?: number;
    totalRatings?: number;
    coverUrl?: string | null;
    address?: string | null;
};

const priceLabel: Record<string, string> = {
    CHEAP: "₼",
    MODERATE: "₼₼",
    EXPENSIVE: "₼₼₼",
};

export function RestaurantCard({ r }: { r: R }) {
    return (
        <Link
            href={`/restaurants/${r.id}`}
            className="group block overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/5"
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                {r.coverUrl ? (
                    <img
                        src={r.coverUrl}
                        alt={r.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <span className="font-display text-3xl">{r.name?.[0] ?? "?"}</span>
                    </div>
                )}
                {(r.totalRatings ?? 0) > 0 && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/95 px-2.5 py-1 text-xs font-semibold shadow-sm">
                        <Star className="size-3.5 fill-warning text-warning" />
                        {Number(r.avgRating).toFixed(1)}
                    </div>
                )}
                {r.category && (
                    <span className="absolute bottom-3 left-3 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground shadow-sm">
            {r.category}
          </span>
                )}
            </div>
            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold leading-tight">
                        {r.name}
                    </h3>
                    <span className="shrink-0 text-sm font-medium text-muted-foreground">
            {priceLabel[r.priceRange ?? ""] ?? ""}
          </span>
                </div>
                {r.address && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" />
                        <span className="truncate">{r.address}</span>
                    </p>
                )}
            </div>
        </Link>
    );
}