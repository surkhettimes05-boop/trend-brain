import "dotenv/config";
import { runAnalysis } from "../aiAnalyzer";
import { prisma } from "../db";

const result = await runAnalysis();
console.log(JSON.stringify(result, null, 2));
await prisma.$disconnect();
