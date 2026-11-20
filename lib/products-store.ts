import { promises as fs } from "fs";
import path from "path";
import type { Product, Category, Status } from "./types";

const FILE = path.join(process.cwd(), "data", "products.json");

export async function readProducts(): Promise<Product[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Product[];
  } catch {
    return [];
  }
}

export async function writeProducts(list: Product[]) {
  const tmp = FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(list, null, 2), "utf8");
  await fs.rename(tmp, FILE);
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function sanitizeProducts(input: unknown): { ok: true; list: Product[] } | { ok: false; error: string } {
  if (!Array.isArray(input) || input.length > 300) return { ok: false, error: "Некорректный список" };
  const ids = new Set<string>();
  const list: Product[] = [];
  for (const raw of input) {
    const r = (raw ?? {}) as Record<string, any>;
    const id = str(r.id, 60);
    if (!/^[a-z0-9-]+$/.test(id)) return { ok: false, error: `Некорректный id: «${id}»` };
    if (ids.has(id)) return { ok: false, error: `Повторяющийся id: ${id}` };
    ids.add(id);
    const category = r.category as Category;
    if (!["outerwear", "shoes", "sets"].includes(category)) return { ok: false, error: `Категория: ${id}` };
    const status = r.status as Status;
    if (!["in_stock", "preorder"].includes(status)) return { ok: false, error: `Статус: ${id}` };
    const price = Number(r.price);
    if (!Number.isFinite(price) || price < 0) return { ok: false, error: `Цена: ${id}` };
    const sizes = (Array.isArray(r.sizes) ? r.sizes : []).map((s: unknown) => str(s, 8)).filter(Boolean).slice(0, 14);
    const images = (Array.isArray(r.images) ? r.images : [])
      .map((s: unknown) => str(s, 600))
      .filter((s: string) => s.startsWith("/") || /^https?:\/\//.test(s))
      .slice(0, 12);
    if (!images.length) return { ok: false, error: `Нужно хотя бы одно фото: ${id}` };
    const name = { az: str(r.name?.az, 160), ru: str(r.name?.ru, 160) };
    if (!name.az || !name.ru) return { ok: false, error: `Название AZ и RU: ${id}` };
    list.push({
      id, category, status, price, sizes, images, name,
      preorderDays: str(r.preorderDays, 20),
      description: { az: str(r.description?.az, 2000), ru: str(r.description?.ru, 2000) },
    });
  }
  return { ok: true, list };
}
