import { spawn } from "child_process";
import path from "path";
import { prisma } from "../db";

export interface GoogleTrendPoint {
  keyword: string;
  region: string;
  interest: number;
  growth: number | null;
  sourceUrl: string;
}

function runPythonCollector(keywords: string[], region: string): Promise<GoogleTrendPoint[]> {
  const scriptPath = path.join(process.cwd(), "backend", "python", "google_trends_collector.py");
  const python = process.env.PYTHON_BIN || "python";

  return new Promise((resolve, reject) => {
    const child = spawn(python, [scriptPath, "--region", region, "--keywords", keywords.join(",")], {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk.toString()));
    child.stderr.on("data", (chunk) => (stderr += chunk.toString()));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `Python collector exited with code ${code}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout) as GoogleTrendPoint[]);
      } catch (error) {
        reject(error);
      }
    });
  });
}

export async function collectGoogleTrends(keywords: string[], region = "NP") {
  const started = await prisma.collectorRun.create({
    data: { collector: "google-trends", status: "running", message: `Keywords: ${keywords.join(", ")}` },
  });

  try {
    const results = await runPythonCollector(keywords, region);
    const rows = results.map((item) => ({
      source: "Google Trends",
      sourceUrl: item.sourceUrl,
      keyword: item.keyword,
      title: `${item.keyword} search interest`,
      content: `Google Trends interest for ${item.keyword} in ${item.region}`,
      category: item.keyword,
      region: item.region,
      metricsJson: { interest: item.interest, growth: item.growth },
    }));

    if (rows.length > 0) {
      await prisma.signal.createMany({ data: rows });
    }

    await prisma.collectorRun.update({
      where: { id: started.id },
      data: {
        status: "success",
        finishedAt: new Date(),
        itemsCreated: rows.length,
        message: `Collected ${rows.length} Google Trends signals.`,
      },
    });

    return { status: "success", itemsCreated: rows.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.collectorRun.update({
      where: { id: started.id },
      data: {
        status: "unavailable",
        finishedAt: new Date(),
        message: `Google Trends collector unavailable: ${message}`,
      },
    });
    return {
      status: "unavailable",
      itemsCreated: 0,
      message:
        "Google Trends collection needs Python with pytrends installed and network access. Previous database data is kept.",
      detail: message,
    };
  }
}
