"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import ProductCard from "./ProductCard";

export default function Catalog() {
  const { products, filters, setFilters, t } = useStore();
  const list = useMemo(
    () => products.filter((p) => (filters.status === "all" || p.status === filters.status) && (filters.category === "all" || p.category === filters.category)),
    [products, filters]
  );
  const active = filters.status !== "all" || filters.category !== "all";
  const chip = "inline-flex h-9 items-center gap-2 border border-line px-3 text-[12px] tracking-wide text-bone hover:border-bone/60";

  return (
    <section id="catalog" className="scroll-mt-4 px-5 md:px-10">
      <div className="mb-6 flex items-end justify-between border-b border-line pb-4">
        <h2 className="font-serif text-[28px] leading-none text-bone">{t("catalog")}</h2>
        <span className="text-[12px] tabular-nums tracking-wide text-mute" aria-live="polite">{t("items_n", { n: list.length })}</span>
      </div>

      {active && (
        <div className="mb-6 flex flex-wrap gap-2">
          {filters.status !== "all" && (
            <button className={chip} onClick={() => setFilters({ ...filters, status: "all" })}>{t(filters.status)} <span aria-hidden="true">×</span></button>
          )}
          {filters.category !== "all" && (
            <button className={chip} onClick={() => setFilters({ ...filters, category: "all" })}>{t(`cat_${filters.category}` as const)} <span aria-hidden="true">×</span></button>
          )}
        </div>
      )}

      {list.length === 0 ? (
        <p className="py-24 text-center text-[15px] text-mute">{t("empty_catalog")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
          {list.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </section>
  );
}
