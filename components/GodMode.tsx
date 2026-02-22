"use client";

import { ShieldCheck, Cpu, Crosshair, Trash2, Radio, Zap, Activity } from 'lucide-react';

/**
 * BACKGROUND: The Obsidian Throne
 * Aggressive, high-contrast, and focused.
 */
export const GodModeBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 bg-[#020202]">
    {/* Obsidian Corona: Deep Gold Pulse */}
    <div className="absolute top-[-20vh] left-1/2 -translate-x-1/2 w-[140vw] h-[60vh] bg-gradient-to-b from-yellow-600/20 via-yellow-500/5 to-transparent blur-[140px] opacity-60 animate-pulse" />
    
    {/* Tactical Vignette: Enforces Focus */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_85%)]" />
    
    {/* The Laboratory Grid: Sharp and tactical */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,215,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,215,0,0.02)_1px,transparent_1px)] bg-[size:30px_30px] opacity-30" />
    
    {/* Stardust Layer: High Contrast */}
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 contrast-150" />
  </div>
);

/**
 * OMEGA HEADER: The Founder's Mark
 * Fixed: PR-12 and Black-Italic weights to prevent clipping.
 */
export const OmegaHeader = ({ userName }: { userName: string }) => (
  <div className="relative z-10 mb-20 flex justify-between items-end border-b-8 border-yellow-500 pb-12 px-2 group">
    <div className="pr-12"> {/* Anti-clipping buffer */}
        <div className="flex items-center gap-4 mb-4">
            <div className="bg-yellow-500 text-black px-3 py-1 text-[10px] font-black uppercase tracking-tighter italic">Authority Verified</div>
            <span className="text-[10px] text-yellow-700 font-black tracking-[0.8em] uppercase italic">Neural Uplink v2.0</span>
        </div>
        <h1 className="text-8xl md:text-9xl font-black italic tracking-tighter text-white uppercase leading-none drop-shadow-[0_20px_50px_rgba(255,215,0,0.5)]">
            {userName}
        </h1>
    </div>
    <div className="text-right hidden lg:block">
        <Activity className="w-16 h-16 text-yellow-500 ml-auto mb-4 animate-pulse opacity-20" />
        <div className="text-5xl font-black italic text-yellow-500 mb-2 tracking-tighter">∞ FOCUS</div>
        <div className="text-[10px] text-yellow-800 uppercase font-black tracking-[0.5em]">Sync Status: Eternal</div>
    </div>
  </div>
);

export const ReactorCore = ({ children }: { children: React.ReactNode }) => (
  <div className="relative z-10 mb-20 max-w-4xl mx-auto">
    <div className="bg-[#080808] border-2 border-yellow-500/20 p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-yellow-500" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-yellow-500" />
        <div className="relative">
            <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                <Crosshair className="w-6 h-6 text-yellow-500 animate-spin-slow" />
                <h2 className="font-black text-lg uppercase text-white tracking-widest italic">Initialize Protocol</h2>
            </div>
            {children}
        </div>
    </div>
  </div>
);

export const SignalCard = ({ room, onClose }: { room: any, onClose: (id: string) => void }) => (
  <div className="relative bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl flex justify-between items-center group transition-all hover:border-yellow-500/40">
      <div className="flex items-center gap-8">
          <div className="w-12 h-12 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl flex items-center justify-center">
             <Radio className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h3 className="font-black text-xl text-white uppercase italic tracking-tighter group-hover:text-yellow-500 transition-colors">{room.title}</h3>
            <span className="text-[10px] font-bold text-yellow-800 uppercase tracking-widest">Status: {room.status}</span>
          </div>
      </div>
      <button 
          onClick={() => onClose(room.id)}
          className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-3 rounded-xl hover:bg-red-500 hover:text-black transition-all text-xs font-black uppercase tracking-widest"
      >
          TERMINATE
      </button>
  </div>
);

export const LoadingSequence = () => (
    <div className="h-screen bg-[#020202] flex flex-col items-center justify-center gap-6 font-mono">
        <div className="w-16 h-16 border-t-4 border-yellow-500 rounded-full animate-spin" />
        <div className="text-yellow-500 font-black text-xs uppercase tracking-[1em] animate-pulse">Uplink...</div>
    </div>
);