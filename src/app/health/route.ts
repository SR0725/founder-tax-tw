// Liveness probe for the host's health check and the ops dashboard.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ ok: true, version: process.env.RAY_VERSION ?? "dev" });
}
