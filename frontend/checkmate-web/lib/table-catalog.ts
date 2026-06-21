import {
    Armchair, Sun, Trees, Wine, Crown,
    VolumeX, CigaretteOff, Mountain, Plug, Baby, DoorClosed,
    type LucideIcon,
} from "lucide-react";

export type CatalogItem = { key: string; label: string; icon: LucideIcon };

// Zonalar — backend TableZone enum ilə eyni açarlar
export const ZONES: CatalogItem[] = [
    { key: "MAIN", label: "Əsas zal", icon: Armchair },
    { key: "WINDOW", label: "Pəncərə", icon: Sun },
    { key: "TERRACE", label: "Terras", icon: Trees },
    { key: "BAR", label: "Bar", icon: Wine },
    { key: "VIP", label: "VIP", icon: Crown },
];

// Xüsusiyyətlər — sabit açarlar (masa + rezerv eyni işlədir)
export const FEATURES: CatalogItem[] = [
    { key: "quiet", label: "Səssiz", icon: VolumeX },
    { key: "non_smoke", label: "Siqaretsiz", icon: CigaretteOff },
    { key: "view", label: "Mənzərəli", icon: Mountain },
    { key: "outlet", label: "Rozetkalı", icon: Plug },
    { key: "kids", label: "Uşaq üçün", icon: Baby },
    { key: "private", label: "Kabinet", icon: DoorClosed },
];

export const zoneOf = (k: string) => ZONES.find((z) => z.key === k);
export const featureOf = (k: string) => FEATURES.find((f) => f.key === k);
export const zoneLabel = (k: string) => zoneOf(k)?.label ?? k;
export const featureLabel = (k: string) => featureOf(k)?.label ?? k;