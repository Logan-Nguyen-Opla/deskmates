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
  
  // Launch Target: February 22, 2026, 6:00 PM ICT (Vietnam Time)
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
      // Saves directly to your Firestore waitlist collection
      await addDoc(collection(db, 'waitlist'), {
        email: email,
        timestamp: serverTimestamp(),
        source: 'landing_page'
      });
      setJoined(true);
      setEmail("");
    } catch (err) {
      alert("Synchronization Error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-mono selection:bg-yellow-500 selection:text-black overflow-x-hidden">
      <GodModeBackground />

      {/* Cookie Banner */}
      {showCookies && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl">
          <div className="bg-[#0a0a0a]/95 border border-white/10 p-6 rounded-[2rem] backdrop-blur-2xl flex items-center justify-between gap-6 shadow-2xl">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                We use cookies to synchronize your focus session and optimize the protocol.
            </p>
            <button 
              onClick={() => { localStorage.setItem('cookie_consent', 'true'); setShowCookies(false); }} 
              className="bg-white text-black px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest"
            >
              Accept
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="flex items-center gap-2 text-yellow-500 mb-8 px-4 py-1.5 border border-yellow-500/20 rounded-full bg-yellow-500/5">
          <Radio className="w-3 h-3 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Signal: Alpha 1.0</span>
        </div>

        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-500 to-yellow-900 mb-4">
          DESKMATES
        </h1>
        
        <p className="text-xl md:text-2xl font-bold uppercase tracking-[0.3em] mb-4">Don't study alone. Find a team. Join Meet. Grind.</p>
        <p className="text-sm text-gray-500 max-w-xl leading-loose mb-12">
            The smart lobby for students. We provide the schedule, the community, and the gamification to keep you focused.
        </p>

        {/* Working Countdown */}
        <div className="grid grid-cols-4 gap-6 md:gap-12 mb-16 border-y border-white/5 py-10 w-full max-w-2xl">
            <TimeUnit value={timeLeft.days} label="Days" />
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <TimeUnit value={timeLeft.mins} label="Mins" />
            <TimeUnit value={timeLeft.secs} label="Secs" />
        </div>

        <a href="#signup" className="bg-yellow-500 text-black px-12 py-6 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform">
            Join the Waitlist
        </a>
      </div>

      {/* Static Lobby Preview */}
      <div className="relative z-10 py-24 px-6 flex flex-col items-center">
        <div className="text-center mb-10">
          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em] mb-2">Preview of what Deskmates looks like</p>
          <div className="h-[1px] w-12 bg-gray-800 mx-auto"></div>
        </div>

        <div className="relative w-full max-w-4xl bg-[#080808] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl opacity-60">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40">
              <span className="text-yellow-500/50 font-black italic text-[10px] tracking-widest">LOBBY_INTERFACE_PREVIEW</span>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-white/10"></div>
                <div className="w-2 h-2 rounded-full bg-white/10"></div>
                <div className="w-2 h-2 rounded-full bg-white/10"></div>
              </div>
            </div>
            <div className="p-10 grid md:grid-cols-2 gap-4 pointer-events-none">
              <MockRoom title="Advanced Math 12" mod="Mod Long" count="24" isHot={true} />
              <MockRoom title="English Grammar Prep" mod="Mod Sarah" count="12" />
              <MockRoom title="Final Exam Marathon" mod="Mod Khanh" count="45" isHot={true} />
              <MockRoom title="Science Hub" mod="Mod Minh" count="8" />
            </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="relative z-10 py-32 px-6 border-t border-white/5 bg-[#030303]">
        <div className="max-w-6xl mx-auto">
            <h2 className="text-center text-4xl font-black italic uppercase text-white mb-20">The Protocol Workflow</h2>
            <div className="grid md:grid-cols-4 gap-6">
                <Step num="01" title="The Lobby" desc="Browse active rooms and find your team." />
                <Step num="02" title="Check-In" desc="Start the timer and join the Google Meet link." />
                <Step num="03" title="Deep Work" desc="Focus with camera ON and microphone OFF." />
                <Step num="04" title="Check-Out" desc="Finish to claim your Focus Points." />
            </div>
        </div>
      </div>

      {/* Waitlist Section */}
      <div id="signup" className="relative z-10 py-32 px-6">
        <div className="max-w-xl mx-auto text-center">
            {joined ? (
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-12 rounded-[3.5rem] animate-in fade-in zoom-in">
                <CheckCircle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                <h3 className="text-3xl font-black uppercase italic mb-4">You are synced</h3>
                <p className="text-gray-400 text-sm">We will ping you when the protocol goes live on February 22nd.</p>
              </div>
            ) : (
              <form onSubmit={handleJoin} className="space-y-10">
                <div className="space-y-4">
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter">Join 500+ Students</h2>
                    <p className="text-gray-500 text-sm">Reserve your spot on the national leaderboard today.</p>
                </div>
                <div className="relative max-w-md mx-auto">
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter student email..." 
                    className="w-full bg-black border border-white/10 p-7 rounded-full text-sm focus:border-yellow-500 outline-none pr-40"
                  />
                  <button type="submit" className="absolute right-3 top-3 bottom-3 bg-white text-black px-8 rounded-full font-black text-[11px] uppercase tracking-widest">
                    Join
                  </button>
                </div>
              </form>
            )}
        </div>
      </div>

      <footer className="relative z-10 p-20 border-t border-white/5 text-center">
         <p className="text-[10px] text-gray-700 uppercase tracking-[0.5em] font-black italic">
            A Nguyen Nam Long Project — Deskmates Laboratory 2026
         </p>
      </footer>
    </div>
  );
}

// Sub-components
function TimeUnit({ value, label }: { value: number, label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="text-5xl md:text-7xl font-black text-white tabular-nums">{value.toString().padStart(2, '0')}</div>
            <div className="text-[10px] uppercase text-yellow-800 font-bold tracking-[0.2em] mt-3">{label}</div>
        </div>
    );
}

function MockRoom({ title, mod, count, isHot = false }: any) {
  return (
    <div className={`p-6 rounded-[2rem] border ${isHot ? 'bg-yellow-500/5 border-yellow-500/10' : 'bg-black border-white/5'}`}>
      <div className="flex justify-between items-start mb-6">
        <h4 className="font-bold text-sm text-white">{title}</h4>
        {isHot && <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
      </div>
      <div className="flex justify-between items-center text-[10px] font-black uppercase">
        <span className="text-gray-600">Mod: {mod}</span>
        <div className="flex items-center gap-1.5 text-green-500">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          {count} Online
        </div>
      </div>
    </div>
  );
}

function Step({ num, title, desc }: any) {
    return (
        <div className="p-10 border border-white/5 bg-[#0a0a0a] rounded-[2.5rem] group">
            <div className="text-5xl font-black text-white/5 group-hover:text-yellow-500/10 transition-colors mb-6">{num}</div>
            <h3 className="text-xl font-black uppercase mb-4 text-white italic">{title}</h3>
            <p className="text-[12px] text-gray-500 leading-relaxed font-medium">{desc}</p>
        </div>
    );
}