"use client";

import { useState, useEffect } from 'react';
import { GodModeBackground } from '@/components/GodMode';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Radio, Zap, Shield, Trophy, Monitor, CheckCircle, Mail, Lock } from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [showCookies, setShowCookies] = useState(false);
  
  // COUNTDOWN LOGIC (Target: Feb 22, 2026, 6:00 PM ICT)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    // Show cookie banner after a short delay
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setShowCookies(true);

    const target = new Date("2026-02-22T18:00:00+07:00").getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(timer);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          secs: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      // THIS MAKES IT WORK: Saves to Firestore 'waitlist' collection
      await addDoc(collection(db, 'waitlist'), {
        email: email,
        timestamp: serverTimestamp(),
        source: 'landing_page'
      });
      setJoined(true);
      setEmail("");
    } catch (err) {
      alert("System Error. Please try again later.");
    }
  };

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent', 'true');
    setShowCookies(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-mono selection:bg-yellow-500 selection:text-black overflow-x-hidden">
      <GodModeBackground />

      {/* COOKIE CONSENT BANNER */}
      {showCookies && (
        <div className="fixed bottom-6 left-6 right-6 z-50 animate-in slide-in-from-bottom-10 duration-500">
          <div className="max-w-4xl mx-auto bg-[#0a0a0a] border border-white/10 p-6 rounded-3xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="flex gap-4 items-center">
              <Lock className="text-yellow-500 w-8 h-8" />
              <p className="text-[11px] text-gray-400 leading-relaxed uppercase">
                We use cookies to synchronize your focus session and optimize the Deskmates protocol. 
                By staying, you accept our data synchronization standards.
              </p>
            </div>
            <button onClick={acceptCookies} className="whitespace-nowrap bg-white text-black px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-yellow-500 transition-colors">
              Accept Protocol
            </button>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="flex items-center gap-2 text-yellow-500 mb-8 px-4 py-1 border border-yellow-500/20 rounded-full bg-yellow-500/5 backdrop-blur-sm">
          <Radio className="w-3 h-3 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Signal Detected: Focus Protocol Alpha</span>
        </div>

        <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-500 to-yellow-900 drop-shadow-[0_0_40px_rgba(255,215,0,0.3)] mb-6">
          DESKMATES
        </h1>
        
        <p className="text-xl md:text-2xl text-white font-bold uppercase tracking-widest mb-6">
            Don't study alone. Find a team. Grind.
        </p>
        
        <p className="text-sm md:text-base text-gray-400 max-w-2xl leading-loose mb-12">
            [cite_start]Deskmates is the "Smart Lobby" for Google Meet[cite: 1, 8]. [cite_start]We organize the rooms, track your focus time, and reward your discipline with Focus Points[cite: 1, 16].
        </p>

        {/* COUNTDOWN TIMER */}
        <div className="grid grid-cols-4 gap-4 md:gap-8 mb-16 border-t border-b border-white/5 py-8 w-full max-w-2xl">
            <TimeUnit value={timeLeft.days} label="Days" />
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <TimeUnit value={timeLeft.mins} label="Mins" />
            <TimeUnit value={timeLeft.secs} label="Secs" />
        </div>

        <a href="#signup" className="bg-yellow-500 text-black px-12 py-6 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,215,0,0.2)]">
            Reserve Your Access
        </a>
      </div>

      {/* LOBBY PREVIEW SECTION */}
      <div className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-yellow-500 text-xs font-black uppercase tracking-[0.5em] mb-2">Interface Preview</h2>
            <p className="text-gray-500 text-[10px] uppercase font-bold italic tracking-widest">
                * This section is a simulation of the live Deskmates Lobby environment
            </p>
          </div>

          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-3xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40">
              <span className="text-yellow-500 font-black italic text-xs tracking-widest">ACTIVE LOBBY SIMULATION</span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
            </div>
            <div className="p-8 grid md:grid-cols-2 gap-4 opacity-80 pointer-events-none">
              <MockRoom title="Advanced Math 12" mod="Mod Long" count="24" isHot={true} />
              <MockRoom title="English Grammar - Level B2" mod="Mod Sarah" count="12" />
              <MockRoom title="Final Exam Grind" mod="Mod Khanh" count="45" isHot={true} />
              <MockRoom title="Science & Tech Hub" mod="Mod Minh" count="8" />
            </div>
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
                <div className="bg-black/80 border border-yellow-500/20 px-6 py-3 rounded-full text-[10px] font-black uppercase text-yellow-500 tracking-[0.3em]">
                    Preview Mode Only
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS (THE TICKET SYSTEM) */}
      <div className="relative z-10 py-32 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
            <h2 className="text-center text-4xl font-black italic uppercase text-white mb-20 tracking-tighter">The "Check-In" Workflow</h2>
            <div className="grid md:grid-cols-4 gap-6">
                [cite_start]<Step num="01" title="Lobby" desc="User sees an active room and its Moderator[cite: 1, 19]." />
                [cite_start]<Step num="02" title="Check-In" desc="System starts your timer and generates the secure link[cite: 1, 20]." />
                [cite_start]<Step num="03" title="Deep Work" desc="Study in Meet with your team (Camera ON / Mic OFF)[cite: 1, 22]." />
                [cite_start]<Step num="04" title="Check-Out" desc="Finish to claim Focus Points based on your time spent[cite: 1, 23]." />
            </div>
        </div>
      </div>

      {/* FINAL SIGNUP */}
      <div id="signup" className="relative z-10 py-32 px-6 bg-[#050505]">
        <div className="max-w-xl mx-auto text-center">
            {joined ? (
              <div className="bg-yellow-500/10 border border-yellow-500/50 p-12 rounded-[3rem] animate-in fade-in zoom-in duration-500">
                <CheckCircle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                <h3 className="text-3xl font-black uppercase italic mb-4">You're on the list</h3>
                <p className="text-gray-400 text-sm leading-relaxed">The protocol begins on Feb 22nd. Watch your inbox for the synchronization signal.</p>
              </div>
            ) : (
              <form onSubmit={handleJoin} className="space-y-10">
                <div className="space-y-4">
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter">Secure Your Rank</h2>
                    <p className="text-gray-500 text-sm">Join the first 1,000 students to gain the "Early Agent" profile badge.</p>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-yellow-500 rounded-full blur opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter student email address..." 
                    className="relative w-full bg-black border border-white/10 p-7 rounded-full text-sm focus:border-yellow-500 outline-none transition-all pr-40"
                  />
                  <button type="submit" className="absolute right-3 top-3 bottom-3 bg-white text-black px-8 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-yellow-500 transition-colors">
                    Join Waitlist
                  </button>
                </div>
              </form>
            )}
        </div>
      </div>

      <footer className="relative z-10 p-16 text-center border-t border-white/5">
         <div className="flex flex-col items-center gap-6">
            <p className="text-[10px] text-gray-700 uppercase tracking-[0.5em] font-black italic">
                A Nguyen Nam Long Project — Deskmates Laboratory 2026
            </p>
         </div>
      </footer>
    </div>
  );
}

