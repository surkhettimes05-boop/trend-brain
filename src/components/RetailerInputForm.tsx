import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiPost } from '../services/api';

export function RetailerInputForm() {
  const [topic, setTopic] = useState('');
  const [retailerName, setRetailerName] = useState('');
  const [location, setLocation] = useState('Kathmandu');
  const [urgency, setUrgency] = useState(5);
  const [category, setCategory] = useState('FMCG');
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiPost('/api/retailer-signals', {
        retailerName,
        location,
        signalType: 'manual_observation',
        productName: topic,
        category,
        note: observations,
        urgency,
      });
      toast.success('Retailer signal saved', {
        description: 'Manual retailer intelligence was stored in PostgreSQL.'
      });
      setTopic('');
      setObservations('');
    } catch (error) {
      toast.error('System Link Error', {
        description: 'Failed to establish secure link with neural ingestion node.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="intelligence-sheet p-8 rounded-3xl relative overflow-hidden border border-white/[0.03]">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <MessageSquare className="w-24 h-24 text-indigo-500" />
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]" />
        <h3 className="text-xs font-bold text-white uppercase tracking-[0.4em]">Retailer Signal Ingestion</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block px-1">Retailer</label>
            <input
              type="text"
              value={retailerName}
              onChange={(e) => setRetailerName(e.target.value)}
              placeholder="e.g. Bhatbhateni aisle lead"
              className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-colors"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block px-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-colors"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block px-1">Urgency 1-10</label>
            <input
              type="number"
              min="1"
              max="10"
              value={urgency}
              onChange={(e) => setUrgency(Number(e.target.value))}
              className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-colors"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block px-1">Observed Topic</label>
            <input 
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Rare Energy Drink Demand"
              className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-colors"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block px-1">Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors appearance-none"
            >
              <option value="FMCG">FMCG</option>
              <option value="Cosmetics">Cosmetics</option>
              <option value="Dairy">Dairy</option>
              <option value="Electronics">Electronics</option>
              <option value="Pharma">Pharma</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block px-1">Ground Observations</label>
          <textarea 
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Describe customer inquiries, stock-outs, or sentiment shifts..."
            rows={4}
            className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
            required
          />
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] transition-all shadow-xl shadow-indigo-900/20 active:scale-[0.98] flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Ingesting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Intelligence
            </>
          )}
        </button>
      </form>
    </div>
  );
}
