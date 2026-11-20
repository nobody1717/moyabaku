"use client";

import { useState, type FormEvent } from "react";
import { useStore, type ResolvedLine } from "@/lib/store";
import { CONTACTS } from "@/lib/types";
import { phoneOk, socialOk } from "@/lib/validate";
import Sheet from "./Sheet";
import { IconBag, IconCheck, IconLeft, IconMinus, IconPlus } from "./icons";

type Step = "cart" | "form" | "done";
const input = "h-12 w-full border bg-transparent px-4 text-[16px] text-bone outline-none transition-colors placeholder:text-mute/60 focus:border-bone";

export default function CartDrawer() {
  const { cartOpen, setCartOpen, lines, total, count, setQty, remove, clear, t, loc, lang } = useStore();
  const [step, setStep] = useState<Step>("cart");
  const [f, setF] = useState({ phone: "", social: "", name: "", comment: "" });
  const [errs, setErrs] = useState<{ contact?: string; phone?: string; social?: string }>({});
  const [sending, setSending] = useState(false);
  const [serverErr, setServerErr] = useState("");
  const [orderId, setOrderId] = useState("");

  if (!cartOpen) return null;
  const close = () => { setCartOpen(false); if (step === "done") { setStep("cart"); setF({ phone: "", social: "", name: "", comment: "" }); } };
  const stock = lines.filter((l) => l.product.status === "in_stock");
  const pre = lines.filter((l) => l.product.status === "preorder");
  const showForm = step === "form" && lines.length > 0;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: typeof errs = {};
    const ph = f.phone.trim(), so = f.social.trim();
    if (!ph && !so) er.contact = t("err_contact");
    else {
      if (ph && !phoneOk(ph)) er.phone = t("err_phone");
      if (so && !socialOk(so)) er.social = t("err_social");
    }
    setErrs(er);
    if (Object.keys(er).length) return;
    setSending(true);
    setServerErr("");
    try {
      const r = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang, phone: ph, social: so, name: f.name.trim(), comment: f.comment.trim(),
          items: lines.map((l) => ({ id: l.product.id, size: l.size, qty: l.qty })),
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error("send");
      setOrderId(j.orderId);
      clear();
      setStep("done");
    } catch {
      setServerErr(t("err_send"));
    } finally {
      setSending(false);
    }
  };

  const Group = ({ title, items }: { title: string; items: ResolvedLine[] }) =>
    items.length === 0 ? null : (
      <section aria-label={title}>
        <h3 className="mb-3 flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-mute">
          <span className={`h-1.5 w-1.5 rounded-full ${items[0].product.status === "preorder" ? "bg-warn" : "bg-ok"}`} aria-hidden="true" />
          {title}
        </h3>
        <ul className="divide-y divide-line border-y border-line">
          {items.map((l) => (
            <li key={l.key} className="flex gap-3 py-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.product.images[0]} alt="" className="h-24 w-[72px] flex-none object-cover" />
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="font-serif text-[18px] leading-tight text-bone">{loc(l.product.name)}</p>
                <p className="mt-1 text-[13px] text-mute">
                  {l.size ? `${t("size")}: ${l.size}` : ""}
                  {l.product.status === "preorder" && l.product.preorderDays ? `${l.size ? " · " : ""}${t("eta_short", { d: l.product.preorderDays })}` : ""}
                </p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center border border-line">
                    <button onClick={() => setQty(l.key, l.qty - 1)} aria-label={t("qty_dec")} className="grid h-11 w-11 place-items-center text-bone hover:bg-white/5"><IconMinus width={16} height={16} /></button>
                    <span className="min-w-6 text-center text-[14px] tabular-nums" aria-live="polite">{l.qty}</span>
                    <button onClick={() => setQty(l.key, l.qty + 1)} aria-label={t("qty_inc")} className="grid h-11 w-11 place-items-center text-bone hover:bg-white/5"><IconPlus width={16} height={16} /></button>
                  </div>
                  <span className="text-[14px] tabular-nums text-bone">{l.product.price * l.qty} AZN</span>
                </div>
                <button onClick={() => remove(l.key)} className="mt-1 self-start py-2 text-[12px] text-mute underline underline-offset-4 hover:text-bone">{t("remove")}</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    );

  return (
    <Sheet variant="drawer" label={t("cart")} onClose={close}>
      {step === "done" ? (
        <div className="flex flex-1 flex-col justify-center px-6 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center border border-line text-ok"><IconCheck width={26} height={26} /></span>
          <h2 className="mt-6 font-serif text-[32px] text-bone">{t("done_title")}</h2>
          <p className="mx-auto mt-3 max-w-xs text-[15px] leading-relaxed text-mute">{t("done_text")}</p>
          <p className="mt-8 text-[12px] uppercase tracking-[0.14em] text-mute">{t("order_no")}</p>
          <p className="mt-1 font-serif text-[28px] tracking-[0.12em] text-bone" data-testid="order-id">{orderId}</p>
          <div className="mt-8 grid gap-2">
            <a href={CONTACTS.telegram} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center bg-bone text-[13px] uppercase tracking-[0.16em] text-ink hover:bg-white">{t("write_tg")}</a>
            <a href={CONTACTS.instagram} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center border border-line text-[13px] uppercase tracking-[0.16em] text-bone hover:border-bone/60">{t("write_ig")}</a>
            <button onClick={close} className="h-12 text-[13px] text-mute hover:text-bone">{t("close")}</button>
          </div>
        </div>
      ) : (
        <>
          <header className="flex items-center gap-3 px-5 pb-4 pt-5 pr-16">
            {showForm && (
              <button onClick={() => setStep("cart")} aria-label={t("back")} className="-ml-2 grid h-11 w-11 place-items-center text-bone"><IconLeft /></button>
            )}
            <h2 className="font-serif text-[28px] leading-none text-bone">{showForm ? t("checkout") : t("cart")}</h2>
            {!showForm && count > 0 && <span className="text-[13px] tabular-nums text-mute">{count}</span>}
          </header>

          {!showForm ? (
            <>
              <div className="flex-1 space-y-8 overflow-y-auto overscroll-contain px-5 pb-6">
                {lines.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                    <IconBag width={32} height={32} className="text-mute" />
                    <p className="font-serif text-[22px] text-bone">{t("cart_empty")}</p>
                    <p className="text-[14px] text-mute">{t("cart_empty_hint")}</p>
                  </div>
                ) : (
                  <>
                    <Group title={t("in_stock")} items={stock} />
                    <Group title={t("preorder")} items={pre} />
                  </>
                )}
              </div>
              {lines.length > 0 && (
                <div className="space-y-3 border-t border-line p-4">
                  <div className="flex items-baseline justify-between px-1">
                    <span className="text-[12px] uppercase tracking-[0.14em] text-mute">{t("total")}</span>
                    <span className="font-serif text-[26px] tabular-nums text-bone">{total} AZN</span>
                  </div>
                  <button onClick={() => setStep("form")} className="h-[52px] w-full bg-bone text-[13px] uppercase tracking-[0.16em] text-ink hover:bg-white">{t("checkout")}</button>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 pb-6">
                <div>
                  <h3 className="text-[15px] text-bone">{t("contact_title")}</h3>
                  <p className={`mt-1 text-[13px] ${errs.contact ? "text-danger" : "text-mute"}`} role={errs.contact ? "alert" : undefined}>{errs.contact ?? t("contact_hint")}</p>
                </div>
                <div>
                  <label htmlFor="f-phone" className="mb-1.5 block text-[13px] text-mute">{t("phone")}</label>
                  <input id="f-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+994 ..." value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} aria-invalid={!!(errs.phone || errs.contact)} aria-describedby={errs.phone ? "e-phone" : undefined} className={`${input} ${errs.phone || errs.contact ? "border-danger" : "border-line"}`} />
                  {errs.phone && <p id="e-phone" role="alert" className="mt-1.5 text-[13px] text-danger">{errs.phone}</p>}
                </div>
                <div>
                  <label htmlFor="f-social" className="mb-1.5 block text-[13px] text-mute">{t("social")}</label>
                  <input id="f-social" type="text" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder={t("social_ph")} value={f.social} onChange={(e) => setF({ ...f, social: e.target.value })} aria-invalid={!!(errs.social || errs.contact)} aria-describedby={errs.social ? "e-social" : undefined} className={`${input} ${errs.social || errs.contact ? "border-danger" : "border-line"}`} />
                  {errs.social && <p id="e-social" role="alert" className="mt-1.5 text-[13px] text-danger">{errs.social}</p>}
                </div>
                <div>
                  <label htmlFor="f-name" className="mb-1.5 block text-[13px] text-mute">{t("name")}</label>
                  <input id="f-name" type="text" autoComplete="name" maxLength={80} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={`${input} border-line`} />
                </div>
                <div>
                  <label htmlFor="f-comment" className="mb-1.5 block text-[13px] text-mute">{t("comment")}</label>
                  <textarea id="f-comment" rows={3} maxLength={800} value={f.comment} onChange={(e) => setF({ ...f, comment: e.target.value })} className={`${input} h-auto border-line py-3`} />
                </div>
              </div>
              <div className="space-y-3 border-t border-line p-4">
                {serverErr && <p role="alert" className="text-[13px] leading-snug text-danger">{serverErr}</p>}
                <div className="flex items-baseline justify-between px-1">
                  <span className="text-[12px] uppercase tracking-[0.14em] text-mute">{t("total")}</span>
                  <span className="font-serif text-[26px] tabular-nums text-bone">{total} AZN</span>
                </div>
                <button type="submit" disabled={sending} className="h-[52px] w-full bg-bone text-[13px] uppercase tracking-[0.16em] text-ink hover:bg-white disabled:opacity-60">{sending ? t("sending") : t("send")}</button>
              </div>
            </form>
          )}
        </>
      )}
    </Sheet>
  );
}
