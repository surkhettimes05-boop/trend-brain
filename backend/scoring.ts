export interface TrendScores {
  demandScore: number;
  velocityScore: number;
  competitionScore: number;
  marginScore: number;
  retailerPullScore: number;
  viralityScore: number;
  manufacturingEaseScore: number;
  distributionFeasibilityScore: number;
  riskScore: number;
  finalScore: number;
}

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export function calculateFinalScore(scores: Omit<TrendScores, "finalScore">) {
  return clamp(
    scores.demandScore * 0.18 +
      scores.velocityScore * 0.15 +
      scores.retailerPullScore * 0.18 +
      scores.viralityScore * 0.12 +
      scores.marginScore * 0.12 +
      scores.manufacturingEaseScore * 0.08 +
      scores.distributionFeasibilityScore * 0.1 -
      scores.competitionScore * 0.04 -
      scores.riskScore * 0.03
  );
}

export function lifecycleStage(finalScore: number, velocityScore: number) {
  if (finalScore >= 75 && velocityScore >= 70) return "Acceleration";
  if (finalScore >= 60) return "Emerging";
  if (finalScore >= 45) return "Signal";
  if (velocityScore < 25) return "Decline";
  return "Monitor";
}

export function scoreTrend(input: {
  name: string;
  signals: any[];
  productSignals: any[];
  retailerSignals: any[];
}): TrendScores {
  const recentSignals = input.signals.length;
  const relatedProducts = input.productSignals;
  const relatedRetailer = input.retailerSignals;

  const trendInterest = input.signals
    .map((signal) => Number((signal.metricsJson as any)?.interest ?? (signal.metricsJson as any)?.growth ?? 0))
    .filter(Number.isFinite);
  const avgInterest = trendInterest.length
    ? trendInterest.reduce((sum, value) => sum + value, 0) / trendInterest.length
    : 0;

  const avgRating = relatedProducts.length
    ? relatedProducts.reduce((sum, product) => sum + (product.rating ?? 0), 0) / relatedProducts.length
    : 0;
  const reviewVolume = relatedProducts.reduce((sum, product) => sum + (product.reviewCount ?? 0), 0);
  const complaintCount = relatedProducts.reduce((sum, product) => {
    const keywords = product.complaintKeywords as unknown;
    return sum + (Array.isArray(keywords) ? keywords.length : 0);
  }, 0);

  const retailerUrgency = relatedRetailer.length
    ? relatedRetailer.reduce((sum, signal) => sum + signal.urgency, 0) / relatedRetailer.length
    : 0;

  const category = input.signals[0]?.category ?? relatedProducts[0]?.category ?? relatedRetailer[0]?.category ?? "";
  const localManufacturingCategories = ["snacks", "tea", "noodles", "detergent", "cooking oil"];
  const easyToDistributeCategories = ["snacks", "tea", "cosmetics", "detergent", "noodles"];

  const base = {
    demandScore: clamp(avgInterest * 0.75 + Math.min(reviewVolume / 20, 25) + relatedRetailer.length * 8),
    velocityScore: clamp(avgInterest + recentSignals * 4),
    competitionScore: clamp(relatedProducts.length * 9 + Math.min(reviewVolume / 35, 30)),
    marginScore: clamp(55 + (avgRating >= 4 ? 12 : 0) - relatedProducts.filter((p) => (p.price ?? 0) < 300).length * 3),
    retailerPullScore: clamp(retailerUrgency * 10 + relatedRetailer.length * 12),
    viralityScore: clamp(avgInterest * 0.7 + input.signals.filter((s) => s.source === "Google Trends").length * 10),
    manufacturingEaseScore: localManufacturingCategories.some((c) => category?.toLowerCase().includes(c)) ? 75 : 48,
    distributionFeasibilityScore: easyToDistributeCategories.some((c) => category?.toLowerCase().includes(c)) ? 78 : 55,
    riskScore: clamp(complaintCount * 12 + (avgRating > 0 && avgRating < 3.5 ? 25 : 0)),
  };

  return {
    ...base,
    finalScore: calculateFinalScore(base),
  };
}
