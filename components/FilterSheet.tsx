"use client";

import { useStore, type Filters } from "@/lib/store";
import { CATEGORIES } from "@/lib/types";
import Sheet from "./Sheet";

export default function FilterSheet() {
  const { filterOpen, setFilterOpen, filters, setFilters, products, t } = useStore();
  if (!filterOpen) return null;

  const n = products.filter((p) => (filters.status === "all" || p.status === filters.status) && (filters.category === "all" || p.category === filters.category)).length;
  const opt = (on: boolean) => `h-12 border px-4 text-left text-[14px] transition-colors ${on ? "border-bone bg-bone text-ink" : "border-line text-bone hover:border-bone/60"}`;
  const statuses: Filters["status"][] = ["all", "in_stock", "preorder"];
  const cats: Filters["category"][] = ["all", ...CATEGORIES];

  return (
    <Sheet variant="drawer" label={t("filters")} onClose={() => setFilterOpen(false)}>
      <div className="flex-1 space-y-8 overflow-y-auto overscroll-contain px-5 pb-6 pt-6">
        <h2 className="font-serif text-[28px] text-bone">{t("filters")}</h2>
        <div role="group" aria-label={t("status")}>
          <p className="mb-3 text-[12px] uppercase tracking-[0.14em] text-mute">{t("status")}</p>
          <div className="grid gap-2">
            {statuses.map((s) => (
              <button key={s} className={opt(filters.status === s)} aria-pressed={filters.status === s} onClick={() => setFilters({ ...filters, status: s })}>{t(s)}</button>
            ))}
          </div>
        </div>
        <div role="group" aria-label={t("category")}>
          <p className="mb-3 text-[12px] uppercase tracking-[0.14em] text-mute">{t("category")}</p>
          <div className="grid gap-2">
            {cats.map((c) => (
              <button key={c} className={opt(filters.category === c)} aria-pressed={filters.category === c} onClick={() => setFilters({ ...filters, category: c })}>
                {c === "all" ? t("all") : t(`cat_${c}` as const)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2 border-t border-line p-4">
        <button onClick={() => setFilters({ status: "all", category: "all" })} className="h-[52px] border border-line px-5 text-[12px] uppercase tracking-[0.14em] text-bone hover:border-bone/60">{t("reset")}</button>
        <button onClick={() => setFilterOpen(false)} className="h-[52px] flex-1 bg-bone text-[13px] uppercase tracking-[0.16em] text-ink hover:bg-white">{t("show_n", { n })}</button>
      </div>
    </Sheet>
  );
}
