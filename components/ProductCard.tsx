"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import StatusTag from "./StatusTag";
import { IconCheck } from "./icons";

export default function ProductCard({ p }: { p: Product }) {
  const { t, loc, add, setOpenProduct } = useStore();
  const [picking, setPicking] = useState(false);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const done = () => {
    setPicking(false);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1400);
  };
  const onAdd = () => {
    if (p.sizes.length > 1) return setPicking((v) => !v);
    add(p, p.sizes[0] ?? "");
    done();
  };

  return (
    <article className="group flex flex-col">
      <button onClick={() => setOpenProduct(p)} className="block text-left" aria-label={loc(p.name)}>
        <span className="relative block aspect-[3/4] overflow-hidden bg-graphite">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.images[0]} alt="" loading="lazy" draggable={false} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out md:group-hover:scale-[1.03]" />
          {p.images[1] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.images[1]} alt="" loading="lazy" draggable={false} className="absolute inset-0 hidden h-full w-full object-cover opacity-0 transition-opacity duration-500 md:block md:group-hover:opacity-100" />
          )}
        </span>
        <span className="mt-3 block space-y-1.5">
          <StatusTag p={p} />
          <span className="block font-serif text-[20px] leading-[1.15] text-bone">{loc(p.name)}</span>
          <span className="block text-[14px] tabular-nums text-bone">{p.price} AZN</span>
          <span className="line-clamp-2 block text-[13px] leading-snug text-mute">{loc(p.description)}</span>
        </span>
      </button>

      <div className="mt-3">
        <button
          onClick={onAdd}
          aria-expanded={p.sizes.length > 1 ? picking : undefined}
          className={`flex min-h-11 w-full items-center justify-center gap-2 border px-2 py-2 text-center text-[12px] uppercase leading-tight tracking-[0.12em] transition-colors duration-200 ${added ? "border-bone bg-bone text-ink" : "border-line text-bone hover:border-bone/60"}`}
        >
          {added ? <><IconCheck width={16} height={16} />{t("added")}</> : t("add")}
        </button>
        {picking && (
          <div className="anim-fade mt-2" role="group" aria-label={t("choose_size")}>
            <p className="mb-1.5 text-[12px] text-mute">{t("choose_size")}</p>
            <div className="flex flex-wrap gap-1.5">
              {p.sizes.map((s) => (
                <button key={s} onClick={() => { add(p, s); done(); }} className="h-11 min-w-11 border border-line px-3 text-[14px] text-bone transition-colors hover:border-bone active:bg-bone active:text-ink">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
