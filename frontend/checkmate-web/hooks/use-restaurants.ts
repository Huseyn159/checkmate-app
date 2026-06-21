import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
    PageResponse, RestaurantSummary, RestaurantDetail, MenuCategory,
} from "@/lib/types";

export interface RestaurantFilters {
    category?: string;
    priceRange?: string;
    search?: string;
    size?: number;
}

export interface MatchedDish { id: string; name: string; price: number; imageUrl?: string | null; }
export interface DishSearchResult {
    id: string; name: string; category?: string; priceRange?: string;
    avgRating?: number; totalRatings?: number; coverUrl?: string | null; address?: string | null;
    latitude?: number | null; longitude?: number | null;
    matchedDishes: MatchedDish[];
}

export function useDishSearch(q: string) {
    return useQuery({
        queryKey: ["dish-search", q],
        queryFn: async () =>
            (await api.get<DishSearchResult[]>("/restaurants/dish-search", { params: { q } })).data,
        enabled: q.trim().length >= 2,
    });
}

export function useRestaurants(filters: RestaurantFilters) {
    return useQuery({
        queryKey: ["restaurants", filters],
        queryFn: async () => {
            const res = await api.get<PageResponse<RestaurantSummary>>("/restaurants", {
                params: {
                    category: filters.category || undefined,
                    priceRange: filters.priceRange || undefined,
                    search: filters.search || undefined,
                    size: filters.size ?? undefined,
                },
            });
            return res.data;
        },
    });
}

export function useRestaurant(id: string) {
    return useQuery({
        queryKey: ["restaurant", id],
        queryFn: async () => (await api.get<RestaurantDetail>(`/restaurants/${id}`)).data,
        enabled: !!id,
    });
}

export function useMenu(id: string) {
    return useQuery({
        queryKey: ["menu", id],
        queryFn: async () => (await api.get<MenuCategory[]>(`/restaurants/${id}/menu`)).data,
        enabled: !!id,
    });
}