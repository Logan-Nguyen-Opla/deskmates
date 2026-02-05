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
  
  // Target: February 22, 2026, 6:00 PM Vietnam Time (ICT/GMT+7)
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
      // Logic to save to Firestore 'waitlist' collection
      await addDoc(collection(db, 'waitlist'), {
        email: email,
        timestamp: serverTimestamp(),
        source: 'landing_page_v2'
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

      {/* Cookie Consent */}
      {showCookies && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl animate-in slide-in-from-bottom-full duration-700">
          <div className="bg-[#0a0a0a]/90 border border-yellow-500/20 p-6 rounded-[2rem] backdrop-blur-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <Lock className="text-yellow-500 w-5 h-5" />
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-wider">
                This site uses cookies to synchronize focus sessions and optimize the protocol. 
                Continuing implies acceptance of these standards.
              </p>
            </div>
            <button onClick={acceptCookies} className="whitespace-nowrap bg-white text-black px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-yellow-500 transition-all active:scale-95">
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Main Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="flex items-center gap-2 text-yellow-500 mb-8 px-5 py-1.5 border border-yellow-500/30 rounded-full bg-yellow-500/5 backdrop-blur-md">
          <Radio className="w-3 h-3 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Signal Detected: Alpha Build 1.0</span>
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

        {/* Countdown */}
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

      {/* App Simulation */}
      <div className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-[10px] text-yellow-500 font-black uppercase tracking-widest mb-4">
               Interface Preview
            </div>
            <p className="text-gray-500 text-[11px] uppercase font-bold italic tracking-widest max-w-md mx-auto leading-relaxed">
                The Following is a functional simulation of the Live Lobby Environment scheduled for release.
            </p>
          </div>

          <div className="relative bg-[#070707] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="p-7 border-b border-white/5 flex justify-between items-center bg-black/60">
              <span className="text-yellow-500 font-black italic text-xs tracking-[0.2em]">SYNCHRONIZED_LOBBY_PREVIEW</span>
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40"></div>
              </div>
            </div>
            <div className="p-10 grid md:grid-cols-2 gap-5 opacity-60 grayscale-[50%] pointer-events-none">
              <MockRoom title="Advanced Calculus" mod="Mod Long" count="24" isHot={true} />
              <MockRoom title="IELTS Intensive Speaking" mod="Mod Sarah" count="12" />
              <MockRoom title="World History - Exam Grind" mod="Mod Khanh" count="45" isHot={true} />
              <MockRoom title="Data Structures & Algorithms" mod="Mod Minh" count="8" />
            </div>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                <div className="bg-black/90 border border-yellow-500/30 px-8 py-4 rounded-2xl text-[11px] font-black uppercase text-yellow-500 tracking-[0.4em] shadow-2xl">
                    Live Preview Restricted
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Waitlist Form */}
      <div id="signup" className="relative z-10 py-32 px-6 bg-[#030303]">
        <div className="max-w-xl mx-auto text-center">
            {joined ? (
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-12 rounded-[3.5rem] animate-in fade-in zoom-in duration-700">
                <CheckCircle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                <h3 className="text-3xl font-black uppercase italic mb-4 tracking-tighter">Identity Verified</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Synchronization begins Feb 22nd. You will receive the signal shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleJoin} className="space-y-12">
                <div className="space-y-4">
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter underline decoration-yellow-500/20 underline-offset-8">Claim Your Spot</h2>
                    <p className="text-gray-500 text-sm max-w-md mx-auto">The first 1,000 agents receive permanent "Founder Priority" badges and custom themes.</p>
                </div>
                <div className="relative group max-w-md mx-auto">
                  <div className="absolute -inset-1 bg-yellow-500 rounded-full blur opacity-10 group-focus-within:opacity-30 transition-all"></div>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter student email..." 
                    className="relative w-full bg-black border border-white/10 p-7 rounded-full text-sm focus:border-yellow-500 outline-none transition-all pr-40 placeholder:text-gray-800"
                  />
                  <button type="submit" className="absolute right-3 top-3 bottom-3 bg-white text-black px-8 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-yellow-500 transition-colors">
                    Join
                  </button>
                </div>
              </form>
            )}
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="relative z-10 p-20 border-t border-white/5 bg-black">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
            <div className="space-y-6 max-w-sm">
                <h3 className="text-2xl font-black italic tracking-tighter text-yellow-500">DESKMATES</h3>
                <p className="text-[11px] text-gray-500 leading-relaxed uppercase tracking-wider">
                  The definitive aggregator for high-performance students. Leveraging deep work protocols to eliminate academic isolation.
                </p>
                <div className="flex gap-4">
                    <Instagram className="w-5 h-5 text-gray-800 hover:text-yellow-500 cursor-pointer transition-colors" />
                    <Twitter className="w-5 h-5 text-gray-800 hover:text-yellow-500 cursor-pointer transition-colors" />
                    <Github className="w-5 h-5 text-gray-800 hover:text-yellow-500 cursor-pointer transition-colors" />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-20">
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Protocol</h4>
                    <ul className="text-[10px] text-gray-600 space-y-2 uppercase font-bold">
                        <li className="hover:text-yellow-500 cursor-pointer transition-colors">Smart Lobby</li>
                        <li className="hover:text-yellow-500 cursor-pointer transition-colors">Focus Points</li>
                        <li className="hover:text-yellow-500 cursor-pointer transition-colors">Leaderboards</li>
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Foundation</h4>
                    <p className="text-[9px] text-gray-700 leading-loose uppercase font-black">
                        A Project by<br/>Nguyen Nam Long<br/>Vietnam — 2026
                    </p>
                </div>
            </div>
         </div>
         <div className="mt-20 pt-10 border-t border-white/5 text-center">
            <p className="text-[9px] text-gray-800 uppercase tracking-[0.8em] font-black">
                Deskmates Laboratory — Finalizing Synchronization
            </p>
         </div>
      </footer>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number, label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="text-5xl md:text-7xl font-black text-white tabular-nums drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">{value.toString().padStart(2, '0')}</div>
            <div className="text-[10px] uppercase text-yellow-800 font-bold tracking-[0.2em] mt-3">{label}</div>
        </div>
    );
}

function MockRoom({ title, mod, count, isHot = false }: any) {
  return (
    <div className={`p-7 rounded-[2rem] border ${isHot ? 'bg-yellow-500/5 border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.05)]' : 'bg-black border-white/5'}`}>
      <div className="flex justify-between items-start mb-6">
        <h4 className="font-bold text-sm text-white tracking-tight">{title}</h4>
        {isHot && <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
      </div>
      <div className="flex justify-between items-center text-[10px] font-black uppercase">
        <span className="text-gray-600 tracking-tighter">Moderator: {mod}</span>
        <div className="flex items-center gap-1.5 text-green-500">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
          {count} Online
        </div>
      </div>
    </div>
  );
}

function Step({ num, title, desc }: any) {
    return (
        <div className="p-10 border border-white/5 bg-[#0a0a0a] rounded-[2.5rem] hover:border-yellow-500/20 transition-all group">
            <div className="text-5xl font-black text-white/5 group-hover:text-yellow-500/10 transition-colors mb-6">{num}</div>
            <h3 className="text-xl font-black uppercase mb-4 text-white italic">{title}</h3>
            <p className="text-[12px] text-gray-500 leading-relaxed font-medium">{desc}</p>
        </div>
    );
}