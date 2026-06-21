"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Menu,
    LogOut,
    CalendarCheck,
    UtensilsCrossed,
    Table2,
    ChefHat,
    PlusCircle,
    ShieldCheck,

} from "lucide-react";
import { User } from "@/lib/types";
import { useAuth } from "@/store/auth";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import { roleHome, getInitials } from "@/lib/auth-nav";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetDescription
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Section = "owner" | "admin";
type NavItem = {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
};

const OWNER_NAV: NavItem[] = [
    { href: "/dashboard", label: "Rezervlər", icon: CalendarCheck },
    { href: "/dashboard/menu", label: "Menyu", icon: UtensilsCrossed },
    { href: "/dashboard/tables", label: "Masalar", icon: Table2 },
    { href: "/dashboard/kitchen", label: "Mətbəx", icon: ChefHat },
    { href: "/dashboard/new", label: "Restoran əlavə et", icon: PlusCircle },
];

const ADMIN_NAV: NavItem[] = [
    { href: "/admin", label: "Müraciətlər", icon: ShieldCheck },
];

function LoadingScreen() {
    return (
        <div className="grid min-h-dvh place-items-center text-sm text-muted-foreground">
            Yüklənir…
        </div>
    );
}

function PanelSidebar({
                          section,
                          nav,
                          user,
                          pathname,
                          onLogout,
                          onNavigate,
                      }: {
    section: Section;
    nav: NavItem[];
    user: User;
    pathname: string;
    onLogout: () => void;
    onNavigate?: () => void;
}) {
    const isActive = (href: string) =>
        href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

    return (
        <div className="flex h-full flex-col">
            <div className="flex h-16 items-center px-5">
                <Link href="/" className="font-display text-xl tracking-tight">
                    CheckMate<span className="text-primary">.</span>
                </Link>
                <span className="ml-2 rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
          {section === "owner" ? "Panel" : "Admin"}
        </span>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-2">
                {nav.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                                active
                                    ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]"
                                    : "text-muted-foreground hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]"
                            }`}
                        >
                            <Icon className="size-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-[var(--sidebar-border)] p-3">
                <div className="flex items-center gap-3 px-2 py-2">
                    <Avatar className="size-9">
                        <AvatarImage src={user.avatarUrl ?? undefined} alt={user.fullName} />
                        <AvatarFallback className="bg-secondary text-sm text-secondary-foreground">
                            {getInitials(user.fullName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{user.fullName}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    onClick={() => {
                        onNavigate?.();
                        onLogout();
                    }}
                    className="mt-1 w-full justify-start text-destructive hover:text-destructive"
                >
                    <LogOut className="mr-2 size-4" />
                    Çıxış
                </Button>
            </div>
        </div>
    );
}

export function PanelShell({
                               section,
                               children,
                           }: {
    section: Section;
    children: React.ReactNode;
}) {
    const hydrated = useAuthHydrated();
    const router = useRouter();
    const pathname = usePathname();
    const user = useAuth((s) => s.user);
    const logout = useAuth((s) => s.logout);
    const [mobileOpen, setMobileOpen] = useState(false);

    const onboarding = section === "owner" && pathname === "/dashboard/new";
    const required = section === "owner" ? "OWNER" : "ADMIN";

    useEffect(() => {
        if (!hydrated) return;
        if (!user) {
            router.replace("/login");
            return;
        }
        if (onboarding) return;
        if (user.role !== required) router.replace(roleHome(user.role));
    }, [hydrated, user, onboarding, required, router]);

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    if (!hydrated || !user) return <LoadingScreen />;
    if (!onboarding && user.role !== required) return <LoadingScreen />;

    const handleLogout = () => {
        logout();
        router.push("/restaurants");
    };

    if (onboarding) {
        return (
            <div className="flex min-h-dvh flex-col bg-background">
                <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
                    <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
                        <Link href="/" className="font-display text-xl tracking-tight">
                            CheckMate<span className="text-primary">.</span>
                        </Link>
                        {user.role === "OWNER" && (
                            <Button variant="ghost" asChild>
                                <Link href="/dashboard">Panelə qayıt</Link>
                            </Button>
                        )}
                    </div>
                </header>
                <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
                    {children}
                </main>
            </div>
        );
    }

    const nav = section === "owner" ? OWNER_NAV : ADMIN_NAV;

    return (
        <div className="flex min-h-dvh bg-background">
            <aside className="hidden w-64 shrink-0 border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] md:block">
                <div className="sticky top-0 h-dvh">
                    <PanelSidebar
                        section={section}
                        nav={nav}
                        user={user}
                        pathname={pathname}
                        onLogout={handleLogout}
                    />
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:hidden">
                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Menyu">
                                <Menu className="size-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72 bg-[var(--sidebar)] p-0">
                            <SheetTitle className="sr-only">Panel naviqasiyası</SheetTitle>
                            <SheetDescription className="sr-only">Bölmələr</SheetDescription>
                            <PanelSidebar
                                section={section}
                                nav={nav}
                                user={user}
                                pathname={pathname}
                                onLogout={handleLogout}
                                onNavigate={() => setMobileOpen(false)}
                            />
                        </SheetContent>
                    </Sheet>
                    <Link href="/" className="font-display text-lg tracking-tight">
                        CheckMate<span className="text-primary">.</span>
                    </Link>
                </header>

                <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}