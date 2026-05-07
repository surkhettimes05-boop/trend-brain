import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { registerApiRoutes } from "./backend/routes";
import { startCronJobs } from "./backend/cron";

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT ?? 3000);

  app.use((req, res, next) => {
    const allowedOrigin = process.env.ALLOWED_ORIGIN;
    if (allowedOrigin) {
      res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
      res.setHeader("Vary", "Origin");
    }
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Admin-Token");
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  });
  app.use(express.json({ limit: "2mb" }));
  registerApiRoutes(app);
  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("[API]", error);
    res.status(500).json({
      error: "backend_error",
      message: error instanceof Error ? error.message : String(error),
    });
  });
  startCronJobs();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`TrendBrain backend listening on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start TrendBrain backend", error);
  process.exit(1);
});
