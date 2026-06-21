"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Users } from "lucide-react";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import { useAuth } from "@/store/auth";
import { useMyRestaurants } from "@/hooks/use-dashboard";
import { useTables, useAddTable, useDeleteTable } from "@/hooks/use-tables";
import { ZONES, FEATURES, zoneOf, featureOf, zoneLabel } from "@/lib/table-catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TablesPage() {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const token = useAuth((s) => s.accessToken);
  useEffect(() => { if (hydrated && !token) router.push("/login"); }, [hydrated, token, router]);

  const { data: restaurants } = useMyRestaurants();
  const restaurant = restaurants?.[0];
  const { data: tables } = useTables(restaurant?.id ?? "");
  const addTable = useAddTable(restaurant?.id ?? "");
  const deleteTable = useDeleteTable(restaurant?.id ?? "");

  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [zone, setZone] = useState("MAIN");
  const [features, setFeatures] = useState<string[]>([]);

  if (!hydrated) return <div className="py-16 text-center text-muted-foreground">Yüklənir…</div>;
  if (!restaurant) return <div className="py-16 text-center text-muted-foreground">Restoranın yoxdur.</div>;

  const toggleFeature = (k: string) =>
      setFeatures((f) => (f.includes(k) ? f.filter((x) => x !== k) : [...f, k]));

  const add = async () => {
    if (!tableNumber || !capacity) { toast.error("Nömrə və tutum vacibdir"); return; }
    try {
      await addTable.mutateAsync({
        tableNumber: parseInt(tableNumber),
        capacity: parseInt(capacity),
        zone,
        features,
      });
      setTableNumber(""); setCapacity(""); setZone("MAIN"); setFeatures([]);
      toast.success("Masa əlavə olundu");
    } catch (e: any) { toast.error(e.response?.data?.message ?? "Alınmadı"); }
  };

  return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Masalar</h1>
          <p className="text-muted-foreground">{restaurant.name}</p>
        </div>

        {/* Yeni masa */}
        <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold">Yeni masa</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Masa nömrəsi</Label>
              <Input type="number" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="12" />
            </div>
            <div className="space-y-1.5">
              <Label>Tutum (nəfər)</Label>
              <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="4" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Zona</Label>
            <div className="flex flex-wrap gap-2">
              {ZONES.map((z) => {
                const Icon = z.icon;
                const active = zone === z.key;
                return (
                    <button key={z.key} type="button" onClick={() => setZone(z.key)}
                            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
                                active ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                    : "border-border bg-card hover:border-primary/40"}`}>
                      <Icon className="size-4" /> {z.label}
                    </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Xüsusiyyətlər</Label>
            <div className="flex flex-wrap gap-2">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                const active = features.includes(f.key);
                return (
                    <button key={f.key} type="button" onClick={() => toggleFeature(f.key)}
                            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
                                active ? "border-primary bg-accent text-primary"
                                    : "border-border bg-card text-muted-foreground hover:border-primary/40"}`}>
                      <Icon className="size-4" /> {f.label}
                    </button>
                );
              })}
            </div>
          </div>

          <Button onClick={add} disabled={addTable.isPending} className="gap-1.5">
            <Plus className="size-4" /> {addTable.isPending ? "Əlavə olunur…" : "Masa əlavə et"}
          </Button>
        </div>

        {/* Siyahı */}
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold">
            Masalar {tables?.length ? `(${tables.length})` : ""}
          </h2>
          {tables?.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
                Hələ masa yoxdur — yuxarıdan əlavə et.
              </div>
          ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {tables?.map((t) => {
                  const z = zoneOf(t.zone);
                  const ZIcon = z?.icon;
                  return (
                      <div key={t.id} className="rounded-2xl border border-border bg-card p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-display text-lg font-bold">#{t.tableNumber}</span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                                    {ZIcon && <ZIcon className="size-3" />} {zoneLabel(t.zone)}
                                                </span>
                            </div>
                            <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="size-3.5" /> {t.capacity} nəfər
                            </p>
                            {t.features?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {t.features.map((fk) => {
                                    const f = featureOf(fk);
                                    const FIcon = f?.icon;
                                    return (
                                        <span key={fk} className="inline-flex items-center gap-1 rounded-lg bg-accent px-2 py-0.5 text-xs font-medium text-primary">
                                                                {FIcon && <FIcon className="size-3" />} {f?.label ?? fk}
                                                            </span>
                                    );
                                  })}
                                </div>
                            )}
                          </div>
                          <button onClick={() => deleteTable.mutate(t.id)}
                                  className="shrink-0 rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                                  title="Sil">
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                  );
                })}
              </div>
          )}
        </div>
      </div>
  );
}