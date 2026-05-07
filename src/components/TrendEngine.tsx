import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendAnalysis } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Brain, Info, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { apiGet } from '../services/api';

export function TrendEngine() {
  const [trends, setTrends] = useState<TrendAnalysis[]>([]);
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    async function init() {
      setAnalyzing(true);
      try {
        const data = await apiGet<any[]>('/api/trends');
        
        const mappedTrends = data.map((t: any) => ({
          id: t.id,
          topic: t.name,
          status: t.lifecycleStage,
          velocity: (t.velocityScore / 100),
          confidence: (t.finalScore / 100),
          platforms: ['Daraz', 'Google Trends', 'Retailer Input'],
          psychology: t.summary || 'No AI summary yet. Run analysis after collecting signals.',
          reasoning: t.recommendation || 'No recommendation has been generated yet.'
        }));
        
        setTrends(mappedTrends);
      } catch (err) {
        console.error(err);
      } finally {
        setAnalyzing(false);
      }
    }
    init();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Trend Emergence Engine</h2>
          <p className="text-zinc-500 mt-1">AI-driven pattern detection and lifecycle prediction.</p>
        </div>
        {analyzing && (
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm">
            <Brain className="w-4 h-4 animate-pulse" />
            <span className="font-mono uppercase tracking-widest text-[10px]">Analyzing Behavioral Clusters...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {trends.map((trend, i) => (
          <motion.div
            key={trend.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="intelligence-border group overflow-hidden border-white/[0.03] hover:border-indigo-500/30 transition-all duration-500">
              <div className="absolute top-0 right-0 p-8 flex flex-col items-end gap-2">
                <Badge className={`font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-sm border-none shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
                  trend.status === 'Acceleration' ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'
                }`}>
                  {trend.status}
                </Badge>
                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Lifecycle Hash: 0XF{trend.id}A9</span>
              </div>

              <CardContent className="p-10 relative">
                <div className="absolute top-0 left-1/4 h-full w-px bg-white/[0.02]" />
                
                <div className="flex flex-col lg:flex-row gap-16 relative z-10">
                  <div className="lg:w-3/5 space-y-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-5">
                         <div className="w-14 h-14 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-center shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]">
                          <TrendingUp className="w-7 h-7 text-indigo-400/80" />
                        </div>
                        <div className="space-y-0.5">
                          <h3 className="text-4xl font-bold text-zinc-100 tracking-tight group-hover:text-indigo-400 transition-colors duration-700">{trend.topic}</h3>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.5em]">Entity Trace: TRB-882-QX</span>
                            <div className="w-1 h-1 rounded-full bg-zinc-800" />
                            <span className="text-[9px] font-mono text-indigo-500/60 uppercase tracking-[0.5em]">Live Verification Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 py-10 border-y border-white/[0.03] relative">
                      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500/40 via-indigo-500/10 to-transparent" />
                      <div>
                        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em] mb-2">Momentum Index</p>
                        <p className="text-3xl font-mono text-white tracking-tighter">{(trend.velocity * 100).toFixed(1)}<span className="text-indigo-500 text-sm ml-1">CP</span></p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em] mb-2">AI Certitude</p>
                        <p className="text-3xl font-mono text-emerald-500/90 tracking-tighter">{(trend.confidence * 100).toFixed(0)}%</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em] mb-2">Infiltration Depth</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {trend.platforms.map(p => (
                            <span key={p} className="text-[10px] font-mono text-indigo-300/80 bg-indigo-500/5 border border-indigo-500/10 px-3 py-1 rounded uppercase tracking-[0.2em]">{p}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-indigo-400/60" />
                          <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.4em]">Causal Chain Analysis</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
                            <span className="text-[9px] font-mono text-zinc-600 uppercase">Input Trigger</span>
                            <p className="text-sm text-zinc-400 font-light leading-relaxed">Urban Gen-Z identity seeking "Peak Performance" status markers.</p>
                          </div>
                          <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
                            <span className="text-[9px] font-mono text-zinc-600 uppercase">Market Response</span>
                            <p className="text-sm text-zinc-400 font-light leading-relaxed">Rapid shift from traditional snacks to functional protein-based alternatives.</p>
                          </div>
                        </div>
                        <p className="text-sm text-zinc-500 leading-relaxed font-light italic pl-4 border-l border-indigo-500/20">
                          "{trend.reasoning}"
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-2/5 bg-zinc-950/40 intelligence-sheet rounded-3xl p-10 relative overflow-hidden flex flex-col group/psycho group/hover-tilt">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/5 blur-[120px] rounded-full group-hover/psycho:bg-indigo-500/15 transition-all duration-1000" />
                    
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]" />
                        <h4 className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.4em]">Psychology Node</h4>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-700 tracking-[0.5em]">AGENT_082</span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-4xl font-serif italic text-zinc-100 leading-[1.1] tracking-tight">
                          "{trend.psychology}"
                      </p>
                      <div className="mt-8 flex gap-1">
                        {Array(12).fill(0).map((_, i) => (
                          <div key={i} className="h-1 flex-1 bg-zinc-900 overflow-hidden">
                            <motion.div 
                              initial={{ x: '-100%' }}
                              animate={{ x: '100%' }}
                              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                              className="h-full bg-indigo-500/30" 
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-12 space-y-6 pt-10 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500">Commercial Target Window</span>
                        <span className="text-xs font-mono text-white">4 - 8 Months</span>
                      </div>
                      <button 
                        onClick={() => toast.promise(new Promise(r => setTimeout(r, 2000)), {
                          loading: `Synthesizing action plan for ${trend.topic}...`,
                          success: `Strategic plan for ${trend.topic} generated. Check your dossier.`,
                          error: 'Synthesis failed'
                        })}
                        className="group/btn w-full flex items-center justify-center gap-4 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold uppercase tracking-[0.3em] transition-all shadow-xl shadow-indigo-900/20 active:scale-[0.98] cursor-pointer"
                      >
                        Synthesize Action Plan <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent w-full" />
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
