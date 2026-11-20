"use client";

import { useStore } from "@/lib/store";
import { CONTACTS, type Lang } from "@/lib/types";
import Catalog from "./Catalog";
import ProductSheet from "./ProductSheet";
import CartDrawer from "./CartDrawer";
import FilterSheet from "./FilterSheet";
import { IconBag, IconFilter, IconArrow } from "./icons";

export default function Shop() {
  const { t, lang, setLang, count, filters, setFilters, setCartOpen, setFilterOpen } = useStore();
  const filtered = filters.status !== "all" || filters.category !== "all";
  const link = "py-2 text-[14px] text-bone/90 underline-offset-4 hover:underline";

  return (
    <>
      <header className="flex items-center justify-between px-5 pb-2 pt-[max(1.25rem,env(safe-area-inset-top))] md:px-10">
        <span className="font-serif text-[22px] tracking-[0.3em] text-bone">MOYA BAKU</span>
        <a href={CONTACTS.instagram} target="_blank" rel="noopener noreferrer" className="py-2 text-[12px] tracking-[0.14em] text-mute hover:text-bone">{CONTACTS.handle}</a>
      </header>

      <main className="pb-32">
        <section className="flex min-h-[56dvh] flex-col justify-end px-5 pb-14 pt-16 md:min-h-[62dvh] md:px-10">
          <p className="mb-5 text-[12px] uppercase tracking-[0.22em] text-mute">{t("tagline")}</p>
          <h1 className="max-w-[14ch] font-serif text-[clamp(44px,13vw,116px)] font-light leading-[0.95] text-bone">{t("hero_title")}</h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-mute">{t("hero_sub")}</p>
          <a href="#catalog" className="mt-8 inline-flex h-11 items-center gap-3 self-start border-b border-bone/40 text-[12px] uppercase tracking-[0.18em] text-bone transition-colors hover:border-bone">
            {t("catalog")} <IconArrow width={16} height={16} />
          </a>
        </section>

        <Catalog />

        <footer className="mt-24 border-t border-line px-5 pt-10 md:px-10">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <p className="font-serif text-[26px] tracking-[0.3em] text-bone">MOYA BAKU</p>
              <p className="mt-3 text-[14px] text-mute">{t("tagline")}</p>
            </div>
            <div>
              <p className="mb-3 text-[12px] uppercase tracking-[0.14em] text-mute">{t("contacts")}</p>
              <ul className="flex flex-col">
                <li><a className={link} href={CONTACTS.instagram} target="_blank" rel="noopener noreferrer">Instagram — {CONTACTS.handle}</a></li>
                <li><a className={link} href={CONTACTS.tiktok} target="_blank" rel="noopener noreferrer">TikTok — {CONTACTS.handle}</a></li>
                <li><a className={link} href={CONTACTS.telegram} target="_blank" rel="noopener noreferrer">Telegram — {CONTACTS.tgHandle}</a></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-[12px] uppercase tracking-[0.14em] text-mute">Phone / WhatsApp</p>
              <a className={link} href={`tel:+${CONTACTS.phoneRaw}`}>{CONTACTS.phone}</a>
              <p className="mt-1"><a className={link} href={CONTACTS.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a></p>
              <p className="mt-4 text-[14px] text-mute">{t("location")}</p>
            </div>
          </div>
          <p className="mt-12 pb-6 text-[12px] text-mute">© {new Date().getFullYear()} MOYA BAKU · {t("rights")}</p>
        </footer>
      </main>

      {/* Нижняя панель — зона большого пальца */}
      <nav aria-label="MOYA BAKU" className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex w-full max-w-md items-center gap-1 border border-line bg-ink/90 p-1 backdrop-blur-md">
          <button onClick={() => setFilterOpen(true)} className="relative flex h-12 flex-1 items-center justify-center gap-2 text-[12px] uppercase tracking-[0.14em] text-bone hover:bg-white/5">
            <IconFilter width={18} height={18} />
            {t("filters")}
            {filtered && <span className="h-1.5 w-1.5 rounded-full bg-warn" aria-hidden="true" />}
          </button>
          <div role="group" aria-label={t("language")} className="flex border-x border-line px-1">
            {(["az", "ru"] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className={`h-12 min-w-12 text-[12px] font-medium tracking-[0.14em] transition-colors ${lang === l ? "text-bone" : "text-mute hover:text-bone"}`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button onClick={() => setCartOpen(true)} className="flex h-12 flex-1 items-center justify-center gap-2 text-[12px] uppercase tracking-[0.14em] text-bone hover:bg-white/5">
            <IconBag width={18} height={18} />
            {t("cart")}
            <span key={count} className={`grid h-5 min-w-5 place-items-center px-1 text-[11px] tabular-nums ${count ? "anim-pop bg-bone text-ink" : "text-mute"}`} aria-live="polite">{count}</span>
          </button>
        </div>
      </nav>

      <FilterSheet />
      <ProductSheet />
      <CartDrawer />
    </>
  );
}
