"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { IconClose } from "./icons";
import { useStore } from "@/lib/store";

/** Универсальная панель: на телефоне — bottom sheet, на десктопе — модальное окно или боковая шторка. */
export default function Sheet({ onClose, label, variant, children }: {
  onClose: () => void; label: string; variant: "modal" | "drawer"; children: ReactNode;
}) {
  const { t } = useStore();
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onClose);
  cb.current = onClose;

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const prevFocus = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cb.current();
      if (e.key === "Tab" && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input,textarea,select,[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      prevFocus?.focus?.();
    };
  }, []);

  const outer = variant === "modal" ? "items-end md:items-center md:justify-center" : "items-end md:items-stretch md:justify-end";
  const panel =
    variant === "modal"
      ? "sheet-modal h-[92dvh] md:h-[min(88dvh,780px)] md:w-[min(1040px,94vw)]"
      : "sheet-drawer h-[88dvh] md:h-full md:w-[440px]";

  return (
    <div className={`fixed inset-0 z-50 flex ${outer}`}>
      <div className="anim-fade absolute inset-0 bg-black/75" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`relative flex w-full flex-col rounded-t-[20px] border-t border-line bg-graphite outline-none md:rounded-none md:border ${panel}`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-white/20 md:hidden" aria-hidden="true" />
        <button
          onClick={onClose}
          aria-label={t("close")}
          className="absolute right-1.5 top-1.5 z-20 grid h-11 w-11 place-items-center bg-ink/60 text-bone transition-colors hover:bg-ink md:right-3 md:top-3"
        >
          <IconClose />
        </button>
        {children}
      </div>
    </div>
  );
}
