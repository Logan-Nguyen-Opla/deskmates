"use client";

import { useState, useEffect } from 'react';
import { GodModeBackground } from '@/components/GodMode';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { CheckCircle, Zap, Shield, Radio, ArrowRight, Cpu, Lock } from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{joined: boolean, pos?: number, priority?: boolean}>({joined: false});
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // MISSION CLOCK: FEB 23, 2026, 6:00 PM ICT
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    // 1. Live Agent Sync
    const unsub = onSnapshot(collection(db, 'waitlist'), (snap) => {
      setCount(snap.size);
    });

    // 2. Countdown Logic
    const target = new Date("2026-02-23T18:00:00+07:00").getTime();
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

    return () => { unsub(); clearInterval(timer); };
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ joined: true, pos: data.position, priority: data.isPriority });
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Synchronization Error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col font-mono overflow-x-hidden selection:bg-yellow-500 selection:text-black">
      <GodModeBackground />

      <main className="relative z-10 flex flex-col items-center justify-center p-6 text-center pt-32">
        {/* STATUS BADGE */}
        <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 px-6 py-2 rounded-full mb-8 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-1000">
            <Radio className="w-3 h-3 text-yellow-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500">
                {count < 100 ? `${100 - count} Founder Spots Remaining` : `${count} Agents Synchronized`}
            </span>
        </div>

        {/* HERO SECTION */}
        <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-500 to-yellow-900 mb-6">
          DESKMATES
        </h1>
        
        <p className="text-lg md:text-2xl font-bold uppercase tracking-[0.4em] mb-16 max-w-3xl text-gray-400">
            Don't study alone. <span className="text-white">Find a team.</span> Grind.
        </p>

        {/* FEATURE GRID: THE "MANIFESTO" */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mb-24 px-4">
            <FeatureCard 
                icon={<Lock className="w-5 h-5" />} 
                title="Neural Isolation" 
                desc="Camera ON. Mic OFF. Focus sessions mediated by the Smart Lobby protocol." 
            />
            <FeatureCard 
                icon={<Cpu className="w-5 h-5" />} 
                title="Smart Lobby" 
                desc="Real-time aggregation of Google Meet and Whereby focus rooms." 
            />
            <FeatureCard 
                icon={<Zap className="w-5 h-5" />} 
                title="Agent Index" 
                desc="Automated focus tracking. Every second on camera earns focus points." 
            />
        </div>

        {/* MISSION CLOCK */}
        <div className="w-full max-w-2xl bg-white/5 border-y border-white/10 py-12 mb-20 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.6em] text-yellow-700 font-black mb-8">System Deployment Countdown</p>
            <div className="grid grid-cols-4 gap-4">
                <TimeUnit value={timeLeft.days} label="Days" />
                <TimeUnit value={timeLeft.hours} label="Hours" />
                <TimeUnit value={timeLeft.mins} label="Mins" />
                <TimeUnit value={timeLeft.secs} label="Secs" />
            </div>
        </div>

        {/* WAITLIST INTERFACE */}
        <div id="signup" className="w-full max-w-xl transition-all duration-700">
            {status.joined ? (
              <div className="bg-[#0a0a0a] border border-yellow-500/40 p-12 rounded-[3rem] animate-in zoom-in duration-500">
                <CheckCircle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tighter text-white">
                  {status.priority ? 'Founder Priority Active' : 'Protocol Accepted'}
                </h3>
                <p className="text-gray-500 text-sm">Agent ID: #{status.pos}. Access Granted Monday 18:00.</p>
              </div>
            ) : (
              <form onSubmit={handleJoin} className="space-y-12">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-yellow-500 rounded-full blur opacity-10 group-focus-within:opacity-25 transition-all"></div>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter student email for clearance..." 
                    className="relative w-full bg-black border border-white/10 p-7 rounded-full text-sm focus:border-yellow-500 outline-none transition-all pr-40 placeholder:text-gray-800"
                  />
                  <button type="submit" disabled={loading} className="absolute right-3 top-3 bottom-3 bg-white text-black px-10 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-yellow-500 transition-all active:scale-95 flex items-center gap-2">
                    {loading ? '...' : 'Request Access'} <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[9px] text-gray-700 uppercase tracking-widest font-bold">
                    Secure Connection Established • V1.0.4-BETA
                </p>
              </form>
            )}
        </div>
      </main>

      <footer className="p-20 border-t border-white/5 text-center">
        <div className="text-[10px] text-gray-800 uppercase font-black tracking-[0.5em] italic">
            A Nguyen Nam Long Project — Deskmates Laboratory 2026
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="bg-[#050505] border border-white/5 p-8 rounded-[2.5rem] text-left hover:border-yellow-500/30 transition-all group">
            <div className="text-yellow-500 mb-6 bg-yellow-500/10 w-fit p-3 rounded-2xl group-hover:scale-110 transition-transform">{icon}</div>
            <h3 className="text-white font-black uppercase tracking-tighter text-xl mb-3">{title}</h3>
            <p className="text-gray-500 text-xs leading-relaxed font-bold uppercase tracking-wider">{desc}</p>
        </div>
    );
}

function TimeUnit({ value, label }: { value: number, label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="text-4xl md:text-6xl font-black text-white tabular-nums drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                {value.toString().padStart(2, '0')}
            </div>
            <div className="text-[9px] uppercase text-yellow-800 font-black tracking-[0.3em] mt-2">{label}</div>
        </div>
    );
}