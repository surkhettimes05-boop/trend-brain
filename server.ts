import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { createApp } from "./backend/app";
import { startCronJobs } from "./backend/cron";

async function startServer() {
  const app = createApp();
  const port = Number(process.env.PORT ?? 3000);

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
