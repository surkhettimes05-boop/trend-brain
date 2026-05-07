import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Brain, 
  TrendingUp, 
  Lightbulb, 
  Shield, 
  Globe, 
  LayoutDashboard,
  Zap,
  Boxes,
  Microscope
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { DashboardOverview } from './components/DashboardOverview';
import { NervousSystem } from './components/NervousSystem';
import { TrendEngine } from './components/TrendEngine';
import { OpportunityEngine } from './components/OpportunityEngine';
import { DashboardStats } from './types';
import { GlobalSignalMap } from './components/GlobalSignalMap';
import { apiGet } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    activeSignals: 0,
    emergingTrends: 0,
    opportunityScore: 0,
    systemHealth: 0
  });

  useEffect(() => {
    apiGet<DashboardStats>('/api/dashboard')
      .then((data) => setStats({
        activeSignals: data.activeSignals,
        emergingTrends: data.emergingTrends,
        opportunityScore: Math.round(data.opportunityScore),
        systemHealth: Math.round(data.systemHealth),
      }))
      .catch(() => setStats((current) => ({ ...current, systemHealth: 0 })));
  }, []);

  const menuItems = [
    { id: 'overview', label: 'Mission Control', icon: LayoutDashboard },
    { id: 'signals', label: 'Nervous System', icon: Activity },
    { id: 'trends', label: 'Trend Emergence', icon: TrendingUp },
    { id: 'opportunities', label: 'Opportunity Engine', icon: Lightbulb },
    { id: 'psychology', label: 'Consumer Psych', icon: Brain },
    { id: 'forecast', label: 'Demand Forecast', icon: Zap },
    { id: 'retail', label: 'Retail Layer', icon: Boxes },
    { id: 'agents', label: 'AI Agents', icon: Shield },
    { id: 'map', label: 'Signal Map', icon: Globe },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#020203] technical-grid relative">
      <Toaster theme="dark" position="top-right" expand={true} richColors />
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent rotate-12"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.03)_0%,transparent_50%)]" />
      </div>

      {/* Sidebar */}
      <aside className="w-72 border-r border-white/[0.05] bg-black/80 backdrop-blur-3xl flex flex-col z-50">
        <div className="p-8 pb-12">
          <div className="flex items-center gap-4 mb-12">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                <Microscope className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-black animate-pulse shadow-[0_0_8px_rgba(99,102,241,1)]" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">TrendBrain</h1>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-[0.3em]">AI_ORGANISM</span>
                <div className="w-1 h-1 rounded-full bg-zinc-800" />
                <span className="text-[8px] font-mono text-indigo-500/80 uppercase tracking-widest">VER.9.4.2</span>
              </div>
            </div>
          </div>

          <nav className="space-y-1.5">
            <div className="px-4 py-2">
               <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.4em]">Core Interface</span>
            </div>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-xs transition-all duration-300 group relative cursor-pointer ${
                  activeTab === item.id 
                    ? 'text-white bg-white/[0.03] shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] border border-white/5' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.01]'
                }`}
              >
                <item.icon className={`w-4 h-4 transition-transform duration-300 ${activeTab === item.id ? 'text-indigo-400 scale-110' : 'text-zinc-600 group-hover:text-zinc-400 group-hover:scale-110'}`} />
                <span className={`font-mono uppercase tracking-[0.2em] transition-colors ${activeTab === item.id ? 'font-bold' : 'font-light'}`}>{item.label}</span>
                {activeTab === item.id && (
                  <>
                    <motion.div
                      layoutId="activeGlow"
                      className="absolute inset-y-0 -left-[1px] w-0.5 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)]"
                    />
                    <div className="ml-auto w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                  </>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/5 bg-zinc-950/20">
          <div className="space-y-6">
            <div className="space-y-2">
               <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest text-zinc-600">
                <span>Neural Bandwidth</span>
                <span className="text-indigo-400">92%</span>
              </div>
              <div className="h-0.5 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[92%] shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-indigo-500/20 transition-colors group cursor-pointer">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)] animate-pulse" />
              <div className="flex-1">
                <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Global Linkage</p>
                <p className="text-[10px] text-zinc-300 font-bold group-hover:text-indigo-400 transition-colors uppercase">Synchronized_STABLE</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full bg-[#050505]/40 overflow-hidden relative">
        {/* Header Stats Bar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md sticky top-0 z-50 overflow-hidden">
          <div className="scanline" />
          
          <div className="flex items-center gap-12">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Active Signals</span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 blur-[2px] animate-pulse" />
              </div>
              <span className="text-sm font-mono text-indigo-400 tabular-nums font-bold">{stats.activeSignals.toLocaleString()}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Market Sentiment</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-emerald-400 font-bold">{stats.opportunityScore.toFixed(0)} SCORE</span>
                <TrendingUp className="w-3 h-3 text-emerald-500" />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Signal Integrity</span>
              <span className="text-sm font-mono text-white/80 font-bold">{stats.systemHealth}%</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-indigo-500/5 border border-indigo-500/10 hidden md:flex">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-indigo-400 tracking-tighter uppercase">Processor Node</span>
                <span className="text-[10px] font-mono text-zinc-400 tabular-nums uppercase">L-EPSILON-09</span>
              </div>
              <Zap className="w-4 h-4 text-indigo-500 fill-indigo-500/20" />
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-white/5">
              <Globe className="w-3 h-3 text-zinc-500" />
              <span className="text-[10px] font-mono text-indigo-400 tracking-widest uppercase">SYD-02_SECURE</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
              transition={{ duration: 0.3, ease: 'circOut' }}
              className="p-8"
            >
              {activeTab === 'overview' && <DashboardOverview stats={stats} />}
              {activeTab === 'signals' && <NervousSystem />}
              {activeTab === 'trends' && <TrendEngine />}
              {activeTab === 'opportunities' && <OpportunityEngine />}
              {activeTab === 'map' && <div className="space-y-4"><h2 className="text-3xl font-bold text-white tracking-tight mb-8">Strategic Intelligence Map</h2><GlobalSignalMap /></div>}
              
              {/* Fallback for under development modules */}
              {!['overview', 'signals', 'trends', 'opportunities', 'map'].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                    <Boxes className="w-8 h-8 text-zinc-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-zinc-200">Module Synchronizing</h2>
                  <p className="text-zinc-500 mt-2 max-w-sm">
                    This intelligence module is currently ingesting regional data. Full integration expected shortly.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
