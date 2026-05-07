import "dotenv/config";
import { collectDaraz } from "../collectors/daraz";
import { prisma } from "../db";
import { darazCategories } from "../../config/trackedKeywords.js";

const results = [];
for (const query of darazCategories) {
  results.push(await collectDaraz(query));
  await new Promise((resolve) => setTimeout(resolve, 1500));
}
console.log(JSON.stringify(results, null, 2));
await prisma.$disconnect();
