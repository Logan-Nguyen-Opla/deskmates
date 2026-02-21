"use client";

import { ShieldCheck, Cpu, Crosshair, Trash2, Radio, Zap, Activity } from 'lucide-react';

export const GodModeBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 bg-[#020202]">
    {/* Obsidian Corona: Sharp, Deep Gold Glow */}
    <div className="absolute top-[-10vh] left-1/2 -translate-x-1/2 w-[120vw] h-[50vh] bg-gradient-to-b from-yellow-600/20 to-transparent blur-[120px] opacity-50" />
    
    {/* Tactical Vignette: Darkens the edges for focus */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_80%)]" />
    
    {/* Micro-Grid: Smaller, sharper tactical feel */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,215,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,215,0,0.01)_1px,transparent_1px)] bg-[size:20px_20px]" />
    
    {/* Particle Stardust Layer */}
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03]" />
  </div>
);

export const OmegaHeader = ({ userName }: { userName: string }) => (
  <div className="relative z-10 mb-20 flex justify-between items-end border-b-4 border-yellow-500 pb-10 px-4">
    <div className="pr-12">
        <div className="flex items-center gap-4 mb-4">
            <div className="bg-yellow-500 text-black px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter">Authorized</div>
            <span className="text-[10px] text-yellow-700 font-black tracking-[0.6em] uppercase italic">Neural Uplink v1.0</span>
        </div>
        <h1 className="text-8xl font-black italic tracking-tighter text-white uppercase leading-none drop-shadow-[0_10px_30px_rgba(255,215,0,0.4)]">
            {userName}
        </h1>
    </div>
    <div className="text-right hidden lg:block">
        <div className="text-4xl font-black italic text-yellow-500 mb-2">∞ SEC</div>
        <div className="text-[10px] text-yellow-800 uppercase font-black tracking-[0.4em]">Total Focus indexed</div>
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