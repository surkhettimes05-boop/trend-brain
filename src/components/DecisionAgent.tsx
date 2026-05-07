import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Target, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { apiGet } from '../services/api';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  confidence: number;
  impact: string;
  label: string;
  recommendation?: string; // Fallback
}

export function DecisionAgent() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    apiGet<any>('/api/reports/latest')
      .then((report) => {
        const items = Array.isArray(report.recommendationsJson) ? report.recommendationsJson : [];
        setRecommendations(items.map((item: any, index: number) => ({
          id: `${index + 1}`,
          title: item.name || item.title || item.action || 'Recommendation',
          description: item.action || item.description || report.summary || 'Run analysis to generate recommendations.',
          confidence: item.score ? Math.round(item.score) : 0,
          impact: item.score && item.score > 70 ? 'High' : 'Medium',
          label: item.score && item.score > 70 ? 'TEST IMMEDIATELY' : 'MONITOR CLOSELY',
        })));
      })
      .catch(() => setRecommendations([]));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.4em]">Autonomous Strategic Decisions</h3>
        </div>
        <span className="text-[9px] font-mono text-zinc-600 tracking-[0.3em]">AGENT_BETA_V1</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => (
          <motion.div
            key={rec.id}
            whileHover={{ y: -4 }}
            className="intelligence-sheet p-6 rounded-2xl relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute top-0 right-0 p-4">
               <Zap className="w-4 h-4 text-indigo-500/30 group-hover:text-indigo-400 transition-colors" />
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{rec.id}</span>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                (rec.label || rec.recommendation) === 'STRONG BUY' 
                  ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' 
                  : 'text-indigo-400 border-indigo-500/30 bg-indigo-500/5'
              }`}>
                {rec.label || rec.recommendation}
              </span>
            </div>

            <h4 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{rec.title}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-light line-clamp-2">
              {rec.description}
            </p>

            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Confidence</span>
                <span className="text-xs font-mono text-emerald-400">{rec.confidence}%</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toast.success(`Broadcasting Plan ${rec.id}`, { description: 'Relaying strategic directives to regional distribution nodes.' });
                }}
                className="flex items-center gap-2 text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold group/link cursor-pointer"
              >
                Execute Plan <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
