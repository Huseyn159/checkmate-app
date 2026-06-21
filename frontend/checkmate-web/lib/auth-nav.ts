export function roleHome(role?: string) {
    switch (role) {
        case "OWNER":
            return "/dashboard";
        case "ADMIN":
            return "/admin";
        case "CUSTOMER":
            return "/restaurants";
        default:
            return "/login";
    }
}

export function getInitials(name?: string) {
    if (!name) return "?";
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("");
}