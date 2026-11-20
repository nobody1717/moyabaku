"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import Sheet from "./Sheet";
import Carousel from "./Carousel";
import StatusTag from "./StatusTag";
import { IconCheck } from "./icons";

export default function ProductSheet() {
  const { openProduct: p, setOpenProduct, t, loc, add } = useStore();
  const [size, setSize] = useState("");
  const [added, setAdded] = useState(false);
  const [err, setErr] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setSize(p && p.sizes.length === 1 ? p.sizes[0] : "");
    setAdded(false);
    setErr(false);
  }, [p?.id]);
  useEffect(() => () => clearTimeout(timer.current), []);

  if (!p) return null;
  const submit = () => {
    if (p.sizes.length > 1 && !size) return setErr(true);
    add(p, size || p.sizes[0] || "");
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
  };

  return (
    <Sheet variant="modal" label={loc(p.name)} onClose={() => setOpenProduct(null)}>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain md:grid md:grid-cols-2 md:overflow-hidden">
        <Carousel images={p.images} alt={loc(p.name)} className="aspect-[4/5] w-full md:aspect-auto md:h-full" />
        <div className="flex min-h-0 flex-col gap-5 px-5 pt-6 md:overflow-y-auto md:px-9 md:pt-10">
          <StatusTag p={p} long />
          <div>
            <h2 className="font-serif text-[32px] leading-[1.05] text-bone md:text-[40px]">{loc(p.name)}</h2>
            <p className="mt-3 text-[18px] tabular-nums text-bone">{p.price} AZN</p>
          </div>
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-mute">{loc(p.description)}</p>

          {p.sizes.length > 0 && (
            <div role="group" aria-label={t("size")}>
              <p className="mb-2 text-[12px] uppercase tracking-[0.14em] text-mute">{t("size")}</p>
              <div className="flex flex-wrap gap-2">
                {p.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSize(s); setErr(false); }}
                    aria-pressed={size === s}
                    className={`h-11 min-w-12 border px-3 text-[14px] transition-colors ${size === s ? "border-bone bg-bone text-ink" : "border-line text-bone hover:border-bone/60"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {err && <p role="alert" className="mt-2 text-[13px] text-danger">{t("size_required")}</p>}
            </div>
          )}

          <div className="sticky bottom-0 -mx-5 mt-auto border-t border-line bg-graphite px-5 pb-4 pt-3 md:-mx-9 md:px-9">
            <button
              onClick={submit}
              className={`flex h-[52px] w-full items-center justify-center gap-2 text-[13px] uppercase tracking-[0.16em] transition-colors duration-200 ${added ? "bg-bone/90 text-ink" : "bg-bone text-ink hover:bg-white"}`}
            >
              {added ? <><IconCheck width={18} height={18} />{t("added")}</> : `${t("add")} · ${p.price} AZN`}
            </button>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
