"use client";

import { GodModeBackground } from '@/components/GodMode';
import { Radio, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-mono overflow-hidden">
      <GodModeBackground /> {/* Using your existing atmosphere */}

      <div className="relative z-10 text-center space-y-8 max-w-2xl">
        <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-yellow-500 mb-4">
                <Radio className="w-4 h-4 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Signal Detected</span>
            </div>
            <h1 className="text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-500 to-yellow-900 drop-shadow-[0_0_30px_rgba(255,215,0,0.2)]">
                DESKMATES
            </h1>
            <p className="text-xs text-yellow-800 font-bold uppercase tracking-[0.3em]">Neural Study Protocol</p>
        </div>

        <div className="bg-yellow-500/5 border border-yellow-500/20 p-8 rounded-2xl backdrop-blur-md">
            <h2 className="text-xl font-bold mb-4">The Next Evolution of Focus</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Nguyen Nam Long’s "Deskmates" is currently undergoing final synchronization. 
                Full clearance for focus agents is scheduled for next week.
            </p>
            
            {/* Simple Countdown */}
            <div className="grid grid-cols-3 gap-4 border-t border-yellow-500/10 pt-6">
                <div><div className="text-2xl font-black text-yellow-500">07</div><div className="text-[8px] uppercase text-yellow-800">Days</div></div>
                <div><div className="text-2xl font-black text-yellow-500">12</div><div className="text-[8px] uppercase text-yellow-800">Hours</div></div>
                <div><div className="text-2xl font-black text-yellow-500">00</div><div className="text-[8px] uppercase text-yellow-800">Mins</div></div>
            </div>
        </div>

        <div className="flex flex-col items-center gap-4">
            <div className="text-[10px] text-gray-600 uppercase tracking-widest">A Nam Long Nguyen Project</div>
            <Zap className="w-5 h-5 text-yellow-500/20" />
        </div>
      </div>
    </div>
  );
}