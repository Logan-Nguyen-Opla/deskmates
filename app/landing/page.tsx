"use client";

import { GodModeBackground } from '@/components/GodMode';
import { Radio, Users, Zap, Shield, Trophy, Monitor, Clock, CheckCircle, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-mono selection:bg-yellow-500 selection:text-black overflow-x-hidden">
      <GodModeBackground />

      {/* 1. HERO SECTION: THE CORE HOOK */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] p-6 text-center">
        <div className="flex items-center gap-2 text-yellow-500 mb-8 px-4 py-1 border border-yellow-500/20 rounded-full bg-yellow-500/5 backdrop-blur-sm">
          <Radio className="w-3 h-3 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">System Status: Ready for Deployment</span>
        </div>

        <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-500 to-yellow-900 drop-shadow-[0_0_40px_rgba(255,215,0,0.3)] mb-6">
          DESKMATES
        </h1>
        
        <p className="text-xl md:text-3xl text-white font-bold uppercase tracking-widest mb-6">
            Don't study alone. Find a team. Join Meet. Grind.
        </p>
        
        <p className="text-sm md:text-base text-gray-400 max-w-2xl leading-loose mb-12">
            Deskmates is the ultimate "Smart Lobby" for Google Meet. We provide the community, the discipline, and the gamification you need to crush exam season without the burnout[cite: 8, 9].
        </p>

        <div className="flex flex-col md:flex-row gap-4 items-center mb-16">
            <button className="bg-yellow-500 text-black px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform">
                Join the Beta
            </button>
            <div className="text-yellow-600 text-[10px] font-black uppercase tracking-widest animate-pulse">
                7 Days Until Public Launch
            </div>
        </div>
      </div>

      {/* 2. THE PROBLEM: WHY WE EXIST */}
      <div className="relative z-10 bg-white/5 border-y border-white/10 py-24 px-6 backdrop-blur-md">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
                <h2 className="text-4xl font-black italic text-yellow-500 uppercase tracking-tighter">Stop Procrastinating</h2>
                <p className="text-gray-300 leading-relaxed text-sm">
                    Studying alone is a recipe for distraction. Google Meet is great, but it's isolated—you don't know who is studying where. Deskmates aggregates active sessions so you never have to hunt for a link again[cite: 14, 15, 16].
                </p>
                <ul className="space-y-3">
                    {['Zero isolation.', 'Instant accountability.', 'Proof of work.'].map(item => (
                        <li key={item} className="flex items-center gap-3 text-xs font-bold uppercase text-yellow-700">
                            <CheckCircle className="w-4 h-4" /> {item}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="aspect-video bg-black border border-yellow-500/20 rounded-3xl overflow-hidden flex items-center justify-center group">
                <div className="text-center group-hover:scale-110 transition-transform">
                    <Monitor className="w-16 h-16 text-yellow-500/20 mb-4 mx-auto" />
                    <span className="text-[10px] text-gray-700 uppercase font-black">Lobby Interface Preview</span>
                </div>
            </div>
        </div>
      </div>

      {/* 3. THE PROTOCOL: HOW IT WORKS  */}
      <div className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto">
            <h2 className="text-center text-4xl font-black italic uppercase text-white mb-20 tracking-tighter underline decoration-yellow-500 decoration-4 underline-offset-8">The Focus Protocol</h2>
            
            <div className="grid md:grid-cols-4 gap-4">
                <Step num="01" title="Find a Room" desc="Browse the Lobby for a subject and a Moderator that fits your vibe." />
                <Step num="02" title="Check-In" desc="Hit Join. Our system starts your timer and opens the secure Google Meet link." />
                <Step num="03" title="Deep Work" desc="Study with your camera on. No mics, no distractions, just pure focus." />
                <Step num="04" title="Claim Points" desc="Finish the session to claim your Focus Points and climb the ranks." />
            </div>
        </div>
      </div>

      {/* 4. CORE FEATURES: THE TOOLKIT [cite: 34-51] */}
      <div className="relative z-10 bg-black/80 py-24 px-6 border-t border-yellow-500/10">
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-yellow-500 text-xs font-black uppercase tracking-[0.5em] mb-4">Feature Set</h2>
                <p className="text-2xl font-bold italic uppercase tracking-tighter">Everything built for high-performance students</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
                <FeatureCard icon={<Zap/>} title="Focus Points" desc="A unified currency for your effort. Your study time is no longer invisible[cite: 23, 75]." />
                <FeatureCard icon={<Trophy/>} title="Live Leaderboards" desc="Compete with the top 10 focus agents in the country every week[cite: 51]." />
                <FeatureCard icon={<Shield/>} title="Active Moderation" desc="Real human mods enforce 'Camera ON' rules to keep the lobby high-quality[cite: 16, 60]." />
                <FeatureCard icon={<Clock/>} title="Session Tracker" desc="Track every minute of your progress across days, weeks, and months[cite: 50]." />
                <FeatureCard icon={<Monitor/>} title="Aggregator Lobby" desc="A central dashboard for every active room. No more dead links[cite: 8, 34]." />
                <FeatureCard icon={<Users/>} title="Body Doubling" desc="Harness the psychology of shared presence to eliminate burnout[cite: 14]." />
            </div>
        </div>
      </div>

      {/* 5. MISSION STATEMENT [cite: 90, 115] */}
      <div className="relative z-10 py-32 text-center px-6">
        <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-black italic text-yellow-500 uppercase">The Vision</h2>
            <p className="text-lg md:text-xl text-gray-300 leading-loose italic font-light">
                "Deskmates is not a tutoring app. It is a discipline engine. We are building the 'Strava for Studying'—turning the grind of exam prep into a visible, social, and rewarding team sport."
            </p>
            <div className="flex flex-col items-center gap-2">
                <div className="h-[2px] w-12 bg-yellow-600"></div>
                <span className="text-[10px] text-yellow-800 uppercase tracking-widest font-black">Nguyen Nam Long — Founder</span>
            </div>
        </div>
      </div>

      {/* 6. FINAL CTA & FOOTER */}
      <footer className="relative z-10 bg-black p-16 border-t border-white/5 text-center">
         <div className="max-w-xl mx-auto space-y-12">
            <div className="space-y-4">
                <h3 className="text-4xl font-black italic tracking-tighter uppercase">Join the Protocol</h3>
                <p className="text-xs text-gray-600 uppercase tracking-widest">Incoming Transmission: February 2026</p>
            </div>
            <div className="flex justify-center gap-8 text-[10px] font-black uppercase text-gray-800 tracking-tighter">
                <span>© 2026 Deskmates Laboratory</span>
                <span>/</span>
                <span>All Rights Reserved</span>
                <span>/</span>
                <span>V.1.0_ALPHA</span>
            </div>
         </div>
      </footer>
    </div>
  );
}

function Step({ num, title, desc }: { num: string, title: string, desc: string }) {
    return (
        <div className="p-8 border border-white/5 bg-white/5 rounded-[2rem] hover:bg-yellow-500/5 transition-colors group">
            <div className="text-4xl font-black text-yellow-500/20 group-hover:text-yellow-500 transition-colors mb-4">{num}</div>
            <h3 className="text-lg font-black uppercase mb-4 text-white italic tracking-tighter">{title}</h3>
            <p className="text-[12px] text-gray-500 leading-relaxed font-medium">{desc}</p>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-[#080808] border border-yellow-500/5 p-10 rounded-3xl hover:border-yellow-500/30 transition-all hover:-translate-y-1">
      <div className="text-yellow-500 mb-6">{icon}</div>
      <h3 className="font-black text-xs text-yellow-100 uppercase mb-4 tracking-[0.2em]">{title}</h3>
      <p className="text-[12px] text-gray-600 leading-loose font-medium">{desc}</p>
    </div>
  );
}