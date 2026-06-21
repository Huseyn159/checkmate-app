"use client";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";

export function ImageUpload({
                                value, onChange, label = "Şəkil",
                            }: { value: string; onChange: (url: string) => void; label?: string }) {
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File | undefined) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) { toast.error("Yalnız şəkil seç"); return; }
        setUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            onChange(url);
        } catch {
            toast.error("Şəkil yüklənmədi");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
                   onChange={(e) => handleFile(e.target.files?.[0])} />
            {value ? (
                <div className="relative">
                    <img src={value} alt="" className="h-40 w-full object-cover rounded-md border" />
                    <Button type="button" variant="secondary" size="sm" className="absolute top-2 right-2"
                            onClick={() => inputRef.current?.click()} disabled={uploading}>
                        {uploading ? "..." : "Dəyiş"}
                    </Button>
                </div>
            ) : (
                <Button type="button" variant="outline" className="w-full h-40 border-dashed"
                        onClick={() => inputRef.current?.click()} disabled={uploading}>
                    {uploading ? "Yüklənir..." : `+ ${label} seç`}
                </Button>
            )}
        </div>
    );
}