"use client";

import { useState, useEffect } from 'react';
import { GodModeBackground } from '@/components/GodMode';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { CheckCircle, Zap } from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{joined: boolean, pos?: number, priority?: boolean}>({joined: false});
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // UPDATED LAUNCH DATE: FEB 23, 2026, 6:00 PM VIETNAM (ICT/GMT+7)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'waitlist'), (snap) => {
      setCount(snap.size);
    });

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
    <div className="min-h-screen bg-black text-white flex flex-col font-mono overflow-x-hidden">
      <GodModeBackground />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 px-6 py-2 rounded-full mb-8">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500">
                {count < 100 ? `${100 - count} Founder Spots Remaining` : `${count} Agents Synchronized`}
            </span>
        </div>

        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-500 to-yellow-900 mb-2">
          DESKMATES
        </h1>
        
        <p className="text-xl md:text-2xl font-bold uppercase tracking-[0.3em] mb-12">Don't study alone. Find a team. Grind.</p>

        <div className="grid grid-cols-4 gap-6 md:gap-12 mb-16 border-y border-white/5 py-10 w-full max-w-2xl">
            <TimeUnit value={timeLeft.days} label="Days" />
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <TimeUnit value={timeLeft.mins} label="Mins" />
            <TimeUnit value={timeLeft.secs} label="Secs" />
        </div>

        <div id="signup" className="w-full max-w-xl">
            {status.joined ? (
              <div className="bg-[#0a0a0a] border border-yellow-500/40 p-12 rounded-[3rem] animate-in zoom-in duration-500">
                <CheckCircle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tighter text-white">
                  {status.priority ? 'Founder Priority Active' : 'Protocol Accepted'}
                </h3>
                <p className="text-gray-500 text-sm">Agent ID: #{status.pos}. Watch for the signal.</p>
              </div>
            ) : (
              <form onSubmit={handleJoin} className="space-y-12">
                <div className="relative group max-w-md mx-auto">
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter student email..." 
                    className="relative w-full bg-black border border-white/10 p-7 rounded-full text-sm focus:border-yellow-500 outline-none transition-all pr-40 placeholder:text-gray-800"
                  />
                  <button type="submit" disabled={loading} className="absolute right-3 top-3 bottom-3 bg-white text-black px-10 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-yellow-500 transition-all">
                    {loading ? '...' : 'Join'}
                  </button>
                </div>
              </form>
            )}
        </div>
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number, label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="text-4xl md:text-6xl font-black text-white tabular-nums">{value.toString().padStart(2, '0')}</div>
            <div className="text-[10px] uppercase text-yellow-800 font-bold tracking-widest mt-2">{label}</div>
        </div>
    );
}