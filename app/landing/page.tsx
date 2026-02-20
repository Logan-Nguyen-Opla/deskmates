"use client";

import { useState, useEffect } from 'react';
import { GodModeBackground } from '@/components/GodMode';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { CheckCircle, Zap, Radio, ArrowRight, Cpu, Lock, Globe, Users } from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{joined: boolean, pos?: number, priority?: boolean}>({joined: false});
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
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
      if (res.ok) setStatus({ joined: true, pos: data.position, priority: data.isPriority });
      else alert(data.error);
    } catch (err) { alert("Sync Failure."); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col font-mono overflow-x-hidden selection:bg-yellow-500 selection:text-black">
      <GodModeBackground />

      <main className="relative z-10 flex flex-col items-center p-6 text-center pt-32">
        {/* AGENT COUNTER */}
        <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 px-6 py-2 rounded-full mb-8 backdrop-blur-md">
            <Radio className="w-3 h-3 text-yellow-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500">
                {count < 100 ? `${100 - count} Founder Spots Remaining` : `${count} Agents Synchronized`}
            </span>
        </div>

        {/* HERO - FIXED CLIPPING WITH PR-4 */}
        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-500 to-yellow-900 mb-6 pr-4">
          DESKMATES
        </h1>
        
        <p className="text-lg md:text-2xl font-bold uppercase tracking-[0.4em] mb-24 max-w-3xl text-gray-500">
            Social Study <span className="text-white">Aggregator</span> Protocol.
        </p>

        {/* SECTION: THE UTILITY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl w-full mb-32 px-4 text-left">
            <div className="space-y-6">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter border-l-4 border-yellow-500 pl-6">Mission Briefing</h2>
                <p className="text-gray-400 text-sm leading-relaxed uppercase font-bold tracking-wide">
                    Deskmates is a centralized hub for high-intensity study sessions. We solve academic isolation by syncing global agents into 
                    coordinated focus blocks.
                </p>
                <div className="flex gap-4">
                    <StatBox icon={<Globe className="w-4 h-4"/>} label="Global" value="Sync" />
                    <StatBox icon={<Users className="w-4 h-4"/>} label="Direct" value="Link" />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
                <FeatureSmall icon={<Lock />} title="Neural Privacy" desc="Mic-off enforcement by default." />
                <FeatureSmall icon={<Cpu />} title="Direct Uplink" desc="One-click access to Whereby/Meet." />
            </div>
        </div>

        {/* WAITLIST INTERFACE */}
        <div className="w-full max-w-xl mb-32">
            {status.joined ? (
              <div className="bg-[#0a0a0a] border border-yellow-500/40 p-12 rounded-[3rem] animate-in zoom-in">
                <CheckCircle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tighter">Identity Verified</h3>
                <p className="text-gray-500 text-sm">Agent ID: #{status.pos}. Watch for the signal.</p>
              </div>
            ) : (
              <form onSubmit={handleJoin} className="space-y-12">
                <div className="relative">
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter student email..." 
                    className="relative w-full bg-black border border-white/10 p-7 rounded-full text-sm focus:border-yellow-500 outline-none pr-40"
                  />
                  <button type="submit" disabled={loading} className="absolute right-3 top-3 bottom-3 bg-white text-black px-10 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-yellow-500 transition-all flex items-center gap-2">
                    {loading ? '...' : 'Get Access'} <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </form>
            )}
        </div>

        {/* MISSION CLOCK */}
        <div className="w-full max-w-2xl border-y border-white/5 py-16 mb-20">
            <p className="text-[10px] uppercase tracking-[0.5em] text-yellow-700 font-black mb-10 text-center">Protocol Activation Countdown</p>
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

function FeatureSmall({ icon, title, desc }: any) {
    return (
        <div className="bg-white/5 border border-white/5 p-6 rounded-2xl flex items-start gap-4">
            <div className="text-yellow-500 mt-1">{icon}</div>
            <div>
                <h4 className="font-black uppercase text-xs text-white mb-1 tracking-widest">{title}</h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase">{desc}</p>
            </div>
        </div>
    );
}

function StatBox({ icon, label, value }: any) {
    return (
        <div className="flex-1 bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-xl">
            <div className="text-yellow-500 mb-2">{icon}</div>
            <p className="text-[9px] text-yellow-800 font-black uppercase mb-1">{label}</p>
            <p className="text-xl font-black italic">{value}</p>
        </div>
    );
}

function TimeUnit({ value, label }: any) {
    return (
        <div className="flex flex-col items-center">
            <div className="text-4xl md:text-6xl font-black text-white">{value.toString().padStart(2, '0')}</div>
            <div className="text-[9px] uppercase text-yellow-800 font-black mt-2 tracking-widest">{label}</div>
        </div>
    );
}