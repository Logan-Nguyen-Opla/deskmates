"use client";

import { GodModeBackground } from '@/components/GodMode';
import { Radio, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-mono overflow-hidden">
      <GodModeBackground />
      
      <div className="relative z-10 text-center space-y-12 max-w-2xl">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-yellow-500">
            <Radio className="w-4 h-4 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Signal Detected</span>
          </div>
          <h1 className="text-7xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-500 to-yellow-900 drop-shadow-[0_0_30px_rgba(255,215,0,0.2)]">
            DESKMATES
          </h1>
          <p className="text-sm text-yellow-800 font-bold uppercase tracking-[0.5em]">Neural Focus Protocol</p>
        </div>

        <div className="border border-yellow-500/20 bg-black/40 backdrop-blur-xl p-10 rounded-3xl">
          <p className="text-gray-400 leading-loose text-sm italic mb-8">
            "The evolution of focus is not in isolation, but in synchronized deep work." <br/>
            — Nguyen Nam Long
          </p>
          <div className="grid grid-cols-3 gap-4 border-t border-yellow-500/10 pt-8">
            <div><div className="text-3xl font-black text-yellow-500">07</div><div className="text-[8px] uppercase text-yellow-800">Days</div></div>
            <div><div className="text-3xl font-black text-yellow-500">12</div><div className="text-[8px] uppercase text-yellow-800">Hours</div></div>
            <div><div className="text-3xl font-black text-yellow-500">00</div><div className="text-[8px] uppercase text-yellow-800">Mins</div></div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 pt-4">
          <p className="text-[10px] text-gray-700 uppercase tracking-widest">Incoming Transmission: Feb 2026</p>
          <Zap className="w-5 h-5 text-yellow-500/20" />
        </div>
      </div>
    </div>
  );
}