import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "../db";

const complaintWords = [
  "broken",
  "damage",
  "damaged",
  "fake",
  "duplicate",
  "late",
  "expired",
  "bad",
  "poor",
  "leak",
  "missing",
  "not good",
  "return",
  "quality",
];

function detectComplaints(text: string) {
  const normalized = text.toLowerCase();
  return complaintWords.filter((word) => normalized.includes(word));
}

function parseNumber(text: string) {
  const cleaned = text.replace(/,/g, "").match(/\d+(\.\d+)?/);
  return cleaned ? Number(cleaned[0]) : null;
}

export async function collectDaraz(query: string) {
  const sourceUrl = `https://www.daraz.com.np/catalog/?q=${encodeURIComponent(query)}`;
  const ajaxUrl = `https://www.daraz.com.np/catalog/?ajax=true&q=${encodeURIComponent(query)}`;
  const started = await prisma.collectorRun.create({
    data: { collector: "daraz", status: "running", message: `Query: ${query}` },
  });

  try {
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 AppleWebKit-compatible TrendBrainResearchBot/1.0",
      "Accept-Language": "en-US,en;q=0.9",
    };

    const ajaxResponse = await axios.get(ajaxUrl, {
      timeout: 20000,
      headers: { ...headers, Accept: "application/json,text/plain,*/*" },
    });
    const ajaxItems = Array.isArray(ajaxResponse.data?.mods?.listItems) ? ajaxResponse.data.mods.listItems : [];
    const created = ajaxItems.slice(0, 20).map((item: any) => {
      const productName = String(item.name ?? "").trim();
      const reviewText = Array.isArray(item.description) ? item.description.join(" ") : null;
      const href = item.itemUrl ? new URL(String(item.itemUrl), "https://www.daraz.com.np").toString() : sourceUrl;
      return {
        platform: "Daraz",
        productName,
        category: query,
        price: item.price ? Number(item.price) : parseNumber(String(item.priceShow ?? "")),
        rating: item.ratingScore ? Number(item.ratingScore) : null,
        reviewCount: item.review ? Math.round(Number(item.review)) : null,
        reviewText,
        complaintKeywords: detectComplaints(`${productName} ${reviewText ?? ""}`),
        sourceUrl: href,
      };
    }).filter((item: any) => item.productName);

    if (created.length === 0) {
      const { data } = await axios.get(sourceUrl, {
        timeout: 20000,
        headers,
      });

      const $ = cheerio.load(data);
      const productCards = $("[data-qa-locator='product-item'], .Bm3ON, .gridItem, [class*='product']").slice(0, 12);

      productCards.each((_, element) => {
        const card = $(element);
        const productName =
          card.find("[data-qa-locator='product-item-name']").text().trim() ||
          card.find(".RfADt, .title, [class*='title']").first().text().trim() ||
          card.find("a").first().attr("title")?.trim() ||
          "";
        if (!productName) return;

        const href = card.find("a").first().attr("href");
        const productUrl = href ? new URL(href, "https://www.daraz.com.np").toString() : sourceUrl;
        const price = parseNumber(card.find(".ooOxS, .price, [class*='price']").first().text());
        const rating = parseNumber(card.find("[class*='rating'], .rating").first().text());
        const reviewCount = parseNumber(card.find("[class*='rating__review'], [class*='review']").first().text());
        const reviewText = card.find("[class*='review'], [class*='comment']").text().trim().slice(0, 1000) || null;

        created.push({
          platform: "Daraz",
          productName,
          category: query,
          price,
          rating,
          reviewCount: reviewCount ? Math.round(reviewCount) : null,
          reviewText,
          complaintKeywords: detectComplaints(`${productName} ${reviewText ?? ""}`),
          sourceUrl: productUrl,
        });
      });
    }

    if (created.length === 0) {
      throw new Error("Daraz page loaded but no product cards matched current selectors.");
    }

    await prisma.productSignal.createMany({ data: created });
    await prisma.collectorRun.update({
      where: { id: started.id },
      data: {
        status: "success",
        finishedAt: new Date(),
        itemsCreated: created.length,
        message: `Collected ${created.length} Daraz product signals for "${query}".`,
      },
    });

    return { status: "success", sourceUrl, itemsCreated: created.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.collectorRun.update({
      where: { id: started.id },
      data: { status: "failed", finishedAt: new Date(), message },
    });
    return { status: "failed", sourceUrl, itemsCreated: 0, message };
  }
}
