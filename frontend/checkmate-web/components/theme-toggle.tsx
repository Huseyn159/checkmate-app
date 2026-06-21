"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return <div className="size-9" />;
    const isDark = resolvedTheme === "dark";
    return (
        <button onClick={() => setTheme(isDark ? "light" : "dark")} aria-label="Tema dəyiş"
                className="grid size-9 place-items-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted">
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
    );
}