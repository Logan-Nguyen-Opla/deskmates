"use client";

import { useState, useEffect } from 'react';
import { GodModeBackground } from '@/components/GodMode';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { CheckCircle, Radio, Lock, Cpu, Globe } from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({joined: false, pos: 0});
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'waitlist'), (snap) => setCount(snap.size));
    const target = new Date("2026-03-07T19:00:00+07:00").getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;
      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          secs: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    return () => { unsub(); clearInterval(timer); };
  }, []);

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col font-sans overflow-x-hidden selection:bg-yellow-500 selection:text-black">
      <GodModeBackground />

      <main className="relative z-10 flex flex-col items-center p-6 text-center pt-32">
        <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 px-6 py-2 rounded-full mb-8">
            <Radio className="w-3 h-3 text-yellow-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500">
                {count} Agents Synchronized
            </span>
        </div>

        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-500 to-yellow-900 mb-6 pr-6">
          DESKMATES
        </h1>
        
        <p className="text-lg md:text-2xl font-bold uppercase tracking-[0.4em] mb-24 max-w-3xl text-gray-500">
            Smart Study <span className="text-white">Lobby</span> Protocol.
        </p>

        {/* Reverted Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mb-32 px-4">
            <FeatureCard icon={<Lock />} title="Neural Privacy" desc="Mic-off enforcement for absolute focus." />
            <FeatureCard icon={<Cpu />} title="Smart Sync" desc="Real-time session aggregation." />
            <FeatureCard icon={<Globe />} title="Global Link" desc="Study with students across the globe." />
        </div>

        {/* ... Timer and Email Form remain here ... */}

        {/* Required Footer */}
        <footer className="w-full max-w-6xl border-t border-white/5 pt-12 pb-20 flex gap-10 opacity-40 hover:opacity-100 transition-opacity justify-center">
            <a href="/privacy" className="text-[10px] uppercase tracking-widest font-black hover:text-yellow-500">Privacy Policy</a>
            <a href="/terms" className="text-[10px] uppercase tracking-widest font-black hover:text-yellow-500">Terms of Service</a>
        </footer>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
    return (
        <div className="bg-[#050505] border border-white/5 p-10 rounded-[3rem] text-left">
            <div className="text-yellow-500 mb-6">{icon}</div>
            <h3 className="text-white font-black uppercase text-xl mb-3 tracking-tighter italic">{title}</h3>
            <p className="text-gray-500 text-xs font-bold leading-relaxed uppercase">{desc}</p>
        </div>
    );
}