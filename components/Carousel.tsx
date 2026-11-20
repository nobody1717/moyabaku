"use client";

import { useRef, useState } from "react";
import { IconLeft, IconRight } from "./icons";
import { useStore } from "@/lib/store";

export default function Carousel({ images, alt, className = "" }: { images: string[]; alt: string; className?: string }) {
  const { t } = useStore();
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const n = images.length;

  const go = (k: number) => {
    const el = ref.current;
    if (!el) return;
    const c = (k + n) % n;
    el.scrollTo({ left: c * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className={`relative bg-ink ${className}`}>
      <div
        ref={ref}
        onScroll={(e) => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="no-scrollbar absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {images.map((src, k) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={k}
            src={src}
            alt={`${alt} — ${k + 1}/${n}`}
            loading={k === 0 ? "eager" : "lazy"}
            draggable={false}
            className="h-full w-full min-w-full flex-none snap-center object-cover"
          />
        ))}
      </div>

      {n > 1 && (
        <>
          <button onClick={() => go(i - 1)} aria-label={t("prev_photo")} className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center bg-ink/60 text-bone hover:bg-ink md:grid">
            <IconLeft />
          </button>
          <button onClick={() => go(i + 1)} aria-label={t("next_photo")} className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center bg-ink/60 text-bone hover:bg-ink md:grid">
            <IconRight />
          </button>
          {/* индикаторы — телефон */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden" aria-hidden="true">
            {images.map((_, k) => (
              <span key={k} className={`h-[3px] transition-all duration-300 ${k === i ? "w-6 bg-bone" : "w-3 bg-bone/40"}`} />
            ))}
          </div>
          {/* миниатюры — десктоп */}
          <div className="absolute bottom-4 left-4 hidden gap-2 md:flex">
            {images.map((src, k) => (
              <button
                key={k}
                onClick={() => go(k)}
                aria-label={`${k + 1}/${n}`}
                aria-current={k === i}
                className={`h-[60px] w-12 overflow-hidden border transition-opacity ${k === i ? "border-bone opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
