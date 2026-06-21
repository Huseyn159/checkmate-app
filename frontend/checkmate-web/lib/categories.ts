import {
    UtensilsCrossed, Fish, Pizza, Soup, Coffee, Beef, Salad,
    Sandwich, IceCream, Drumstick, Wine,
} from "lucide-react";

const MAP: { match: string[]; icon: typeof Fish }[] = [
    { match: ["balıq", "balig", "dəniz", "deniz", "seafood", "fish"], icon: Fish },
    { match: ["italyan", "italian", "pizza", "pasta"], icon: Pizza },
    { match: ["milli", "azərbaycan", "kabab", "kebab", "milly"], icon: Drumstick },
    { match: ["fast", "burger", "donər", "doner"], icon: Sandwich },
    { match: ["kafe", "cafe", "qəhvə", "coffee", "brunch"], icon: Coffee },
    { match: ["şorba", "sorba", "soup"], icon: Soup },
    { match: ["sushi", "suşi", "yapon", "asia", "asiya"], icon: Fish },
    { match: ["salat", "salad", "vegan", "veget"], icon: Salad },
    { match: ["şirniyyat", "desert", "dessert", "pastry", "bakery"], icon: IceCream },
    { match: ["bar", "şərab", "wine", "pub"], icon: Wine },
    { match: ["steak", "ət", "et ", "grill", "mangal", "izgara"], icon: Beef },
];

export function categoryIcon(category?: string) {
    const c = (category ?? "").toLowerCase();
    for (const e of MAP) if (e.match.some((m) => c.includes(m))) return e.icon;
    return UtensilsCrossed;
}