"use client";

import { ShieldCheck, Radio, Activity, Crosshair } from 'lucide-react';

export const GodModeBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 bg-[#020202]">
    {/* Atmospheric Top Glow */}
    <div className="absolute top-[-30vh] left-1/2 -translate-x-1/2 w-[150vw] h-[70vh] bg-gradient-to-b from-yellow-600/30 via-yellow-500/5 to-transparent blur-[140px] opacity-70 animate-pulse" />
    
    {/* HIGH-VISIBILITY GRID SYSTEM */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,215,0,0.15)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(255,215,0,0.15)_1.5px,transparent_1.5px)] bg-[size:50px_50px] opacity-70" />
    
    {/* Radial Vignette */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_90%)]" />
    
    {/* Intersectional Bloom */}
    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,215,0,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
  </div>
);

export const OmegaHeader = ({ userName }: { userName: string }) => (
  <div className="relative z-10 mb-24 flex justify-between items-end border-b-[12px] border-yellow-500 pb-12 px-4 font-sans">
    <div className="pr-20"> {/* Prevents italic clipping */}
        <div className="flex items-center gap-4 mb-6">
            <div className="bg-yellow-500 text-black px-4 py-1 text-[11px] font-black uppercase italic">Authority: Founder</div>
            <span className="text-[11px] text-yellow-700 font-black tracking-[0.8em] uppercase italic">System Authority</span>
        </div>
        <h1 className="text-8xl md:text-[10rem] font-black italic tracking-tighter text-white uppercase leading-[0.8] drop-shadow-[0_20px_40px_rgba(255,215,0,0.4)]">
            {userName}
        </h1>
    </div>
    <div className="text-right hidden lg:block">
        <div className="text-6xl font-black italic text-yellow-500 mb-2 tracking-tighter">∞ FOCUS</div>
        <div className="text-[11px] text-yellow-800 uppercase font-black tracking-[0.5em]">Neural Link Stable</div>
    </div>
  </div>
);

export const ReactorCore = ({ children }: { children: React.ReactNode }) => (
  <div className="relative z-10 mb-24 max-w-5xl mx-auto">
    <div className="bg-[#050505] border-[3px] border-yellow-500/20 p-12 rounded-[4rem] relative overflow-hidden shadow-[0_0_100px_rgba(255,215,0,0.05)]">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-yellow-500" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-yellow-500" />
        <div className="relative">
            <div className="flex items-center gap-6 mb-10 border-b border-white/10 pb-8">
                <Crosshair className="w-8 h-8 text-yellow-500 animate-[spin_20s_linear_infinite]" />
                <h2 className="font-black text-2xl uppercase text-white tracking-[0.3em] italic">Initialize Signal Protocol</h2>
            </div>
            {children}
        </div>
    </div>
  </div>
);

export const SignalCard = ({ room, onClose }: { room: any, onClose: (id: string) => void }) => (
  <div className="relative bg-[#080808] border border-white/5 p-10 rounded-[3rem] flex justify-between items-center group transition-all hover:border-yellow-500/40 hover:bg-[#0a0a0a]">
      <div className="flex items-center gap-10">
          <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/30 rounded-3xl flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.1)]">
             <Radio className="w-8 h-8 text-yellow-500" />
          </div>
          <div>
            <h3 className="font-black text-3xl text-white uppercase italic tracking-tighter group-hover:text-yellow-500 transition-colors">{room.title}</h3>
            <p className="text-[11px] font-black text-yellow-800 uppercase tracking-[0.4em] mt-2">Active Frequency: {room.id.slice(0, 8)}</p>
          </div>
      </div>
      <button 
          onClick={() => onClose(room.id)}
          className="bg-red-600 text-white px-10 py-5 rounded-2xl hover:scale-105 transition-all text-xs font-black uppercase tracking-widest shadow-[0_0_30px_rgba(220,38,38,0.2)]"
      >
          TERMINATE
      </button>
  </div>
);

export const LoadingSequence = () => (
    <div className="h-screen bg-[#020202] flex flex-col items-center justify-center gap-8 font-mono">
        <div className="w-20 h-20 border-t-[5px] border-yellow-500 rounded-full animate-spin shadow-[0_0_40px_rgba(255,215,0,0.3)]" />
        <div className="text-yellow-500 font-black text-sm uppercase tracking-[1.5em] animate-pulse">Syncing...</div>
    </div>
);