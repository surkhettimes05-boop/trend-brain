import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ProductOpportunity } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Target, TrendingUp, ShoppingBag, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { apiGet } from '../services/api';

export function OpportunityEngine() {
  const [opportunities, setOpportunities] = useState<ProductOpportunity[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function init() {
      setGenerating(true);
      const trends = await apiGet<any[]>('/api/trends');
      setOpportunities(trends.slice(0, 6).map((trend) => ({
        id: trend.id,
        category: trend.category || 'Uncategorized',
        title: trend.name,
        confidence: Math.max(0, Math.min(1, trend.finalScore / 100)),
        reason: [
          `Demand ${trend.demandScore.toFixed(0)} / velocity ${trend.velocityScore.toFixed(0)}`,
          `Retailer pull ${trend.retailerPullScore.toFixed(0)} / distribution feasibility ${trend.distributionFeasibilityScore.toFixed(0)}`,
          `Competition ${trend.competitionScore.toFixed(0)} / risk ${trend.riskScore.toFixed(0)}`
        ],
        suggestedAction: trend.recommendation || 'Run analysis to generate a recommendation from collected signals.',
        potentialROI: `${trend.finalScore.toFixed(0)} final score`
      })));
      setGenerating(false);
    }
    init();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Product Opportunity Engine</h2>
          <p className="text-zinc-500 mt-1">Strategic commercial recommendations backed by pattern validation.</p>
        </div>
        <button 
          onClick={() => toast.loading('Synchronizing with autonomous fulfillment agents...', { duration: 2000 })}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
        >
          Sync Execution Agent <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {opportunities.map((opp, i) => (
          <motion.div
            key={opp.id}
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="intelligence-sheet group border-white/[0.03] hover:border-indigo-500/40 transition-all duration-500 relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 p-8">
                <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-widest">ROI: {opp.potentialROI}</span>
                </div>
              </div>

              <CardContent className="p-12">
                <div className="flex flex-col h-full">
                  <div className="mb-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.5em]">{opp.category}</span>
                    </div>
                    <h3 className="text-4xl font-bold text-white tracking-tight leading-[0.95] group-hover:text-indigo-400 transition-colors duration-500 mb-6">
                      {opp.title}
                    </h3>
                    <p className="text-zinc-500 text-sm font-light leading-relaxed max-w-md">
                      Autonomous validation suggests a { (opp.confidence * 100).toFixed(0) }% match with current regional demand shifts.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 mb-12">
                    {opp.reason.map((r, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/[0.02] group/item hover:bg-white/[0.03] transition-colors">
                        <div className="w-2 h-2 rounded-full border border-indigo-500/40 group-hover/item:bg-indigo-500 transition-colors" />
                        <p className="text-xs text-zinc-400 font-light">{r}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto space-y-8">
                    <div className="p-8 rounded-3xl bg-indigo-600/5 border border-indigo-500/20 relative overflow-hidden group/action">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50" />
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-[0.4em] font-bold">Strategic Reccomendation</span>
                      </div>
                      <p className="text-md text-zinc-100 leading-snug font-medium italic">
                        "{opp.suggestedAction}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between group-hover:translate-y-[-2px] transition-transform">
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                          {Array(4).fill(0).map((_, i) => (
                            <div key={i} className="w-10 h-10 rounded-2xl border-4 border-zinc-950 bg-zinc-900 group-hover:scale-105 transition-transform" style={{ transitionDelay: `${i * 50}ms` }} />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">+12 Producers Found</span>
                      </div>
                      <button 
                        onClick={() => toast.info('Initializing Autonomous Pilot', { description: `Provisioning testing environment for "${opp.title}"` })}
                        className="flex items-center gap-3 text-[10px] font-mono text-zinc-400 hover:text-white transition-all uppercase tracking-[0.3em] font-bold group/link cursor-pointer active:scale-95"
                      >
                        Initialize Pilot <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
