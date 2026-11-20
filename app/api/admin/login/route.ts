import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return isAdmin(req) ? NextResponse.json({ ok: true }) : NextResponse.json({ ok: false }, { status: 401 });
}
