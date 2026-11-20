import { NextResponse } from "next/server";
import { readProducts } from "@/lib/products-store";
import { phoneOk, socialOk, normSocial } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const bad = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request) {
  let b: any;
  try { b = await req.json(); } catch { return bad("invalid_json"); }

  const lang = b?.lang === "az" ? "az" : "ru";
  const phone = typeof b?.phone === "string" ? b.phone.trim().slice(0, 40) : "";
  const social = typeof b?.social === "string" ? b.social.trim().slice(0, 40) : "";
  const name = typeof b?.name === "string" ? b.name.trim().slice(0, 80) : "";
  const comment = typeof b?.comment === "string" ? b.comment.trim().slice(0, 800) : "";

  if (!phone && !social) return bad("contact_required");
  if (phone && !phoneOk(phone)) return bad("phone_invalid");
  if (social && !socialOk(social)) return bad("social_invalid");
  if (!Array.isArray(b?.items) || b.items.length === 0 || b.items.length > 40) return bad("items_invalid");

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return bad("server_not_configured", 500);

  // Цены, названия и статусы берутся с сервера — клиенту не доверяем.
  const catalog = new Map((await readProducts()).map((p) => [p.id, p]));
  const lines: { title: string; size: string; qty: number; price: number; status: string }[] = [];
  for (const it of b.items) {
    const p = catalog.get(String(it?.id));
    const qty = Number(it?.qty);
    const size = String(it?.size ?? "");
    if (!p || !Number.isInteger(qty) || qty < 1 || qty > 20) return bad("items_invalid");
    if (p.sizes.length ? !p.sizes.includes(size) : size !== "") return bad("size_invalid");
    lines.push({ title: p.name.ru, size, qty, price: p.price, status: p.status });
  }

  const orderId = "MB-" + Date.now().toString(36).toUpperCase().slice(-5) + Math.random().toString(36).slice(2, 4).toUpperCase();
  const fmt = (l: (typeof lines)[number], i: number) =>
    `${i + 1}. ${esc(l.title)}${l.size ? ` — ${esc(l.size)}` : ""} × ${l.qty} — ${l.price * l.qty} AZN`;
  const stock = lines.filter((l) => l.status === "in_stock");
  const pre = lines.filter((l) => l.status === "preorder");
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);

  const parts = [
    `🛍 <b>Новый заказ ${orderId}</b>`,
    `🌐 Язык клиента: <b>${lang.toUpperCase()}</b>`,
    "",
    name && `👤 Имя: ${esc(name)}`,
    phone && `📞 Телефон: ${esc(phone)}`,
    social && `💬 Соцсети: ${esc(normSocial(social))}`,
    comment && `📝 Комментарий: ${esc(comment)}`,
    "",
    stock.length ? `<b>В наличии</b>\n${stock.map(fmt).join("\n")}` : "",
    pre.length ? `<b>Под предзаказ</b>\n${pre.map(fmt).join("\n")}` : "",
    "",
    `💰 <b>Итого: ${total} AZN</b>`,
  ];
  const text = parts.filter((x) => x !== false && x !== undefined && x !== null).join("\n").replace(/\n{3,}/g, "\n\n");

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
      cache: "no-store",
    });
    if (!r.ok) {
      console.error("Telegram error", r.status, await r.text());
      return bad("telegram_failed", 502);
    }
  } catch (e) {
    console.error("Telegram fetch failed", e);
    return bad("telegram_failed", 502);
  }
  return NextResponse.json({ ok: true, orderId });
}
