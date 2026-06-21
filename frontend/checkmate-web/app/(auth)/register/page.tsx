"use client";

import { GoogleAuthButton } from "@/components/google-auth-button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { AuthResponse } from "@/lib/types";
import { roleHome } from "@/lib/auth-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
    fullName: z.string().min(2, "Ad ən azı 2 simvol olmalıdır"),
    email: z.string().min(1, "Email daxil et").email("Düzgün email daxil et"),
    password: z.string().min(6, "Parol ən azı 6 simvol olmalıdır"),
    phone: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
    const router = useRouter();
    const setAuth = useAuth((s) => s.setAuth);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    const onSubmit = async (data: FormData) => {
        try {
            const res = await api.post<AuthResponse>("/auth/register", data);
            setAuth(res.data);
            toast.success("Qeydiyyat tamamlandı!");
            router.replace(roleHome(res.data.user.role));
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? "Qeydiyyat alınmadı");
        }
    };

    return (
        <div>
            <div className="mb-8 lg:hidden">
                <Link href="/" className="font-display text-2xl tracking-tight">
                    CheckMate<span className="text-primary">.</span>
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="font-display text-3xl font-semibold tracking-tight">
                    Hesab yarat
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Bir neçə saniyə — və masanı tutmağa hazırsan.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Ad Soyad</Label>
                    <Input
                        id="fullName"
                        placeholder="Hüseyn Əliyev"
                        {...register("fullName")}
                    />
                    {errors.fullName && (
                        <p className="text-sm text-destructive">{errors.fullName.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="ad@email.com"
                        {...register("email")}
                    />
                    {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Parol</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        {...register("password")}
                    />
                    {errors.password && (
                        <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Telefon (opsional)</Label>
                    <Input id="phone" placeholder="+994…" {...register("phone")} />
                </div>
                <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Yaradılır…" : "Qeydiyyatdan keç"}
                </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">və ya</span>
                <span className="h-px flex-1 bg-border" />
            </div>

            <GoogleAuthButton />

            <p className="mt-8 text-center text-sm text-muted-foreground">
                Hesabın var?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                    Daxil ol
                </Link>
            </p>
        </div>
    );
}