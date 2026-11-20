"use client";

import { useCallback, useEffect, useState } from "react";
import type { Category, Product } from "@/lib/types";

const blank = (): Product => ({
  id: "item-" + Date.now().toString(36), category: "outerwear", status: "in_stock", preorderDays: "", price: 0,
  sizes: ["S", "M", "L", "XL"], images: [], name: { az: "", ru: "" }, description: { az: "", ru: "" },
});
const CATS: [Category, string][] = [["outerwear", "Верхняя одежда"], ["shoes", "Обувь"], ["sets", "Комплекты"]];
const fld = "h-11 w-full border border-line bg-transparent px-3 text-[15px] text-bone outline-none focus:border-bone";
const lbl = "mb-1 block text-[12px] text-mute";

export default function AdminPage() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [list, setList] = useState<Product[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const call = useCallback(
    (url: string, password: string, init: RequestInit = {}) =>
      fetch(url, { ...init, headers: { ...(init.headers as Record<string, string>), "x-admin-password": password } }),
    []
  );

  const login = useCallback(async (password: string) => {
    setBusy(true);
    try {
      const r = await call("/api/admin/products", password);
      if (!r.ok) throw new Error();
      const j = await r.json();
      setList(j.products);
      setAuthed(true);
      setPw(password);
      sessionStorage.setItem("moya-admin", password);
      setMsg(null);
    } catch {
      sessionStorage.removeItem("moya-admin");
      setMsg({ ok: false, text: "Неверный пароль или ADMIN_PASSWORD не задан на сервере" });
    } finally {
      setBusy(false);
    }
  }, [call]);

  useEffect(() => {
    const saved = sessionStorage.getItem("moya-admin");
    if (saved) login(saved);
  }, [login]);

  const upd = (i: number, patch: Partial<Product>) => { setList((l) => l.map((p, k) => (k === i ? { ...p, ...patch } : p))); setDirty(true); };

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await call("/api/admin/products", pw, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ products: list }) });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error || "Ошибка сохранения");
      setList(j.products);
      setDirty(false);
      setMsg({ ok: true, text: "Сохранено. Изменения сразу видны на сайте." });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const upload = async (i: number, file: File) => {
    setBusy(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await call("/api/admin/upload", pw, { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error || "Ошибка загрузки");
      upd(i, { images: [...list[i].images, j.url] });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  if (!authed) {
    return (
      <main className="grid min-h-[100dvh] place-items-center px-5">
        <form onSubmit={(e) => { e.preventDefault(); login(pw); }} className="w-full max-w-sm space-y-4">
          <h1 className="font-serif text-[32px] tracking-[0.2em]">MOYA BAKU</h1>
          <p className="text-[13px] text-mute">Админка каталога</p>
          <label htmlFor="pw" className={lbl}>Пароль</label>
          <input id="pw" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} className={fld} />
          {msg && <p role="alert" className="text-[13px] text-danger">{msg.text}</p>}
          <button disabled={busy || !pw} className="h-12 w-full bg-bone text-[13px] uppercase tracking-[0.16em] text-ink disabled:opacity-50">Войти</button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 pb-32 pt-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-[28px] tracking-[0.2em]">MOYA BAKU · ADMIN</h1>
        <a href="/" className="text-[13px] text-mute underline underline-offset-4">На сайт</a>
      </header>

      <button onClick={() => { setList((l) => [blank(), ...l]); setOpen(0); setDirty(true); }} className="mb-6 h-11 border border-line px-5 text-[13px] hover:border-bone/60">+ Добавить товар</button>

      <ul className="space-y-3">
        {list.map((p, i) => (
          <li key={p.id} className="border border-line">
            <div className="flex items-center gap-3 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.images[0] || "/placeholder/a.svg"} alt="" className="h-16 w-12 flex-none object-cover" />
              <button onClick={() => setOpen(open === i ? null : i)} className="min-w-0 flex-1 text-left">
                <span className="block truncate text-[15px]">{p.name.ru || "—"}</span>
                <span className="block text-[13px] text-mute">{p.price} AZN · {p.sizes.join(", ")}</span>
              </button>
              <button
                onClick={() => upd(i, { status: p.status === "in_stock" ? "preorder" : "in_stock" })}
                className={`h-11 flex-none border px-3 text-[12px] ${p.status === "in_stock" ? "border-ok/50 text-ok" : "border-warn/50 text-warn"}`}
                aria-label="Переключить статус"
              >
                {p.status === "in_stock" ? "В наличии" : "Предзаказ"}
              </button>
            </div>

            {open === i && (
              <div className="grid gap-4 border-t border-line p-4 sm:grid-cols-2">
                <div><label className={lbl}>Название (RU)</label><input className={fld} value={p.name.ru} onChange={(e) => upd(i, { name: { ...p.name, ru: e.target.value } })} /></div>
                <div><label className={lbl}>Название (AZ)</label><input className={fld} value={p.name.az} onChange={(e) => upd(i, { name: { ...p.name, az: e.target.value } })} /></div>
                <div><label className={lbl}>Описание (RU)</label><textarea rows={4} className={`${fld} h-auto py-2`} value={p.description.ru} onChange={(e) => upd(i, { description: { ...p.description, ru: e.target.value } })} /></div>
                <div><label className={lbl}>Описание (AZ)</label><textarea rows={4} className={`${fld} h-auto py-2`} value={p.description.az} onChange={(e) => upd(i, { description: { ...p.description, az: e.target.value } })} /></div>
                <div><label className={lbl}>Цена, AZN</label><input type="number" min={0} className={fld} value={p.price} onChange={(e) => upd(i, { price: Number(e.target.value) })} /></div>
                <div>
                  <label className={lbl}>Категория</label>
                  <select className={fld} value={p.category} onChange={(e) => upd(i, { category: e.target.value as Category })}>
                    {CATS.map(([v, n]) => <option key={v} value={v} className="bg-ink">{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Статус</label>
                  <select className={fld} value={p.status} onChange={(e) => upd(i, { status: e.target.value as Product["status"] })}>
                    <option value="in_stock" className="bg-ink">В наличии</option>
                    <option value="preorder" className="bg-ink">Под предзаказ</option>
                  </select>
                </div>
                <div><label className={lbl}>Срок доставки при предзаказе (дней, напр. 10–14)</label><input className={fld} value={p.preorderDays} onChange={(e) => upd(i, { preorderDays: e.target.value })} /></div>
                <div className="sm:col-span-2">
                  <label className={lbl}>Размеры через запятую (пусто — один размер)</label>
                  <input key={p.id} className={fld} defaultValue={p.sizes.join(", ")} onBlur={(e) => upd(i, { sizes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
                </div>
                <div className="sm:col-span-2">
                  <label className={lbl}>Фото — по одной ссылке на строку (первое — обложка)</label>
                  <textarea key={p.id + ":" + p.images.length} rows={4} className={`${fld} h-auto py-2 font-mono text-[13px]`} defaultValue={p.images.join("\n")} onBlur={(e) => upd(i, { images: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} />
                  <label className="mt-2 inline-flex h-11 cursor-pointer items-center border border-line px-4 text-[13px] hover:border-bone/60">
                    Загрузить фото
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(i, f); e.target.value = ""; }} />
                  </label>
                </div>
                <div className="flex items-center justify-between sm:col-span-2">
                  <span className="text-[12px] text-mute">id: {p.id}</span>
                  <button onClick={() => { if (confirm("Удалить товар?")) { setList((l) => l.filter((_, k) => k !== i)); setOpen(null); setDirty(true); } }} className="h-11 px-3 text-[13px] text-danger">Удалить товар</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-ink/95 px-5 py-3 backdrop-blur-md" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <p role="status" className={`flex-1 text-[13px] ${msg ? (msg.ok ? "text-ok" : "text-danger") : "text-mute"}`}>{msg?.text ?? (dirty ? "Есть несохранённые изменения" : "")}</p>
          <button onClick={save} disabled={busy || !dirty} className="h-12 bg-bone px-6 text-[13px] uppercase tracking-[0.16em] text-ink disabled:opacity-40">Сохранить</button>
        </div>
      </div>
    </main>
  );
}
