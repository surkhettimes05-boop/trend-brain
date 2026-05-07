export type TrendStatus = 'Signal' | 'Emerging' | 'Acceleration' | 'Mainstream' | 'Saturation' | 'Decline';

export interface MarketSignal {
  id: string;
  source: string;
  region: string;
  topic: string;
  intensity: number; // 0-1
  sentiment: string;
  timestamp: string;
}

export interface TrendAnalysis {
  id: string;
  topic: string;
  status: TrendStatus;
  velocity: number; // rate of change
  confidence: number;
  platforms: string[];
  psychology: string; // The "WHY"
  reasoning: string;
}

export interface ProductOpportunity {
  id: string;
  category: string;
  title: string;
  confidence: number;
  reason: string[];
  suggestedAction: string;
  potentialROI: string;
}

export interface DashboardStats {
  activeSignals: number;
  emergingTrends: number;
  opportunityScore: number;
  systemHealth: number;
}

export interface BackendTrend {
  id: string;
  name: string;
  category?: string | null;
  region: string;
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
  lifecycleStage: string;
  summary?: string | null;
  recommendation?: string | null;
}

export interface LatestReport {
  id?: string;
  title?: string;
  region?: string;
  summary?: string;
  opportunitiesJson?: unknown;
  risksJson?: unknown;
  recommendationsJson?: unknown;
  status?: string;
  message?: string;
}
