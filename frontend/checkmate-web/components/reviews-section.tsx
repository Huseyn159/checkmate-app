"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/store/auth";
import { useReviews, useMyReview, useSubmitReview } from "@/hooks/use-reviews";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";

const initials = (n: string) =>
    n.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");

function Stars({ value, size = "size-4" }: { value: number; size?: string }) {
    return (
        <div className="flex">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`${size} ${
                        i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
                    }`}
                />
            ))}
        </div>
    );
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
                <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => onChange(i)}
                    className="p-1"
                >
                    <Star
                        className={`size-8 transition ${
                            i <= (hover || value) ? "fill-warning text-warning" : "text-muted-foreground/40"
                        }`}
                    />
                </button>
            ))}
        </div>
    );
}

export function ReviewsSection({ restaurantId }: { restaurantId: string }) {
    const user = useAuth((s) => s.user);
    const { data } = useReviews(restaurantId);
    const { data: mine } = useMyReview(restaurantId, !!user);
    const submit = useSubmitReview(restaurantId);

    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    useEffect(() => {
        if (mine?.myReview) {
            setRating(mine.myReview.rating);
            setComment(mine.myReview.comment ?? "");
        }
    }, [mine]);

    const handleSubmit = async () => {
        if (rating < 1) {
            toast.error("Ulduz seç");
            return;
        }
        try {
            await submit.mutateAsync({ rating, comment: comment.trim() || undefined });
            toast.success("Rəyin əlavə edildi");
            setOpen(false);
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? "Alınmadı");
        }
    };

    const avg = Number(data?.avgRating ?? 0);
    const total = data?.totalRatings ?? 0;
    const reviews = data?.reviews ?? [];

    return (
        <div>
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h2 className="font-display text-xl font-semibold">Rəylər</h2>
                    {total > 0 ? (
                        <div className="mt-1 flex items-center gap-2">
                            <Stars value={avg} />
                            <span className="text-sm text-muted-foreground">
                {avg.toFixed(1)} · {total} rəy
              </span>
                        </div>
                    ) : (
                        <p className="mt-1 text-sm text-muted-foreground">Hələ rəy yoxdur.</p>
                    )}
                </div>

                {user && mine?.canReview && (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                {mine?.myReview ? "Reyini yenilə" : "Qiymətləndir"}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {mine?.myReview ? "Reyini yenilə" : "Restoranı qiymətləndir"}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col items-center gap-4 py-2">
                                <StarInput value={rating} onChange={setRating} />
                                <Textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Təcrübən barədə bir neçə söz (istəyə bağlı)"
                                    maxLength={500}
                                    className="min-h-24"
                                />
                            </div>
                            <DialogFooter>
                                <Button onClick={handleSubmit} disabled={submit.isPending} className="w-full">
                                    {submit.isPending ? "Göndərilir…" : "Göndər"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {user && mine && !mine.canReview && (
                <p className="mb-4 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                    Qiymətləndirmək üçün əvvəlcə bu restoranda rezerv et.
                </p>
            )}

            <div className="space-y-3">
                {reviews.map((rv) => (
                    <div key={rv.id} className="rounded-2xl border border-border bg-card p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                  {initials(rv.userName)}
                </span>
                                <span className="text-sm font-medium">{rv.userName}</span>
                            </div>
                            <Stars value={rv.rating} />
                        </div>
                        {rv.comment && (
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{rv.comment}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}