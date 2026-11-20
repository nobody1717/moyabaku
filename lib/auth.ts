import { createHash, timingSafeEqual } from "crypto";

const h = (s: string) => createHash("sha256").update(s).digest();

export function isAdmin(req: Request): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const got = req.headers.get("x-admin-password") ?? "";
  return timingSafeEqual(h(got), h(pw));
}