// SUB-COMPONENTS
function TimeUnit({ value, label }: { value: number, label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="text-4xl md:text-6xl font-black text-white tabular-nums">{value.toString().padStart(2, '0')}</div>
            <div className="text-[9px] uppercase text-yellow-800 font-bold tracking-widest mt-2">{label}</div>
        </div>
    );
}

function MockRoom({ title, mod, count, isHot = false }: any) {
  return (
    <div className={`p-6 rounded-3xl border ${isHot ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-black border-white/5'}`}>
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-bold text-sm text-white">{title}</h4>
        {isHot && <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
      </div>
      <div className="flex justify-between items-center text-[9px] font-black uppercase">
        <span className="text-gray-600 tracking-tighter">Mod: {mod}</span>
        <div className="flex items-center gap-1.5 text-green-500">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          {count} Agents
        </div>
      </div>
    </div>
  );
}

function Step({ num, title, desc }: any) {
    return (
        <div className="p-10 border border-white/5 bg-[#0a0a0a] rounded-[2.5rem] hover:border-yellow-500/20 transition-all group">
            <div className="text-5xl font-black text-white/5 group-hover:text-yellow-500/20 transition-colors mb-6">{num}</div>
            <h3 className="text-xl font-black uppercase mb-4 text-white italic">{title}</h3>
            <p className="text-[12px] text-gray-500 leading-relaxed font-medium">{desc}</p>
        </div>
    );
}