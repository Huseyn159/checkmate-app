"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import { useAuth } from "@/store/auth";
import { useMyRestaurants } from "@/hooks/use-dashboard";
import { useMenu } from "@/hooks/use-restaurants";
import {
    useAddCategory, useAddItem, useDeleteItem, useDeleteCategory, useSubmitForReview,
} from "@/hooks/use-menu-management";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function AddItemForm({ categoryId, restaurantId, onDone }:
                     { categoryId: string; restaurantId: string; onDone: () => void }) {
    const addItem = useAddItem(restaurantId);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [prepTime, setPrepTime] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    const submit = async () => {
        if (!name || !price) { toast.error("Ad və qiymət vacibdir"); return; }
        try {
            await addItem.mutateAsync({
                categoryId, name, price: parseFloat(price),
                description: description || undefined,
                prepTimeMinutes: prepTime ? parseInt(prepTime) : undefined,
                imageUrl: imageUrl || undefined,
            });
            toast.success("Yemək əlavə olundu");
            onDone();
        } catch (e: any) { toast.error(e.response?.data?.message ?? "Alınmadı"); }
    };

    return (
        <div className="space-y-2 border rounded-md p-3 bg-muted/30">
            <Input placeholder="Yemək adı" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Qiymət (₼)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            <Input placeholder="Təsvir (ixtiyari)" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input placeholder="Hazırlanma vaxtı dəq (ixtiyari)" type="number" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} />
            <ImageUpload value={imageUrl} onChange={setImageUrl} label="yemək şəkli" />
            <div className="flex gap-2">
                <Button size="sm" onClick={submit} disabled={addItem.isPending}>Əlavə et</Button>
                <Button size="sm" variant="ghost" onClick={onDone}>Ləğv</Button>
            </div>
        </div>
    );
}

export default function MenuPage() {
    const router = useRouter();
    const hydrated = useAuthHydrated();
    const token = useAuth((s) => s.accessToken);
    useEffect(() => { if (hydrated && !token) router.push("/login"); }, [hydrated, token, router]);

    const { data: restaurants } = useMyRestaurants();
    const restaurant = restaurants?.[0];
    const { data: menu } = useMenu(restaurant?.id ?? "");

    const addCategory = useAddCategory(restaurant?.id ?? "");
    const deleteItem = useDeleteItem(restaurant?.id ?? "");
    const deleteCategory = useDeleteCategory(restaurant?.id ?? "");
    const submit = useSubmitForReview(restaurant?.id ?? "");

    const [newCat, setNewCat] = useState("");
    const [addingTo, setAddingTo] = useState<string | null>(null);

    if (!hydrated) return <div className="p-8">Yüklənir...</div>;
    if (!restaurant) return (
        <div className="p-8 max-w-3xl mx-auto">
            <p className="text-muted-foreground">Restoranın yoxdur. <Link href="/dashboard/new" className="underline">Yarat</Link></p>
        </div>
    );

    const createCat = async () => {
        if (!newCat.trim()) return;
        try { await addCategory.mutateAsync({ name: newCat.trim() }); setNewCat(""); }
        catch (e: any) { toast.error(e.response?.data?.message ?? "Alınmadı"); }
    };
    const doSubmit = async () => {
        try { await submit.mutateAsync(); toast.success("Təsdiqə göndərildi"); }
        catch (e: any) { toast.error(e.response?.data?.message ?? "Alınmadı"); }
    };

    return (
        <div className="p-8 max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{restaurant.name} — Menyu</h1>
                    <p className="text-sm text-muted-foreground">Status: {restaurant.status}</p>
                </div>
                <Link href="/dashboard" className="text-sm underline">← Dashboard</Link>
            </div>

            <div className="flex gap-2">
                <Input placeholder="Yeni kateqoriya" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
                <Button onClick={createCat} disabled={addCategory.isPending}>+ Kateqoriya</Button>
            </div>

            {menu?.length === 0 && <p className="text-muted-foreground">Hələ kateqoriya yoxdur</p>}

            {menu?.map((cat: any) => (
                <div key={cat.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold">{cat.name}</h2>
                        <Button size="sm" variant="ghost" onClick={() => deleteCategory.mutate(cat.id)}>Sil</Button>
                    </div>

                    {cat.items?.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-3 border-b pb-2">
                            {item.imageUrl && <img src={item.imageUrl} alt="" className="h-12 w-12 rounded object-cover" />}
                            <div className="flex-1">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">{Number(item.price).toFixed(2)} ₼</p>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => deleteItem.mutate(item.id)}>Sil</Button>
                        </div>
                    ))}

                    {addingTo === cat.id ? (
                        <AddItemForm categoryId={cat.id} restaurantId={restaurant.id} onDone={() => setAddingTo(null)} />
                    ) : (
                        <Button size="sm" variant="outline" onClick={() => setAddingTo(cat.id)}>+ Yemək əlavə et</Button>
                    )}
                </div>
            ))}

            {(restaurant.status === "DRAFT" || restaurant.status === "REJECTED") && (
                <Button onClick={doSubmit} disabled={submit.isPending} className="w-full">
                    {submit.isPending ? "Göndərilir..." : "Təsdiqə göndər"}
                </Button>
            )}
        </div>
    );
}