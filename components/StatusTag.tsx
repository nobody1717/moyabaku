"use client";

import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";

export default function StatusTag({ p, long = false }: { p: Product; long?: boolean }) {
  const { t } = useStore();
  const pre = p.status === "preorder";
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] tracking-wide text-mute">
      <span className="inline-flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${pre ? "bg-warn" : "bg-ok"}`} aria-hidden="true" />
        <span className="text-bone/90">{pre ? t("preorder") : t("in_stock")}</span>
      </span>
      {pre && p.preorderDays && <span>{long ? t("eta", { d: p.preorderDays }) : t("eta_short", { d: p.preorderDays })}</span>}
    </span>
  );
}
