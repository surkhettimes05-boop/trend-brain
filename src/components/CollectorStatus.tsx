import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Clock, Zap, Database } from 'lucide-react';

interface Collector {
  id: string;
  name: string;
  status: string;
  lastFetch: string;
  latency: string;
}

export function CollectorStatus() {
  const [collectors, setCollectors] = useState<Collector[]>([]);

  useEffect(() => {
    fetch('/api/collectors')
      .then(res => res.json())
      .then(setCollectors);
    
    const interval = setInterval(() => {
      fetch('/api/collectors')
        .then(res => res.json())
        .then(setCollectors);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-zinc-500" />
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em]">Autonomous Collectors</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-mono text-emerald-500/80 uppercase tracking-widest">Live_Ingestion</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {collectors.map((collector) => (
          <div 
            key={collector.id}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">{collector.name}</span>
              <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${
                ['active', 'success'].includes(collector.status.toLowerCase())
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
              }`}>
                {collector.status}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Clock className="w-3 h-3" />
                  <span className="text-[9px] font-mono uppercase tracking-tighter">Last Fetch</span>
                </div>
                <span className="text-[9px] font-mono text-zinc-400">
                  {new Date(collector.lastFetch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Zap className="w-3 h-3" />
                  <span className="text-[9px] font-mono uppercase tracking-tighter">Latency</span>
                </div>
                <span className="text-[9px] font-mono text-zinc-400">{collector.latency}</span>
              </div>
            </div>

            <div className="mt-3 h-1 bg-zinc-900 rounded-full overflow-hidden">
              <motion.div 
                animate={{ x: ['active', 'success'].includes(collector.status.toLowerCase()) ? ['-100%', '100%'] : '0%' }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="h-full w-1/2 bg-indigo-500/40"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
