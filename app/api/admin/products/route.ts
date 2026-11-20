import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { readProducts, writeProducts, sanitizeProducts } from "@/lib/products-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, products: await readProducts() });
}

export async function PUT(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Некорректный JSON" }, { status: 400 }); }
  const res = sanitizeProducts(body?.products);
  if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  await writeProducts(res.list);
  return NextResponse.json({ ok: true, products: res.list });
}
