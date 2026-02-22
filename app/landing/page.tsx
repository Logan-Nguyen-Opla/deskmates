"use client";

import { useState, useEffect } from 'react';
import { GodModeBackground } from '@/components/GodMode';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { CheckCircle, Zap, Radio, ArrowRight, Lock, Cpu, Globe } from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{joined: boolean, pos?: number, priority?: boolean}>({joined: false});
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // LAUNCH: FEB 23, 2026, 18:00 ICT
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'waitlist'), (snap) => setCount(snap.size));
    const target = new Date("2026-02-23T18:00:00+07:00").getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;
      if (distance < 0) clearInterval(timer);
      else {
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
        // This will now tell you EXACTLY what's wrong (e.g., "Missing API Key")
        alert(`Uplink Failed: ${data.error}`);
      }
    } catch (err) {
      alert("Network Timeout: Communication with High Command lost.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col font-sans overflow-x-hidden selection:bg-yellow-500 selection:text-black">
      <GodModeBackground />

      <main className="relative z-10 flex flex-col items-center p-6 text-center pt-32">
        <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 px-6 py-2 rounded-full mb-8">
            <Radio className="w-3 h-3 text-yellow-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500">
                {count < 100 ? `${100 - count} Founder Spots Remaining` : `${count} Agents Synchronized`}
            </span>
        </div>

        {/* FIXED: Added pr-6 to stop italic clipping */}
        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-500 to-yellow-900 mb-6 pr-6">
          DESKMATES
        </h1>
        
        <p className="text-lg md:text-2xl font-bold uppercase tracking-[0.4em] mb-24 max-w-3xl text-gray-500">
            Smart Study <span className="text-white">Lobby</span> Protocol.
        </p>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mb-32 px-4">
            <FeatureCard icon={<Lock />} title="Neural Privacy" desc="Mic-off enforcement for absolute focus." />
            <FeatureCard icon={<Cpu />} title="Smart Sync" desc="Real-time session aggregation." />
            <FeatureCard icon={<Globe />} title="Global Link" desc="Study with students across the globe." />
        </div>

        {/* WAITLIST */}
        <div className="w-full max-w-xl mb-32">
            {status.joined ? (
              <div className="bg-[#0a0a0a] border border-yellow-500/40 p-12 rounded-[3rem] animate-in zoom-in">
                <CheckCircle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tighter text-white">Protocol Accepted</h3>
                <p className="text-gray-500 text-sm italic font-bold">Agent ID: #{status.pos}. Access Granted Feb 23.</p>
              </div>
            ) : (
              <form onSubmit={handleJoin} className="space-y-12">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-yellow-500 rounded-full blur opacity-10 group-focus-within:opacity-20 transition-all"></div>
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter student email..." 
                    className="relative w-full bg-black border border-white/10 p-7 rounded-full text-sm focus:border-yellow-500 outline-none pr-44"
                  />
                  <button type="submit" disabled={loading} className="absolute right-3 top-3 bottom-3 bg-white text-black px-10 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-yellow-500 transition-all">
                    {loading ? '...' : 'Request Access'}
                  </button>
                </div>
              </form>
            )}
        </div>

        {/* COUNTDOWN */}
        <div className="w-full max-w-2xl border-y border-white/5 py-16 mb-20">
            <p className="text-[10px] uppercase tracking-[0.6em] text-yellow-800 font-black mb-10">Uplink Activation Countdown</p>
            <div className="grid grid-cols-4 gap-4">
                <TimeUnit value={timeLeft.days} label="Days" />
                <TimeUnit value={timeLeft.hours} label="Hours" />
                <TimeUnit value={timeLeft.mins} label="Mins" />
                <TimeUnit value={timeLeft.secs} label="Secs" />
            </div>
        </div>
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

function TimeUnit({ value, label }: any) {
    return (
        <div className="flex flex-col items-center">
            <div className="text-4xl md:text-6xl font-black text-white">{value.toString().padStart(2, '0')}</div>
            <div className="text-[9px] uppercase text-yellow-800 font-black mt-2 tracking-[0.4em]">{label}</div>
        </div>
    );
}