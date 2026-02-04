"use client";

import { GodModeBackground } from '@/components/GodMode';
import { Radio, Users, Zap, Shield, Trophy, Monitor } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-mono selection:bg-yellow-500 selection:text-black overflow-x-hidden">
      <GodModeBackground />

      {/* HERO SECTION: DIRECT VALUE PROP */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="flex items-center gap-2 text-yellow-500 mb-8 px-4 py-1 border border-yellow-500/20 rounded-full bg-yellow-500/5 backdrop-blur-sm">
          <Radio className="w-3 h-3 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">System Status: Final Sync</span>
        </div>

        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-500 to-yellow-900 drop-shadow-[0_0_40px_rgba(255,215,0,0.3)] mb-6">
          DESKMATES
        </h1>
        
        <p className="text-lg md:text-2xl text-white font-bold uppercase tracking-widest mb-4">
            Don't study alone. Find a team. Get to work. 
        </p>
        
        <p className="text-sm md:text-base text-yellow-700 font-medium max-w-lg leading-relaxed mb-12">
            The central hub for high-performance students. We organize the rooms, track your progress, and keep you focused. 
        </p>

        <div className="max-w-2xl bg-black/40 border border-yellow-500/10 backdrop-blur-2xl p-8 md:p-12 rounded-[2rem] shadow-2xl">
          <h2 className="text-xl md:text-2xl font-black text-white uppercase mb-6 tracking-tight">Launching in 7 Days</h2>
          
          <div className="grid grid-cols-3 gap-4 border-t border-yellow-500/10 pt-8">
            <div><div className="text-4xl font-black text-yellow-500">07</div><div className="text-[10px] uppercase text-yellow-800 font-bold">Days</div></div>
            <div><div className="text-4xl font-black text-yellow-500">12</div><div className="text-[10px] uppercase text-yellow-800 font-bold">Hours</div></div>
            <div><div className="text-4xl font-black text-yellow-500">00</div><div className="text-[10px] uppercase text-yellow-800 font-bold">Mins</div></div>
          </div>
        </div>
      </div>

      {/* USER FEATURES: HOW IT WORKS */}
      <div className="relative z-10 bg-black/90 border-y border-yellow-500/10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-yellow-500 text-3xl font-black uppercase tracking-tighter italic mb-4">The Focus Protocol</h2>
            <p className="text-gray-500 text-sm">Everything you need to survive exam season and crush your goals. </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Feature 
              icon={<Monitor className="w-5 h-5"/>} 
              title="Smart Lobby" 
              desc="Browse active study sessions. Join the right room for your subject instantly. " 
            />
            <Feature 
              icon={<Zap className="w-5 h-5"/>} 
              title="Focus Points" 
              desc="Earn points for every minute you study. Turn your hard work into a high score. " 
            />
            <Feature 
              icon={<Trophy className="w-5 h-5"/>} 
              title="Global Ranking" 
              desc="See where you stand against the top students in the country. " 
            />
            <Feature 
              icon={<Shield className="w-5 h-5"/>} 
              title="Real Discipline" 
              desc="Human moderators ensure cameras are on and distractions are out. " 
            />
          </div>
        </div>
      </div>

      <footer className="relative z-10 p-16 text-center">
         <div className="flex flex-col items-center gap-6">
            <div className="h-[1px] w-32 bg-yellow-900/30"></div>
            <p className="text-[10px] text-yellow-900 uppercase tracking-[0.5em] font-black italic">
                A Deskmates Laboratory Project — 2026
            </p>
         </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-[#080808] border border-yellow-500/5 p-8 rounded-3xl hover:border-yellow-500/30 transition-all group">
      <div className="text-yellow-500 mb-6 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="font-black text-xs text-yellow-100 uppercase mb-3 tracking-widest">{title}</h3>
      <p className="text-[12px] text-gray-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}