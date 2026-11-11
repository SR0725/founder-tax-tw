import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

// Waitlist signups. Stores the email, the page language and the time. No IP, no user agent.
// The connection string comes from the Neon integration on Vercel (DATABASE_URL).

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

let tableReady: Promise<unknown> | null = null;

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  const sql = neon(url);
  tableReady ??= sql`
    CREATE TABLE IF NOT EXISTS waitlist (
      id         bigserial PRIMARY KEY,
      email      text NOT NULL UNIQUE,
      lang       text NOT NULL DEFAULT 'en',
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  return sql;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { email, lang, company } = (body ?? {}) as { email?: unknown; lang?: unknown; company?: unknown };

  // Honeypot: real visitors never see or fill the "company" field. Pretend it worked.
  if (typeof company === "string" && company.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const clean = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (clean.length > 254 || !EMAIL.test(clean)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const sql = db();
  if (!sql) {
    console.error("waitlist: DATABASE_URL is not set");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  try {
    await tableReady;
    await sql`
      INSERT INTO waitlist (email, lang)
      VALUES (${clean}, ${lang === "zh" ? "zh" : "en"})
      ON CONFLICT (email) DO NOTHING
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    tableReady = null;
    console.error("waitlist: insert failed", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
