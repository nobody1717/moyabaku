"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translate, type Key } from "./i18n";
import type { CartLine, Category, L10n, Lang, Product, Status } from "./types";

export interface Filters { status: "all" | Status; category: "all" | Category }
export interface ResolvedLine { key: string; product: Product; size: string; qty: number }

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: Key, v?: Record<string, string | number>) => string;
  loc: (l: L10n) => string;
  products: Product[];
  filters: Filters;
  setFilters: (f: Filters) => void;
  lines: ResolvedLine[];
  count: number;
  total: number;
  add: (p: Product, size: string) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  openProduct: Product | null;
  setOpenProduct: (p: Product | null) => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  filterOpen: boolean;
  setFilterOpen: (v: boolean) => void;
}

const StoreCtx = createContext<Ctx | null>(null);
export const useStore = () => {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("StoreProvider missing");
  return c;
};

const CART_KEY = "moya-cart-v1";
export const lineKey = (id: string, size: string) => `${id}|${size}`;

export function StoreProvider({ initialLang, products, children }: { initialLang: Lang; products: Product[]; children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [filters, setFilters] = useState<Filters>({ status: "all", category: "all" });
  const [openProduct, setOpenProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {}
  }, [cart, hydrated]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    document.documentElement.lang = l;
    document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  const t = useCallback((k: Key, v?: Record<string, string | number>) => translate(lang, k, v), [lang]);
  const loc = useCallback((l: L10n) => l[lang] || l.ru || l.az, [lang]);

  const lines = useMemo<ResolvedLine[]>(() => {
    const map = new Map(products.map((p) => [p.id, p]));
    const out: ResolvedLine[] = [];
    for (const l of cart) {
      const product = map.get(l.productId);
      if (!product) continue;
      if (product.sizes.length ? !product.sizes.includes(l.size) : l.size !== "") continue;
      out.push({ key: lineKey(l.productId, l.size), product, size: l.size, qty: l.qty });
    }
    return out;
  }, [cart, products]);

  const count = lines.reduce((s, l) => s + l.qty, 0);
  const total = lines.reduce((s, l) => s + l.qty * l.product.price, 0);

  const add = useCallback((p: Product, size: string) => {
    setCart((c) => {
      const i = c.findIndex((l) => l.productId === p.id && l.size === size);
      if (i >= 0) return c.map((l, k) => (k === i ? { ...l, qty: Math.min(20, l.qty + 1) } : l));
      return [...c, { productId: p.id, size, qty: 1 }];
    });
  }, []);
  const setQty = useCallback((key: string, qty: number) => {
    setCart((c) =>
      c.flatMap((l) => (lineKey(l.productId, l.size) === key ? (qty < 1 ? [] : [{ ...l, qty: Math.min(20, qty) }]) : [l]))
    );
  }, []);
  const remove = useCallback((key: string) => setCart((c) => c.filter((l) => lineKey(l.productId, l.size) !== key)), []);
  const clear = useCallback(() => setCart([]), []);

  const value: Ctx = {
    lang, setLang, t, loc, products, filters, setFilters, lines, count, total,
    add, setQty, remove, clear, openProduct, setOpenProduct, cartOpen, setCartOpen, filterOpen, setFilterOpen,
  };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}
