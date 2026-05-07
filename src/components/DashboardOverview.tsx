import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Zap, 
  Target, 
  BarChart3,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardStats } from '../types';
import { GlobalSignalMap } from './GlobalSignalMap';
import { DecisionAgent } from './DecisionAgent';
import { CollectorStatus } from './CollectorStatus';
import { RetailerInputForm } from './RetailerInputForm';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

import { Toaster, toast } from 'sonner';
import { apiGet, apiPost } from '../services/api';
import { LatestReport } from '../types';

const chartData = [
  { time: '00:00', intensity: 45 },
  { time: '04:00', intensity: 52 },
  { time: '08:00', intensity: 85 },
  { time: '12:00', intensity: 78 },
  { time: '16:00', intensity: 92 },
  { time: '20:00', intensity: 88 },
  { time: '23:59', intensity: 95 },
];

export function DashboardOverview({ stats }: { stats: DashboardStats }) {
  const [latestReport, setLatestReport] = useState<LatestReport | null>(null);

  useEffect(() => {
    apiGet<LatestReport>('/api/reports/latest')
      .then(setLatestReport)
      .catch(() => setLatestReport({ status: 'unavailable', message: 'Report endpoint unavailable.' }));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Strategic Nervous System</h2>
          <p className="text-zinc-500 mt-1 font-mono text-[10px] uppercase tracking-[0.3em]">Autonomous Market Consciousness Node_v9.4.2</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={async () => {
              try {
                toast.loading('Initializing collection sequence...', { id: 'collect' });
                await apiPost('/api/collect/google-trends');
                await apiPost('/api/collect/daraz');
                toast.success('Collectors finished. Check collector status for failures or unavailable sources.', { id: 'collect' });
              } catch (error) {
                toast.error('Collector request failed. Set trendbrain_admin_token in localStorage if hosted admin auth is enabled.', { id: 'collect' });
              }
            }}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-mono uppercase tracking-widest transition-all active:scale-95 cursor-pointer"
          >
            Trigger Collection
          </button>
          <button 
            onClick={async () => {
              try {
                toast.loading('Synthesizing market patterns...', { id: 'analyze' });
                await apiPost('/api/analyze');
                toast.success('Strategy updated.', { id: 'analyze' });
                window.location.reload(); // Refresh to show new trends
              } catch (error) {
                toast.error('Analysis request failed. Set trendbrain_admin_token in localStorage if hosted admin auth is enabled.', { id: 'analyze' });
              }
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95 cursor-pointer"
          >
            Trigger Intelligence
          </button>
          <button 
            onClick={() => {
              window.location.href = '/api/export/report.json';
            }}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-all active:scale-95 cursor-pointer"
          >
            Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Neural Throughput', value: stats.activeSignals.toLocaleString(), change: '+12%', icon: Activity, color: 'text-indigo-400' },
          { label: 'Predictive Patterns', value: stats.emergingTrends, change: '+5', icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Asymmetry Index', value: `${stats.opportunityScore}%`, change: '+2.4%', icon: Target, color: 'text-amber-400' },
          { label: 'Stability Index', value: `${stats.systemHealth}%`, change: 'Optimal', icon: Zap, color: 'text-cyan-400' },
        ].map((item, i) => (
          <Card key={i} className="mission-control-border bg-zinc-900/20 border-zinc-800/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${typeof item.change === 'string' && item.change.includes('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-400'}`}>
                  {item.change}
                </span>
              </div>
              <p className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider mb-1">{item.label}</p>
              <h3 className="text-2xl font-bold font-mono text-white tracking-tighter">{item.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-8">
        <CollectorStatus />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-6 bg-indigo-600" />
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.4em]">Strategic Geospatial Overlay</h3>
            </div>
            <span className="text-[9px] font-mono text-zinc-700 tracking-[0.5em]">LAST_UPDATE: T+00:02:41</span>
          </div>
          <GlobalSignalMap />
        </div>

        <div className="lg:col-span-1">
          <DecisionAgent />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RetailerInputForm />
        </div>

        {/* Intelligence Alerts Center */}
        <Card className="intelligence-sheet bg-black/40 border-white/[0.02] flex flex-col">
          <div className="p-8 border-b border-white/[0.02]">
            <h3 className="text-xs font-mono text-indigo-500 uppercase tracking-[0.4em] font-bold">Autonomous Alerts</h3>
          </div>
          <CardContent className="flex-1 p-0 custom-scrollbar overflow-y-auto">
            <div className="divide-y divide-white/[0.03]">
              {[
                { type: latestReport?.status === 'unavailable' ? 'Warning' : 'Info', msg: latestReport?.summary || latestReport?.message || 'No strategic report has been generated yet. Collect data, then run analysis.', time: 'latest report' },
                { type: 'Info', msg: `Active signals in database: ${stats.activeSignals.toLocaleString()}`, time: 'live' },
                { type: stats.systemHealth > 0 ? 'Positive' : 'Warning', msg: `Backend system health: ${stats.systemHealth}%`, time: 'live' },
              ].map((alert, i) => (
                <div key={i} className="p-6 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex gap-4">
                    <div className={`mt-1 h-3 w-3 rounded-full blur-[4px] shrink-0 ${alert.type === 'Critical' ? 'bg-rose-500' : alert.type === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <div className="space-y-3">
                      <p className="text-[11px] text-zinc-300 leading-snug font-light group-hover:text-zinc-100 transition-colors">
                        {alert.msg}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className={`text-[8px] px-2 py-0.5 rounded border ${alert.type === 'Critical' ? 'border-rose-500/30 text-rose-500 bg-rose-500/10' : alert.type === 'Warning' ? 'border-amber-500/30 text-amber-500 bg-amber-500/10' : 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10'} font-mono`}>
                          {alert.type.toUpperCase()}
                        </span>
                        <span className="text-[8px] font-mono text-zinc-700 uppercase tracking-[0.2em]">{alert.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}
