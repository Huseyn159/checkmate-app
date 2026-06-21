import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface ReviewResponse {
    id: string;
    userName: string;
    rating: number;
    comment?: string | null;
    createdAt: string;
}
export interface ReviewSummary {
    avgRating: number;
    totalRatings: number;
    reviews: ReviewResponse[];
}
export interface MyReview {
    canReview: boolean;
    myReview: ReviewResponse | null;
}

export function useReviews(restaurantId: string) {
    return useQuery({
        queryKey: ["reviews", restaurantId],
        queryFn: async () =>
            (await api.get<ReviewSummary>(`/restaurants/${restaurantId}/reviews`)).data,
        enabled: !!restaurantId,
    });
}

export function useMyReview(restaurantId: string, enabled: boolean) {
    return useQuery({
        queryKey: ["my-review", restaurantId],
        queryFn: async () =>
            (await api.get<MyReview>(`/restaurants/${restaurantId}/reviews/me`)).data,
        enabled: enabled && !!restaurantId,
    });
}

export function useSubmitReview(restaurantId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (body: { rating: number; comment?: string }) =>
            (await api.post<ReviewResponse>(`/restaurants/${restaurantId}/reviews`, body)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["reviews", restaurantId] });
            qc.invalidateQueries({ queryKey: ["my-review", restaurantId] });
            qc.invalidateQueries({ queryKey: ["restaurant", restaurantId] });
        },
    });
}