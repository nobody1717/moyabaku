import { cookies, headers } from "next/headers";
import type { Lang } from "./types";

export async function getLang(): Promise<Lang> {
  const c = (await cookies()).get("lang")?.value;
  if (c === "az" || c === "ru") return c;
  const al = ((await headers()).get("accept-language") ?? "").toLowerCase();
  return al.startsWith("az") ? "az" : "ru";
}
