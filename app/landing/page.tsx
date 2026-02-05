"use client";

import { useState, useEffect } from 'react';
import { GodModeBackground } from '@/components/GodMode';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Radio, Zap, Trophy, Shield, Monitor, CheckCircle, Lock, ArrowRight, Instagram, Twitter, Github } from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [showCookies, setShowCookies] = useState(false);
  
  // Launch Target: February 22, 2026, 6:00 PM ICT
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
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
      await addDoc(collection(db, 'waitlist'), {
        email: email,
        timestamp: serverTimestamp(),
        source: 'landing_page_v3'
      });
      setJoined(true);
      setEmail("");
    } catch (err) {
      alert("Synchronization Error. Please try again.");
    }
  };

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent', 'true');
    setShowCookies(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-mono selection:bg-yellow-500 selection:text-black overflow-x-hidden">
      <GodModeBackground />

      {/* Cookie Consent Banner */}
      {showCookies && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl animate-in slide-in-from-bottom-full duration-700">
          <div className="bg-[#0a0a0a]/90 border border-yellow-500/20 p-6 rounded-[2rem] backdrop-blur-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="flex gap-4 items-center">
              <Lock className="text-yellow-500 w-5 h-5" />
              <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-wider">
                We use cookies to synchronize focus sessions and optimize the protocol.
              </p>
            </div>
            <button onClick={acceptCookies} className="bg-white text-black px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-yellow-500 transition-all">
              Accept
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="flex items-center gap-2 text-yellow-500 mb-8 px-5 py-1.5 border border-yellow-500/30 rounded-full bg-yellow-500/5 backdrop-blur-md">
          <Radio className="w-3 h-3 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Signal Detected: Focus Protocol Alpha</span>
        </div>

        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-500 to-yellow-900 drop-shadow-[0_0_40px_rgba(255,215,0,0.3)] mb-4">
          DESKMATES
        </h1>
        
        <p className="text-xl md:text-2xl text-white font-bold uppercase tracking-[0.3em] mb-8">
            Stop Studying Alone.
        </p>
        
        <p className="text-sm md:text-base text-gray-400 max-w-xl leading-loose mb-12 font-medium">
            Deskmates is the smart lobby that turns isolated study sessions into a synchronized team sport. Find a room, start the timer, and crush your goals.
        </p>

        {/* Countdown Timer */}
        <div className="grid grid-cols-4 gap-6 md:gap-12 mb-16 border-y border-white/5 py-10 w-full max-w-2xl">
            <TimeUnit value={timeLeft.days} label="Days" />
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <TimeUnit value={timeLeft.mins} label="Mins" />
            <TimeUnit value={timeLeft.secs} label="Secs" />
        </div>

        <a href="#signup" className="group relative flex items-center gap-3 bg-yellow-500 text-black px-12 py-6 rounded-full font-black uppercase tracking-widest text-sm hover:bg-yellow-400 transition-all shadow-[0_0_40px_rgba(255,215,0,0.2)]">
            Join Waitlist
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      {/* Static Interface Preview */}
      <div className="relative z-10 py-24 px-6 flex flex-col items-center">
        <div className="text-center mb-10">
          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em] mb-2 font-mono">
            Preview of what Deskmates looks like
          </p>
          <div className="h-[1px] w-12 bg-gray-800 mx-auto"></div>
        </div>

        <div className="relative w-full max-w-4xl bg-[#080808] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl opacity-60">
            <div className="p-7 border-b border-white/5 flex justify-between items-center bg-black/60">
              <span className="text-yellow-500/50 font-black italic text-[10px] tracking-widest">LOBBY_INTERFACE_PREVIEW</span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/5 border border-white/10"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-white/5 border border-white/10"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-white/5 border border-white/10"></div>
              </div>
            </div>
            <div className="p-10 grid md:grid-cols-2 gap-5 pointer-events-none">
              <MockRoom title="Advanced Calculus" mod="Mod Long" count="24" isHot={true} />
              <MockRoom title="IELTS Intensive Speaking" mod="Mod Sarah" count="12" />
              <MockRoom title="World History - Exam Grind" mod="Mod Khanh" count="45" isHot={true} />
              <MockRoom title="Data Structures & Algorithms" mod="Mod Minh" count="8" />
            </div>
        </div>
      </div>

      {/* Vertical Rectangular Workflow Section */}
      <div className="relative z-10 py-32 px-6 border-t border-white/5 bg-[#030303]">
        <div className="max-w-6xl mx-auto">
            <h2 className="text-center text-4xl font-black italic uppercase text-white mb-20 tracking-tighter">The Protocol Workflow</h2>
            <div className="grid md:grid-cols-4 gap-6">
                <Step 
                    num="01" 
                    title="Browse Lobby" 
                    desc="Access a centralized dashboard of active study sessions. Filter by subject or grade to find the perfect environment. See real-time participant counts to join the most focused groups." 
                />
                <Step 
                    num="02" 
                    title="Secure Check-In" 
                    desc="Select a room and tap 'Join' to initiate the protocol. The system starts your personal focus timer and automatically launches the secure video session directly on your device." 
                />
                <Step 
                    num="03" 
                    title="Deep Work Phase" 
                    desc="Engage in synchronized study with high-performance peers. Adhere to the core protocol: Camera ON for accountability and Microphone OFF for a zero-distraction environment." 
                />
                <Step 
                    num="04" 
                    title="Claim Rewards" 
                    desc="Finish your session to claim Focus Points (XP). Your recorded study time is converted into rank progression. Track your growth and compete on the national weekly leaderboard." 
                />
            </div>
        </div>
      </div>

      {/* Waitlist Section */}
      <div id="signup" className="relative z-10 py-32 px-6">
        <div className="max-w-xl mx-auto text-center">
            {joined ? (
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-12 rounded-[3.5rem] animate-in fade-in zoom-in">
                <CheckCircle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                <h3 className="text-3xl font-black uppercase italic mb-4">Protocol Accepted</h3>
                <p className="text-gray-400 text-sm">Synchronization begins on Feb 22nd. Watch your inbox for the signal.</p>
              </div>
            ) : (
              <form onSubmit={handleJoin} className="space-y-12">
                <div className="space-y-4">
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter">Secure Your Rank</h2>
                    <p className="text-gray-500 text-sm max-w-md mx-auto">Join the first 1,000 students to receive permanent Founder Priority status and custom profile themes.</p>
                </div>
                <div className="relative max-w-md mx-auto group">
                  <div className="absolute -inset-1 bg-yellow-500 rounded-full blur opacity-10 group-focus-within:opacity-25 transition-all"></div>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter student email..." 
                    className="relative w-full bg-black border border-white/10 p-7 rounded-full text-sm focus:border-yellow-500 outline-none transition-all pr-40 placeholder:text-gray-800"
                  />
                  <button type="submit" className="absolute right-3 top-3 bottom-3 bg-white text-black px-8 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-yellow-500 transition-colors">
                    Join Waitlist
                  </button>
                </div>
              </form>
            )}
        </div>
      </div>

      {/* Enhanced Manifesto Footer */}
      <footer className="relative z-10 p-20 border-t border-white/5 bg-black">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
            <div className="space-y-8 max-w-sm">
                <h3 className="text-3xl font-black italic tracking-tighter text-yellow-500 underline decoration-yellow-500/20 underline-offset-8">DESKMATES</h3>
                <p className="text-[11px] text-gray-500 leading-relaxed uppercase tracking-widest font-bold">
                  The definitive aggregator for high-performance students. Turning isolated study hours into visible, rewarded progress through deep work synchronization.
                </p>
                <div className="flex gap-6">
                    <Instagram className="w-5 h-5 text-gray-800 hover:text-yellow-500 cursor-pointer transition-colors" />
                    <Twitter className="w-5 h-5 text-gray-800 hover:text-yellow-500 cursor-pointer transition-colors" />
                    <Github className="w-5 h-5 text-gray-800 hover:text-yellow-500 cursor-pointer transition-colors" />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-24">
                <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Protocol</h4>
                    <ul className="text-[10px] text-gray-600 space-y-3 uppercase font-black">
                        <li className="hover:text-yellow-500 cursor-pointer transition-colors">Smart Lobby</li>
                        <li className="hover:text-yellow-500 cursor-pointer transition-colors">Focus XP</li>
                        <li className="hover:text-yellow-500 cursor-pointer transition-colors">Leaderboards</li>
                    </ul>
                </div>
                <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Foundation</h4>
                    <p className="text-[10px] text-gray-700 leading-loose uppercase font-black">
                        Nguyen Nam Long Project<br/>Vietnam — 2026<br/>Est. Neural Sync
                    </p>
                </div>
            </div>
         </div>
         <div className="mt-24 pt-12 border-t border-white/5 text-center">
            <p className="text-[10px] text-gray-800 uppercase tracking-[1em] font-black italic opacity-50">
                Finalizing Synchronization Protocol — Deskmates Laboratory
            </p>
         </div>
      </footer>
    </div>
  );
}

