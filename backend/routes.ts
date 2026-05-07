import type { Express } from "express";
import { collectDaraz } from "./collectors/daraz";
import { collectGoogleTrends } from "./collectors/googleTrends";
import { checkDatabase, prisma } from "./db";
import { runAnalysis } from "./aiAnalyzer";
import { darazCategories, trackedKeywords } from "../config/trackedKeywords.js";

const asyncRoute =
  (handler: any) =>
  (req: any, res: any, next: any) =>
    Promise.resolve(handler(req, res, next)).catch(next);

function staleStatus(finishedAt?: Date | null, hours = 24) {
  if (!finishedAt) return "needs_setup";
  return Date.now() - finishedAt.getTime() > hours * 60 * 60 * 1000 ? "stale" : "active";
}

function requireAdmin(req: any, res: any) {
  const token = process.env.ADMIN_API_TOKEN;
  if (!token) return true;
  const provided = req.headers.authorization?.replace(/^Bearer\s+/i, "") ?? req.headers["x-admin-token"];
  if (provided === token) return true;
  res.status(401).json({ error: "unauthorized", message: "Admin token is required for this endpoint." });
  return false;
}

function csvCell(value: unknown) {
  const text = value == null ? "" : typeof value === "string" ? value : JSON.stringify(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function registerApiRoutes(app: Express) {
  app.get("/health", asyncRoute(async (_req, res) => {
    const db = await checkDatabase();
    res.json({
      status: db.ok ? "ok" : "needs_setup",
      database: db,
      uptime: process.uptime(),
      ai: process.env.OPENAI_API_KEY ? "openai_configured" : process.env.OLLAMA_BASE_URL ? "ollama_configured" : "not_configured",
    });
  }));

  app.get("/api/health", asyncRoute(async (_req, res) => {
    const db = await checkDatabase();
    res.json({ status: db.ok ? "ok" : "needs_setup", database: db });
  }));

  app.get("/api/dashboard", asyncRoute(async (_req, res) => {
    const [signals, productSignals, retailerSignals, trends, collectors] = await Promise.all([
      prisma.signal.count(),
      prisma.productSignal.count(),
      prisma.retailerSignal.count(),
      prisma.trend.findMany({ orderBy: { finalScore: "desc" }, take: 20 }),
      prisma.collectorRun.findMany({ orderBy: { startedAt: "desc" }, take: 20 }),
    ]);
    const latestByCollector = new Map<string, (typeof collectors)[number]>();
    for (const collector of collectors) {
      if (!latestByCollector.has(collector.collector)) latestByCollector.set(collector.collector, collector);
    }
    res.json({
      activeSignals: signals + productSignals + retailerSignals,
      emergingTrends: trends.filter((trend) => ["Emerging", "Acceleration"].includes(trend.lifecycleStage)).length,
      opportunityScore: trends[0]?.finalScore ?? 0,
      systemHealth: [...latestByCollector.values()].some((run) => run.status === "failed") ? 70 : 95,
      collectors: [...latestByCollector.entries()].map(([collector, run]) => ({
        id: collector,
        name: collector,
        status: run.status === "success" ? staleStatus(run.finishedAt, collector === "daraz" ? 6 : 24) : run.status,
        lastFetch: run.finishedAt ?? run.startedAt,
        message: run.message,
        itemsCreated: run.itemsCreated,
      })),
    });
  }));

  app.get("/api/signals", asyncRoute(async (req, res) => {
    const limit = Math.min(Number(req.query.limit ?? 50), 200);
    const [signals, productSignals, retailerSignals] = await Promise.all([
      prisma.signal.findMany({ orderBy: { collectedAt: "desc" }, take: limit }),
      prisma.productSignal.findMany({ orderBy: { collectedAt: "desc" }, take: limit }),
      prisma.retailerSignal.findMany({ orderBy: { createdAt: "desc" }, take: limit }),
    ]);
    res.json({ signals, productSignals, retailerSignals });
  }));

  app.post("/api/retailer-signals", asyncRoute(async (req, res) => {
    const { retailerName, location, signalType, productName, category, note, urgency } = req.body ?? {};
    if (!retailerName || !location || !signalType || !productName || !note) {
      res.status(400).json({ error: "retailerName, location, signalType, productName, and note are required." });
      return;
    }
    const created = await prisma.retailerSignal.create({
      data: {
        retailerName,
        location,
        signalType,
        productName,
        category,
        note,
        urgency: Math.max(1, Math.min(10, Number(urgency ?? 5))),
      },
    });
    res.status(201).json(created);
  }));

  app.get("/api/trends", asyncRoute(async (_req, res) => {
    const trends = await prisma.trend.findMany({ orderBy: { finalScore: "desc" }, take: 50 });
    res.json(trends);
  }));

  app.get("/api/trends/:id", asyncRoute(async (req, res) => {
    const trend = await prisma.trend.findUnique({ where: { id: req.params.id } });
    if (!trend) {
      res.status(404).json({ error: "Trend not found" });
      return;
    }
    const [signals, productSignals, retailerSignals] = await Promise.all([
      prisma.signal.findMany({ where: { keyword: { contains: trend.name, mode: "insensitive" } }, orderBy: { collectedAt: "desc" }, take: 25 }),
      prisma.productSignal.findMany({ where: { productName: { contains: trend.name, mode: "insensitive" } }, orderBy: { collectedAt: "desc" }, take: 25 }),
      prisma.retailerSignal.findMany({ where: { productName: { contains: trend.name, mode: "insensitive" } }, orderBy: { createdAt: "desc" }, take: 25 }),
    ]);
    res.json({ trend, evidence: { signals, productSignals, retailerSignals } });
  }));

  app.post("/api/analyze", asyncRoute(async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const result = await runAnalysis();
    res.json(result);
  }));

  app.get("/api/reports/latest", asyncRoute(async (_req, res) => {
    const report = await prisma.aIReport.findFirst({ orderBy: { createdAt: "desc" } });
    res.json(report ?? { status: "unavailable", message: "No AI report exists yet. Run POST /api/analyze after collecting data." });
  }));

  app.get("/api/collectors", asyncRoute(async (_req, res) => {
    const runs = await prisma.collectorRun.findMany({ orderBy: { startedAt: "desc" }, take: 20 });
    const latest = new Map<string, (typeof runs)[number]>();
    for (const run of runs) {
      if (!latest.has(run.collector)) latest.set(run.collector, run);
    }
    res.json(
      [...latest.entries()].map(([collector, run]) => ({
        id: collector,
        name: collector === "google-trends" ? "Google Trends" : collector === "daraz" ? "Daraz Tracker" : collector,
        status: run.status === "success" ? staleStatus(run.finishedAt, collector === "daraz" ? 6 : 24) : run.status,
        lastFetch: run.finishedAt ?? run.startedAt,
        latency: run.finishedAt ? `${run.finishedAt.getTime() - run.startedAt.getTime()}ms` : "running",
        message: run.message,
        itemsCreated: run.itemsCreated,
      }))
    );
  }));

  app.get("/api/export/report.json", asyncRoute(async (_req, res) => {
    const report = await prisma.aIReport.findFirst({ orderBy: { createdAt: "desc" } });
    if (!report) {
      res.status(404).json({ error: "No report exists yet." });
      return;
    }
    res.setHeader("Content-Disposition", `attachment; filename="trendbrain-report-${report.createdAt.toISOString().slice(0, 10)}.json"`);
    res.json(report);
  }));

  app.get("/api/export/trends.csv", asyncRoute(async (_req, res) => {
    const trends = await prisma.trend.findMany({ orderBy: { finalScore: "desc" } });
    const headers = ["id", "name", "category", "region", "finalScore", "lifecycleStage", "summary", "recommendation", "updatedAt"];
    const lines = [headers.join(","), ...trends.map((trend) => headers.map((key) => csvCell((trend as any)[key])).join(","))];
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=\"trendbrain-trends.csv\"");
    res.send(lines.join("\n"));
  }));

  app.get("/api/export/signals.csv", asyncRoute(async (_req, res) => {
    const [signals, productSignals, retailerSignals] = await Promise.all([
      prisma.signal.findMany({ orderBy: { collectedAt: "desc" } }),
      prisma.productSignal.findMany({ orderBy: { collectedAt: "desc" } }),
      prisma.retailerSignal.findMany({ orderBy: { createdAt: "desc" } }),
    ]);
    const headers = ["type", "source", "name", "category", "region", "metrics", "collectedAt"];
    const rows = [
      ...signals.map((signal) => ["signal", signal.source, signal.keyword, signal.category, signal.region, signal.metricsJson, signal.collectedAt]),
      ...productSignals.map((signal) => ["product", signal.platform, signal.productName, signal.category, "Nepal", { price: signal.price, rating: signal.rating, reviewCount: signal.reviewCount }, signal.collectedAt]),
      ...retailerSignals.map((signal) => ["retailer", signal.retailerName, signal.productName, signal.category, signal.location, { urgency: signal.urgency, signalType: signal.signalType, note: signal.note }, signal.createdAt]),
    ];
    const lines = [headers.join(","), ...rows.map((row) => row.map(csvCell).join(","))];
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=\"trendbrain-signals.csv\"");
    res.send(lines.join("\n"));
  }));

  app.post("/api/collect/google-trends", asyncRoute(async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const keywords = Array.isArray(req.body?.keywords) && req.body.keywords.length ? req.body.keywords : trackedKeywords;
    res.json(await collectGoogleTrends(keywords, "NP"));
  }));

  app.post("/api/collect/daraz", asyncRoute(async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const queries = Array.isArray(req.body?.queries) && req.body.queries.length ? req.body.queries : darazCategories;
    const results = [];
    for (const query of queries) {
      results.push(await collectDaraz(query));
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    res.json({ results });
  }));
}
