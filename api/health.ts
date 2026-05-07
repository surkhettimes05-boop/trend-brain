import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const { checkDatabase } = await import("../backend/db");
    const db = await checkDatabase();
    res.json({
      status: db.ok ? "ok" : "needs_setup",
      database: db,
      env: {
        databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
        adminTokenConfigured: Boolean(process.env.ADMIN_API_TOKEN),
      },
      ai: process.env.OPENAI_API_KEY ? "openai_configured" : process.env.OLLAMA_BASE_URL ? "ollama_configured" : "not_configured",
      runtime: "vercel",
    });
  } catch (error) {
    res.status(500).json({
      status: "server_error",
      message: error instanceof Error ? error.message : String(error),
      env: {
        databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
        adminTokenConfigured: Boolean(process.env.ADMIN_API_TOKEN),
      },
      runtime: "vercel",
    });
  }
}