// Sub-components
function TimeUnit({ value, label }: { value: number, label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="text-5xl md:text-7xl font-black text-white tabular-nums">{value.toString().padStart(2, '0')}</div>
            <div className="text-[11px] uppercase text-yellow-800 font-black tracking-[0.3em] mt-4">{label}</div>
        </div>
    );
}

function MockRoom({ title, mod, count, isHot = false }: any) {
  return (
    <div className={`p-8 rounded-[2.5rem] border ${isHot ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-black border-white/5'}`}>
      <div className="flex justify-between items-start mb-6">
        <h4 className="font-bold text-sm text-white tracking-tight">{title}</h4>
        {isHot && <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
      </div>
      <div className="flex justify-between items-center text-[10px] font-black uppercase">
        <span className="text-gray-600 tracking-tighter">Moderator: {mod}</span>
        <div className="flex items-center gap-2 text-green-500">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
          {count} Online
        </div>
      </div>
    </div>
  );
}

// Updated Step Component: Vertical Rectangles with Yellow Numbers
function Step({ num, title, desc }: any) {
    return (
        <div className="p-10 min-h-[450px] border border-white/5 bg-[#0a0a0a] rounded-[2.5rem] flex flex-col hover:border-yellow-500/20 transition-all group shadow-xl">
            <div className="text-6xl font-black text-yellow-500 transition-colors mb-10 opacity-80 group-hover:opacity-100">
              {num}
            </div>
            <h3 className="text-2xl font-black uppercase mb-6 text-white italic tracking-tighter leading-tight">
              {title}
            </h3>
            <p className="text-[13px] text-gray-500 leading-relaxed font-bold uppercase tracking-wide">
              {desc}
            </p>
        </div>
    );
}