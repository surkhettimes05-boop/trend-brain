import "dotenv/config";
import { collectGoogleTrends } from "../collectors/googleTrends";
import { prisma } from "../db";
import { trackedKeywords } from "../../config/trackedKeywords.js";

const result = await collectGoogleTrends(trackedKeywords, "NP");
console.log(JSON.stringify(result, null, 2));
await prisma.$disconnect();
