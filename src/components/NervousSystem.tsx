import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MarketSignal } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, RefreshCcw, Wifi, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { apiGet } from '../services/api';

export function NervousSystem() {
  const [signals, setSignals] = useState<MarketSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSignals() {
      try {
        const data = await apiGet<any>('/api/signals');
        const merged = [
          ...(data.signals || []).map((s: any) => ({
            id: s.id,
            source: s.source,
            region: s.region,
            topic: s.keyword || s.title,
            intensity: Number(s.metricsJson?.interest ?? s.metricsJson?.growth ?? 30) / 100,
            sentiment: 'Collected Signal',
            timestamp: s.collectedAt,
          })),
          ...(data.productSignals || []).map((s: any) => ({
            id: s.id,
            source: s.platform,
            region: 'Nepal',
            topic: s.productName,
            intensity: Math.min(((s.reviewCount || 0) / 100) + ((s.rating || 0) / 5), 1),
            sentiment: 'Marketplace Signal',
            timestamp: s.collectedAt,
          })),
          ...(data.retailerSignals || []).map((s: any) => ({
            id: s.id,
            source: 'Retailer',
            region: s.location,
            topic: s.productName,
            intensity: (s.urgency || 5) / 10,
            sentiment: s.signalType,
            timestamp: s.createdAt,
          })),
        ];
        const mappedSignals: MarketSignal[] = merged.map((s: any) => ({
          id: s.id,
          source: s.source,
          region: s.region,
          topic: s.topic,
          intensity: Math.max(0.05, Math.min(1, s.intensity || 0.1)),
          sentiment: s.sentiment,
          timestamp: s.timestamp,
        }));
        setSignals(mappedSignals);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSignals();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Market Nervous System</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-[pulse_1s_infinite]" />
            <p className="text-zinc-500 text-sm">Showing stored Google Trends, Daraz, and retailer signals from the backend.</p>
          </div>
        </div>
        <button 
          onClick={() => toast.promise(new Promise(r => setTimeout(r, 1000)), {
            loading: 'Re-establishing global ingestion link...',
            success: 'Signal stream synchronized',
            error: 'Link timeout'
          })}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-all border border-zinc-800 cursor-pointer active:rotate-180"
        >
          <RefreshCcw className="w-4 h-4 text-zinc-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-40 bg-zinc-900/20 rounded-3xl animate-pulse border border-white/5" />
          ))
        ) : (
          signals.map((signal, i) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.8, ease: 'circOut' }}
            >
              <Card className="intelligence-sheet border-white/[0.02] hover:border-indigo-500/40 transition-all duration-700 group relative cursor-pointer group overflow-hidden">
                <div className="absolute top-0 right-0 h-1 w-full bg-indigo-500/5 group-hover:bg-indigo-500/20 transition-colors" />
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
                        <Wifi className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-[0.3em] font-bold">{signal.source}</span>
                        <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest leading-none">NODE_STRM_{signal.id}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest border-l border-white/10 pl-3">{signal.region}</span>
                  </div>
                  
                  <h4 className="text-xl font-bold text-white tracking-tight leading-tight group-hover:text-indigo-400 transition-colors duration-500 truncate mb-6">
                    {signal.topic}
                  </h4>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-600">
                      <span>Spectral Intensity</span>
                      <span>{(signal.intensity * 100).toFixed(0)} CP</span>
                    </div>
                    <div className="h-1 bg-zinc-900/50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${signal.intensity * 100}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 relative"
                      >
                         <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* INTELLIGENCE INGESTION TERMINAL */}
      <div className="mt-16 pt-16 border-t border-white/5 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-px h-full bg-white/5" />
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.4em]">Live Intelligence Stream Ingestion</h3>
        </div>

        <div className="bg-black/60 intelligence-sheet rounded-3xl p-10 font-mono text-xs leading-[1.8] overflow-hidden h-[350px] relative border-white/5 group">
          <div className="scanline" />
          <div className="space-y-2 text-indigo-400/60 font-light">
            {signals.slice(0, 8).map((signal) => (
              <p className="flex gap-4" key={signal.id}>
                <span className="text-zinc-600 shrink-0">[{signal.timestamp ? new Date(signal.timestamp).toISOString() : 'pending'}]</span>
                <span className="text-emerald-500 uppercase tracking-widest">[{signal.source}]</span>
                {signal.topic} ({signal.region}) intensity {(signal.intensity * 100).toFixed(0)}
              </p>
            ))}
            {signals.length === 0 && (
              <p className="flex gap-4">
                <span className="text-zinc-600 shrink-0">[NO_DATA]</span>
                <span className="text-amber-500 uppercase tracking-widest">[SETUP]</span>
                Run collectors or submit retailer signals to populate this stream.
              </p>
            )}
            <p className="animate-pulse text-indigo-500 font-bold mb-10">_</p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
