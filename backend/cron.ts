import cron from "node-cron";
import { collectDaraz } from "./collectors/daraz";
import { collectGoogleTrends } from "./collectors/googleTrends";
import { runAnalysis } from "./aiAnalyzer";
import { darazCategories, trackedKeywords } from "../config/trackedKeywords.js";

export function startCronJobs() {
  if (process.env.DISABLE_CRON === "true") return;

  cron.schedule("15 2 * * *", async () => {
    await collectGoogleTrends(trackedKeywords, "NP");
  });

  cron.schedule("0 */6 * * *", async () => {
    for (const query of darazCategories) {
      await collectDaraz(query);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  });

  cron.schedule("45 3 * * *", async () => {
    await runAnalysis();
  });
}
