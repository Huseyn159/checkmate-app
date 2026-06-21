"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { ImageUpload } from "@/components/image-upload";
import { useCreateRestaurant } from "@/hooks/use-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MapPicker = dynamic(
    () => import("@/components/map-picker"),
    {
        ssr: false,
        loading: () => ( <div className="h-[300px] bg-muted rounded-md animate-pulse" />
        ),
    }
);

export default function NewRestaurantPage() {
    const router = useRouter();
    const create = useCreateRestaurant();

    const [form, setForm] = useState({
        name: "",
        description: "",
        category: "",
        priceRange: "MODERATE",
        address: "",
        phone: "",
        voen: "",
        coverUrl: "",
        lat: 40.4093,
        lng: 49.8671,
    });

    const set = (k: string, v: string | number) =>
        setForm((f) => ({
            ...f,
            [k]: v,
        }));

    const handlePick = useCallback((lat: number, lng: number) => {
        setForm((f) => ({
            ...f,
            lat,
            lng,
        }));
    }, []);

    const submit = async () => {
        if (!form.name || !form.category) {
            toast.error("Ad və kateqoriya vacibdir");
            return;
        }


if (!/^\d{10}$/.test(form.voen)) {
  toast.error("VÖEN 10 rəqəm olmalıdır");
  return;
}

if (!form.coverUrl) {
  toast.error("Foto (şəkil linki) vacibdir");
  return;
}

try {
  await create.mutateAsync(form);

  toast.success(
    "Restoran göndərildi — admin təsdiqi gözlənilir"
  );

  router.push("/dashboard");
} catch (e: any) {
  toast.error(
    e.response?.data?.message ?? "Alınmadı"
  );
}


    };

    return ( <div className="p-8 max-w-xl mx-auto space-y-4"> <h1 className="text-2xl font-bold">
        Restoranını qeydiyyatdan keçir </h1>

        <p className="text-sm text-muted-foreground">
            Göndərdikdən sonra admin yoxlayıb təsdiqləyəcək,
            sonra müştərilərə görünəcək.
        </p>

        <div className="space-y-3">
            <div>
                <Label>Ad</Label>
                <Input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                />
            </div>

            <div>
                <Label>Təsvir</Label>
                <Input
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                />
            </div>

            <div>
                <Label>Kateqoriya</Label>
                <Input
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    placeholder="Kafe, Restoran..."
                />
            </div>

            <div>
                <Label>Qiymət səviyyəsi</Label>

                <select
                    className="w-full border rounded-md h-10 px-3"
                    value={form.priceRange}
                    onChange={(e) =>
                        set("priceRange", e.target.value)
                    }
                >
                    <option value="CHEAP">Ucuz</option>
                    <option value="MODERATE">Orta</option>
                    <option value="EXPENSIVE">Bahalı</option>
                </select>
            </div>

            <div>
                <Label>Ünvan</Label>
                <Input
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                />
            </div>

            <div>
                <Label>Telefon</Label>
                <Input
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                />
            </div>

            <div>
                <Label>VÖEN (10 rəqəm)</Label>
                <Input
                    value={form.voen}
                    onChange={(e) =>
                        set(
                            "voen",
                            e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 10)
                        )
                    }
                    placeholder="1234567890"
                />
            </div>

            <div>
                <Label>Foto</Label>
                <ImageUpload value={form.coverUrl} onChange={(url) => set("coverUrl", url)} label="restoran fotosu" />
            </div>

            <div>
                <Label>Yer (xəritədə klik et)</Label>

                <MapPicker
                    lat={form.lat}
                    lng={form.lng}
                    onChange={handlePick}
                />

                <p className="text-xs text-muted-foreground mt-1">
                    Restoranın yerinə klik et ·{" "}
                    {form.lat.toFixed(5)},{" "}
                    {form.lng.toFixed(5)}
                </p>
            </div>
        </div>

        <Button
            onClick={submit}
            disabled={create.isPending}
            className="w-full"
        >
            {create.isPending
                ? "Göndərilir..."
                : "Göndər"}
        </Button>
    </div>


);
}
