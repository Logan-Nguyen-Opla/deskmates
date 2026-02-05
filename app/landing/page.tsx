"use client";

import { useState } from 'react';
import { GodModeBackground } from '@/components/GodMode';
import { Radio, Users, Zap, Shield, Trophy, Monitor, Clock, CheckCircle, ChevronRight, Mail, Camera } from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setJoined(true);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-mono selection:bg-yellow-500 selection:text-black overflow-x-hidden">
      <GodModeBackground />

      {/* 1. HERO SECTION */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="flex items-center gap-2 text-yellow-500 mb-8 px-4 py-1 border border-yellow-500/20 rounded-full bg-yellow-500/5 backdrop-blur-sm">
          <Radio className="w-3 h-3 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Signal Detected: Alpha Protocol</span>
        </div>

        <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-500 to-yellow-900 drop-shadow-[0_0_40px_rgba(255,215,0,0.3)] mb-6">
          DESKMATES
        </h1>
        
        <p className="text-xl md:text-3xl text-white font-bold uppercase tracking-widest mb-6">
            Stop Studying Alone. Join the Team.
        </p>
        
        <p className="text-sm md:text-base text-gray-400 max-w-2xl leading-loose mb-12">
            Deskmates is the "Smart Lobby" for Google Meet. We synchronize high-performance students into moderated, gamified focus sessions. Turn your study grind into a team sport.
        </p>

        <div className="flex flex-col md:flex-row gap-6 items-center mb-16">
            <a href="#signup" className="bg-yellow-500 text-black px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform">
                Get Early Access
            </a>
            <div className="text-yellow-600 text-[10px] font-black uppercase tracking-widest border-l border-yellow-500/20 pl-6">
                Launching in 7 Days
            </div>
        </div>
      </div>

      {/* 2. THE LOBBY PREVIEW (REPLACES THE PLACEHOLDER) */}
      <div className="relative z-10 py-24 px-6 bg-gradient-to-b from-transparent via-white/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-yellow-500 text-xs font-black uppercase tracking-[0.5em] mb-4">Inside the Protocol</h2>
            <p className="text-2xl font-bold italic uppercase tracking-tighter">Your command center for deep work</p>
          </div>

          <div className="relative group max-w-4xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 to-transparent rounded-[2.5rem] blur opacity-25"></div>
            <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
              {/* Mock App Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40">
                <span className="text-yellow-500 font-black italic">DESKMATES LOBBY</span>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                </div>
              </div>
              {/* Mock App Content */}
              <div className="p-8 grid md:grid-cols-2 gap-4">
                <MockRoom title="Advanced Math 12" mod="Mod Long" count="24" isHot={true} />
                <MockRoom title="IELTS Speaking Hub" mod="Mod Sarah" count="12" />
                <MockRoom title="Late Night Grind" mod="Mod Khanh" count="45" isHot={true} />
                <MockRoom title="Chemistry - Exam Prep" mod="Mod Minh" count="8" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. THE PROTOCOL: 4 STEPS */}
      <div className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto">
            <h2 className="text-center text-4xl font-black italic uppercase text-white mb-20 tracking-tighter underline decoration-yellow-500 decoration-4 underline-offset-8">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-4">
                <Step num="01" title="Find a Team" desc="Browse the Lobby for live rooms based on your subject or grade." />
                <Step num="02" title="Sync Up" desc="Hit Join. Our system starts your focus timer and opens the secure session." />
                <Step num="03" title="Deep Work" desc="Cameras on, mics off. Harness the power of body doubling to stay locked in." />
                <Step num="04" title="Level Up" desc="Finish the session to claim Focus Points and climb the national leaderboard." />
            </div>
        </div>
      </div>

      {/* 4. CORE FEATURES */}
      <div className="relative z-10 bg-black/80 py-24 px-6 border-t border-yellow-500/10">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
            <FeatureCard icon={<Zap/>} title="Focus Points" desc="Your effort is no longer invisible. Every minute studied earns you XP." />
            <FeatureCard icon={<Trophy/>} title="Leaderboards" desc="Compete weekly for the rank of #1 Focus Agent in the country." />
            <FeatureCard icon={<Shield/>} title="Live Moderators" desc="Real humans monitor every room to ensure a professional environment." />
        </div>
      </div>

      {/* 5. SIGNUP SECTION (FIXED "JOIN THE BETA") */}
      <div id="signup" className="relative z-10 py-32 px-6">
        <div className="max-w-xl mx-auto text-center">
            {joined ? (
              <div className="bg-yellow-500/10 border border-yellow-500/50 p-10 rounded-[2.5rem] animate-in fade-in zoom-in duration-500">
                <CheckCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-2xl font-black uppercase italic mb-2">Protocol Accepted</h3>
                <p className="text-gray-400 text-sm">You are on the list. We will ping you the moment we deploy.</p>
              </div>
            ) : (
              <form onSubmit={handleJoin} className="space-y-8">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Enter the Prototype</h2>
                <p className="text-gray-500 text-sm">Join 500+ students waiting for the public launch. No study alone.</p>
                <div className="relative">
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your student email..." 
                    className="w-full bg-[#0a0a0a] border border-white/10 p-6 rounded-full text-sm focus:border-yellow-500 outline-none transition-all pr-32"
                  />
                  <button type="submit" className="absolute right-2 top-2 bottom-2 bg-yellow-500 text-black px-6 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 transition-colors">
                    Join Now
                  </button>
                </div>
              </form>
            )}
        </div>
      </div>

      <footer className="relative z-10 bg-black p-16 border-t border-white/5 text-center">
         <p className="text-[10px] text-gray-800 uppercase tracking-widest font-black">— A Project by Nguyen Nam Long —</p>
      </footer>
    </div>
  );
}

function MockRoom({ title, mod, count, isHot = false }: any) {
  return (
    <div className={`p-5 rounded-2xl border transition-all ${isHot ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-black border-white/5'}`}>
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-bold text-sm text-white">{title}</h4>
        {isHot && <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
      </div>
      <div className="flex justify-between items-center text-[10px] font-bold">
        <span className="text-gray-500 uppercase">Moderator: {mod}</span>
        <div className="flex items-center gap-1 text-green-500">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          {count} Online
        </div>
      </div>
    </div>
  );
}

function Step({ num, title, desc }: any) {
    return (
        <div className="p-8 border border-white/5 bg-white/5 rounded-[2rem] hover:bg-yellow-500/5 transition-colors group">
            <div className="text-4xl font-black text-yellow-500/20 group-hover:text-yellow-500 transition-colors mb-4">{num}</div>
            <h3 className="text-lg font-black uppercase mb-4 text-white italic tracking-tighter">{title}</h3>
            <p className="text-[12px] text-gray-500 leading-relaxed font-medium">{desc}</p>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="bg-[#080808] border border-yellow-500/5 p-10 rounded-3xl hover:border-yellow-500/30 transition-all">
      <div className="text-yellow-500 mb-6">{icon}</div>
      <h3 className="font-black text-xs text-yellow-100 uppercase mb-4 tracking-[0.2em]">{title}</h3>
      <p className="text-[12px] text-gray-600 leading-loose font-medium">{desc}</p>
    </div>
  );
}