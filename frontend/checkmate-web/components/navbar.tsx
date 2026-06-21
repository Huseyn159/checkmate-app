"use client";


import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Menu,
    LogOut,
    LayoutDashboard,
    ShieldCheck,
    PlusCircle,
    CalendarCheck,
} from "lucide-react";
import { useAuth } from "@/store/auth";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import { getInitials } from "@/lib/auth-nav";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetDescription,
    SheetClose,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [{ href: "/restaurants", label: "Restoranlar" }];

const ROLE_LABEL: Record<string, string> = {
    CUSTOMER: "Müştəri",
    OWNER: "Restoran sahibi",
    ADMIN: "Admin",
    STAFF: "İşçi",
};

export function Navbar() {
    const hydrated = useAuthHydrated();
    const router = useRouter();
    const pathname = usePathname();
    const user = useAuth((s) => s.user);
    const logout = useAuth((s) => s.logout);

    const handleLogout = () => {
        logout();
        router.push("/restaurants");
    };

    const isActive = (href: string) =>
        href === "/restaurants"
            ? pathname.startsWith("/restaurants")
            : pathname === href;

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                <Link href="/" className="font-display text-xl font-semibold tracking-tight">
                    CheckMate<span className="text-primary">.</span>
                </Link>

                <nav className="hidden items-center gap-1 md:flex">
                    {NAV.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                                isActive(item.href)
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                    {user?.role === "CUSTOMER" && (
                        <Link
                            href="/profile"
                            className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                                isActive("/profile")
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                        >
                            Rezervlərim
                        </Link>
                    )}
                </nav>

                <div className="hidden items-center gap-2 md:flex">
                    <ThemeToggle />
                    {!hydrated ? (
                        <div className="size-9 animate-pulse rounded-full bg-muted" />
                    ) : !user ? (
                        <>
                            <Button variant="ghost" asChild>
                                <Link href="/login">Daxil ol</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/register">Qeydiyyat</Link>
                            </Button>
                        </>
                    ) : (
                        <>
                            {user.role === "OWNER" && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/dashboard">Panel</Link>
                                </Button>
                            )}
                            {user.role === "ADMIN" && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/admin">Müraciətlər</Link>
                                </Button>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="rounded-full outline-none ring-offset-2 ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring">
                                        <Avatar className="size-9 ring-2 ring-transparent transition hover:ring-border">
                                            <AvatarImage
                                                src={user.avatarUrl ?? undefined}
                                                alt={user.fullName}
                                            />
                                            <AvatarFallback className="bg-secondary text-sm font-semibold text-secondary-foreground">
                                                {getInitials(user.fullName)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-60">
                                    <DropdownMenuLabel className="flex items-center gap-3 py-2">
                                        <Avatar className="size-9">
                                            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.fullName} />
                                            <AvatarFallback className="bg-secondary text-sm font-semibold text-secondary-foreground">
                                                {getInitials(user.fullName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">{user.fullName}</p>
                                            <p className="truncate text-xs font-normal text-muted-foreground">
                                                {ROLE_LABEL[user.role] ?? user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {user.role === "CUSTOMER" && (
                                        <>
                                            <DropdownMenuItem asChild>
                                                <Link href="/profile">
                                                    <CalendarCheck className="mr-2 size-4" />
                                                    Rezervlərim
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href="/dashboard/new">
                                                    <PlusCircle className="mr-2 size-4" />
                                                    Restoranını əlavə et
                                                </Link>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    {user.role === "OWNER" && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard">
                                                <LayoutDashboard className="mr-2 size-4" />
                                                Panel
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    {user.role === "ADMIN" && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin">
                                                <ShieldCheck className="mr-2 size-4" />
                                                Müraciətlər
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <LogOut className="mr-2 size-4" />
                                        Çıxış
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}
                </div>

                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Menyu">
                                <Menu className="size-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-72">
                            <SheetTitle className="font-display text-xl font-semibold">
                                CheckMate<span className="text-primary">.</span>
                            </SheetTitle>
                            <SheetDescription className="sr-only">Sayt naviqasiyası</SheetDescription>

                            <div className="mt-4 flex justify-end">
                                <ThemeToggle />
                            </div>

                            {hydrated && user && (
                                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                                    <Avatar className="size-10">
                                        <AvatarImage src={user.avatarUrl ?? undefined} alt={user.fullName} />
                                        <AvatarFallback className="bg-secondary text-sm font-semibold text-secondary-foreground">
                                            {getInitials(user.fullName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold">{user.fullName}</p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {ROLE_LABEL[user.role] ?? user.email}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex flex-col gap-1">
                                {NAV.map((item) => (
                                    <SheetClose asChild key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                                                isActive(item.href)
                                                    ? "bg-accent text-accent-foreground"
                                                    : "text-muted-foreground"
                                            }`}
                                        >
                                            {item.label}
                                        </Link>
                                    </SheetClose>
                                ))}
                                {user?.role === "CUSTOMER" && (
                                    <SheetClose asChild>
                                        <Link
                                            href="/profile"
                                            className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                                                isActive("/profile")
                                                    ? "bg-accent text-accent-foreground"
                                                    : "text-muted-foreground"
                                            }`}
                                        >
                                            Rezervlərim
                                        </Link>
                                    </SheetClose>
                                )}
                            </div>

                            <div className="mt-6 border-t border-border pt-6">
                                {!hydrated ? (
                                    <div className="h-9 animate-pulse rounded-md bg-muted" />
                                ) : !user ? (
                                    <div className="flex flex-col gap-2">
                                        <SheetClose asChild>
                                            <Button variant="outline" asChild>
                                                <Link href="/login">Daxil ol</Link>
                                            </Button>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Button asChild>
                                                <Link href="/register">Qeydiyyat</Link>
                                            </Button>
                                        </SheetClose>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {user.role === "OWNER" && (
                                            <SheetClose asChild>
                                                <Button variant="outline" asChild>
                                                    <Link href="/dashboard">Panel</Link>
                                                </Button>
                                            </SheetClose>
                                        )}
                                        {user.role === "ADMIN" && (
                                            <SheetClose asChild>
                                                <Button variant="outline" asChild>
                                                    <Link href="/admin">Müraciətlər</Link>
                                                </Button>
                                            </SheetClose>
                                        )}
                                        {user.role === "CUSTOMER" && (
                                            <SheetClose asChild>
                                                <Button variant="outline" asChild>
                                                    <Link href="/dashboard/new">Restoranını əlavə et</Link>
                                                </Button>
                                            </SheetClose>
                                        )}
                                        <Button
                                            variant="ghost"
                                            onClick={handleLogout}
                                            className="justify-start text-destructive hover:text-destructive"
                                        >
                                            <LogOut className="mr-2 size-4" />
                                            Çıxış
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}