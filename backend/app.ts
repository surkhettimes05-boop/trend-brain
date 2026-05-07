import express from "express";
import { registerApiRoutes } from "./routes.js";

export function createApp() {
  const app = express();

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

  return app;
}
