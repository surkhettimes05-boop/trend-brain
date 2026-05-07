import { prisma } from "./db.js";
import { lifecycleStage, scoreTrend } from "./scoring.js";

const systemPrompt =
  "You are TrendBrain Core, an AI commerce intelligence system for Nepal. Your job is to convert internet, retailer, marketplace, and consumer signals into strategic business decisions. Do not give generic startup advice. Focus on Nepal ground reality, retailer behavior, distribution feasibility, margins, trend durability, and bad-bet detection.";

function asText(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value);
}

async function callOpenAI(payload: unknown) {
  if (!process.env.OPENAI_API_KEY) return null;
  const baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  const endpoint = baseUrl.endsWith("/chat/completions") ? baseUrl : `${baseUrl.replace(/\/$/, "")}/chat/completions`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Analyze these Nepal commerce signals and return JSON with trends, opportunities, risks, recommendations. Data: ${JSON.stringify(payload)}`,
        },
      ],
    }),
  });
  if (!response.ok) throw new Error(`OpenAI error ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
}

async function callOllama(payload: unknown) {
  if (!process.env.OLLAMA_BASE_URL) return null;
  const response = await fetch(`${process.env.OLLAMA_BASE_URL.replace(/\/$/, "")}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL ?? "llama3.1",
      stream: false,
      format: "json",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Analyze these Nepal commerce signals and return JSON with trends, opportunities, risks, recommendations. Data: ${JSON.stringify(payload)}`,
        },
      ],
    }),
  });
  if (!response.ok) throw new Error(`Ollama error ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return JSON.parse(data.message?.content ?? "{}");
}

function groupNames(signalTexts: string[]) {
  const counts = new Map<string, number>();
  for (const text of signalTexts) {
    const normalized = text.toLowerCase();
    for (const token of normalized.match(/[a-zA-Z][a-zA-Z ]{2,30}/g) ?? []) {
      const key = token.trim();
      if (key.length >= 3) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name]) => name);
}

export async function runAnalysis() {
  const [signals, productSignals, retailerSignals] = await Promise.all([
    prisma.signal.findMany({ orderBy: { collectedAt: "desc" }, take: 200 }),
    prisma.productSignal.findMany({ orderBy: { collectedAt: "desc" }, take: 200 }),
    prisma.retailerSignal.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
  ]);

  const payload = { signals, productSignals, retailerSignals };
  let aiOutput: any = null;
  let aiStatus = "not_configured";

  try {
    aiOutput = (await callOpenAI(payload)) ?? (await callOllama(payload));
    aiStatus = aiOutput ? "ai_generated" : "not_configured";
  } catch (error) {
    aiStatus = `ai_failed: ${error instanceof Error ? error.message : String(error)}`;
  }

  const namesFromData = new Set<string>();
  for (const signal of signals) namesFromData.add(signal.keyword);
  for (const signal of productSignals) namesFromData.add(signal.category || signal.productName);
  for (const signal of retailerSignals) namesFromData.add(signal.productName);
  groupNames([
    ...signals.map((signal) => `${signal.keyword} ${signal.title ?? ""} ${signal.content ?? ""}`),
    ...productSignals.map((signal) => `${signal.productName} ${signal.category ?? ""}`),
    ...retailerSignals.map((signal) => `${signal.productName} ${signal.note}`),
  ]).forEach((name) => namesFromData.add(name));

  const aiTrends = Array.isArray(aiOutput?.trends) ? aiOutput.trends : [];
  for (const name of [...namesFromData].filter(Boolean).slice(0, 25)) {
    const lower = name.toLowerCase();
    const relatedSignals = signals.filter((s) => asText([s.keyword, s.title, s.content]).toLowerCase().includes(lower));
    const relatedProducts = productSignals.filter((s) =>
      asText([s.productName, s.category, s.reviewText]).toLowerCase().includes(lower)
    );
    const relatedRetailer = retailerSignals.filter((s) => asText([s.productName, s.note]).toLowerCase().includes(lower));
    const scores = scoreTrend({ name, signals: relatedSignals, productSignals: relatedProducts, retailerSignals: relatedRetailer });
    const aiTrend = aiTrends.find((trend: any) => String(trend.name ?? "").toLowerCase() === lower);

    await prisma.trend.upsert({
      where: { name_region: { name, region: aiTrend?.region ?? "Nepal" } },
      create: {
        name,
        category: aiTrend?.category ?? relatedSignals[0]?.category ?? relatedProducts[0]?.category ?? relatedRetailer[0]?.category,
        region: aiTrend?.region ?? "Nepal",
        ...scores,
        lifecycleStage: aiTrend?.lifecycleStage ?? lifecycleStage(scores.finalScore, scores.velocityScore),
        summary: aiTrend?.summary ?? `Rule-based trend score from ${relatedSignals.length} search signals, ${relatedProducts.length} product signals, and ${relatedRetailer.length} retailer signals. AI status: ${aiStatus}.`,
        recommendation:
          aiTrend?.recommendation ??
          (scores.finalScore >= 65
            ? "Run a small Nepal retail test and validate reorder rate before scaling."
            : "Monitor until stronger retailer pull or verified demand growth appears."),
      },
      update: {
        category: aiTrend?.category ?? relatedSignals[0]?.category ?? relatedProducts[0]?.category ?? relatedRetailer[0]?.category,
        ...scores,
        lifecycleStage: aiTrend?.lifecycleStage ?? lifecycleStage(scores.finalScore, scores.velocityScore),
        summary: aiTrend?.summary ?? `Rule-based trend score from ${relatedSignals.length} search signals, ${relatedProducts.length} product signals, and ${relatedRetailer.length} retailer signals. AI status: ${aiStatus}.`,
        recommendation:
          aiTrend?.recommendation ??
          (scores.finalScore >= 65
            ? "Run a small Nepal retail test and validate reorder rate before scaling."
            : "Monitor until stronger retailer pull or verified demand growth appears."),
      },
    });
  }

  const ranked = await prisma.trend.findMany({ orderBy: { finalScore: "desc" }, take: 10 });
  const report = await prisma.aIReport.create({
    data: {
      title: "Latest Nepal Commerce Intelligence Report",
      region: "Nepal",
      summary:
        aiOutput?.summary ??
        `Analysis used real database signals. AI status: ${aiStatus}. No invented market data was added.`,
      opportunitiesJson:
        aiOutput?.opportunities ??
        ranked.slice(0, 5).map((trend) => ({ name: trend.name, score: trend.finalScore, recommendation: trend.recommendation })),
      risksJson: aiOutput?.risks ?? ranked.filter((trend) => trend.riskScore > 50).map((trend) => ({ name: trend.name, riskScore: trend.riskScore })),
      recommendationsJson:
        aiOutput?.recommendations ??
        ranked.slice(0, 5).map((trend) => ({ name: trend.name, action: trend.recommendation })),
    },
  });

  return { aiStatus, trendsUpdated: ranked.length, report };
}
