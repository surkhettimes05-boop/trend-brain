import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkDatabase } from "../backend/db";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const db = await checkDatabase();
  res.json({
    status: db.ok ? "ok" : "needs_setup",
    database: db,
    ai: process.env.OPENAI_API_KEY ? "openai_configured" : process.env.OLLAMA_BASE_URL ? "ollama_configured" : "not_configured",
    runtime: "vercel",
  });
}
