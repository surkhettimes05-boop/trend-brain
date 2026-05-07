import { motion } from 'motion/react';

export function GlobalSignalMap() {
  const nodes = [
    { id: 'ktm', x: 74, y: 35, name: 'Kathmandu', value: 92, type: 'Hotspot' },
    { id: 'del', x: 68, y: 38, name: 'Delhi', value: 85, type: 'Hub' },
    { id: 'bkk', x: 82, y: 55, name: 'Bangkok', value: 78, type: 'Emerging' },
    { id: 'dxb', x: 45, y: 42, name: 'Dubai', value: 88, type: 'Trade Link' },
    { id: 'lon', x: 25, y: 22, name: 'London', value: 65, type: 'External' },
    { id: 'nyc', x: 10, y: 30, name: 'New York', value: 72, type: 'External' },
  ];

  return (
    <div className="intelligence-sheet rounded-3xl overflow-hidden h-[600px] relative bg-zinc-950/20 group">
      <div className="absolute inset-0 scanline opacity-5" />
      
      {/* Pseudo Map Background */}
      <div className="absolute inset-0 opacity-40 technical-grid" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_70%)]" />
      
      {/* Tactical UI Overlay */}
      <div className="absolute top-10 left-10 z-10 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 blur-[2px] animate-pulse" />
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-[0.6em]">Geospatial Intelligence Engine</h3>
        </div>
        <div className="flex flex-col gap-1 font-mono text-[9px] text-zinc-600 uppercase tracking-[0.3em]">
          <p>ACTIVE_NODES: {nodes.length.toString().padStart(2, '0')}</p>
          <p>SIG_FLOW: OPTIMAL</p>
          <p>TERRAIN_RENDER: V4.82</p>
        </div>
      </div>

      {/* Top Right Tactical Info */}
      <div className="absolute top-10 right-10 z-10 text-right space-y-2">
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.3em]">Temporal Drift</span>
          <span className="text-xs font-mono text-indigo-400 font-bold">0.0004 MS</span>
        </div>
      </div>

      <div className="absolute inset-0 p-24">
        <svg className="w-full h-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Neural Connections */}
          {nodes.map((node, i) => (
            nodes.slice(i + 1).map((other, j) => (
              <motion.line
                key={`line-${i}-${j}`}
                x1={node.x}
                y1={node.y}
                x2={other.x}
                y2={other.y}
                stroke="rgba(99, 102, 241, 0.15)"
                strokeWidth="0.1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 3, delay: (i + j) * 0.1, repeat: Infinity, repeatType: 'reverse' }}
              />
            ))
          ))}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <motion.div
            key={node.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-crosshair z-20"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.2 }}
          >
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-indigo-500/60 shadow-[0_0_25px_rgba(99,102,241,0.6)] pulsing-node border border-indigo-400 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white blur-[1px]" />
              </div>
              <div className="absolute top-0 left-0 w-12 h-12 -translate-x-1/3 -translate-y-1/3 rounded-full border border-indigo-500/10 animate-[ping_3s_infinite]" />
              
              <div className="absolute top-full mt-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none z-30 scale-95 group-hover:scale-100">
                <div className="bg-zinc-950/90 intelligence-sheet p-6 rounded-2xl min-w-[200px]">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                    <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-[0.4em] font-bold">{node.type}</span>
                    <span className="text-[9px] font-mono text-zinc-600">ID:0x{node.id.toUpperCase()}</span>
                  </div>
                  <p className="text-xl font-bold text-white tracking-tight mb-2">{node.name}</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-500 uppercase">Velocity</span>
                      <span className="text-indigo-400 font-bold">{node.value}% CP</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-full animate-[shimmer_2s_infinite]" style={{ width: `${node.value}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-8 py-3 px-10 rounded-full intelligence-sheet border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="glow-point" />
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em]">High Intensity Peak</span>
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
          <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-[0.4em]">Baseline Node</span>
        </div>
      </div>
    </div>
  );
}
