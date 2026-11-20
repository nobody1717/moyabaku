import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "Нет файла" }, { status: 400 });
  const ext = EXT[file.type];
  if (!ext) return NextResponse.json({ ok: false, error: "Только JPG, PNG, WEBP, AVIF" }, { status: 400 });
  if (file.size > 6 * 1024 * 1024) return NextResponse.json({ ok: false, error: "Файл больше 6 МБ" }, { status: 400 });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), new Uint8Array(await file.arrayBuffer()));
  return NextResponse.json({ ok: true, url: `/api/uploads/${name}` });
}
