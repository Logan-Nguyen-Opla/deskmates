"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Shield, Zap, Target, Lock } from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'waitlist'), (snap) => setCount(snap.size));
    
    // TARGET: Thursday, Feb 26, 2026, 19:00 ICT
    const target = new Date("2026-02-26T19:00:00+07:00").getTime();
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) setJoined(true);
      else throw new Error('Uplink Failed');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-yellow-500 selection:text-black flex flex-col items-center justify-between p-6 md:p-24 overflow-hidden font-sans">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,20,1)_0%,rgba(0,0,0,1)_100%)] z-0" />
      
      {/* Header */}
      <div className="relative z-10 w-full max-w-6xl flex justify-between items-center mb-20">
        <div className="flex items-center gap-4 group">
          <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform duration-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
            <Shield className="text-black w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter uppercase">Deskmates<span className="text-yellow-500">.</span></h1>
        </div>
        <div className="hidden md:flex gap-10 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 italic">
          <span className="text-yellow-500/50 underline decoration-2 underline-offset-8">Phase 01: Synchronization</span>
          <span>Protocol: Omega</span>
          <span>Network: Stable</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-4xl flex-1 flex flex-col justify-center mb-20">
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-yellow-500/5 border border-yellow-500/20 rounded-full mb-10 self-center backdrop-blur-sm">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(234,179,8,1)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500 italic">Incoming Transmission: Global Focus Network</span>
        </div>

        <h2 className="text-7xl md:text-[120px] font-black italic tracking-tighter uppercase leading-[0.85] mb-12 drop-shadow-[0_20px_50px_rgba(0,0,0,1)]">
          The <span className="text-transparent border-t-2 border-b-2 border-white px-2">Final</span> Study <br/>
          <span className="text-yellow-500 drop-shadow-[0_0_40px_rgba(234,179,8,0.4)]">Stronghold.</span>
        </h2>

        {/* Timer */}
        <div className="flex gap-4 md:gap-12 justify-center mb-16 scale-90 md:scale-100">
          {[
            { label: 'Days', val: timeLeft.days },
            { label: 'Hours', val: timeLeft.hours },
            { label: 'Mins', val: timeLeft.mins },
            { label: 'Secs', val: timeLeft.secs }
          ].map((t) => (
            <div key={t.label} className="flex flex-col items-center">
              <span className="text-4xl md:text-6xl font-black italic text-white mb-2 tabular-nums">{String(t.val).padStart(2, '0')}</span>
              <span className="text-[8px] font-black uppercase tracking-[0.5em] text-yellow-500/60">{t.label}</span>
            </div>
          ))}
        </div>

        {!joined ? (
          <form onSubmit={handleSubmit} className="relative group max-w-xl mx-auto w-full">
            <input 
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="ENTER AGENT EMAIL..."
              className="w-full bg-white/5 border-2 border-white/10 p-8 rounded-[2rem] text-center text-xl font-black italic outline-none focus:border-yellow-500 focus:bg-white/10 transition-all placeholder:text-gray-700 mb-6"
            />
            <button 
              disabled={loading}
              className="w-full bg-yellow-500 text-black py-6 rounded-2xl font-black uppercase tracking-widest italic text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_20px_40px_rgba(234,179,8,0.2)]"
            >
              {loading ? 'Synchronizing...' : 'Request Clearance'}
            </button>
          </form>
        ) : (
          <div className="bg-yellow-500/10 border-2 border-yellow-500/30 p-10 rounded-[3rem] animate-in zoom-in duration-500">
            <h3 className="text-3xl font-black italic text-yellow-500 uppercase mb-4 tracking-tighter">Protocol Accepted</h3>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Welcome to the Stronghold. Check your uplink for instructions.</p>
          </div>
        )}
      </div>

      {/* FOOTER - Required for Google Verification */}
      <footer className="relative z-10 w-full max-w-6xl border-t border-white/5 pt-12 pb-20 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">
          © 2026 DESKMATES LABS • OMEGA CLEARANCE REQUIRED
        </p>
        <div className="flex gap-10">
          <a href="/privacy" className="text-[10px] uppercase tracking-widest font-black hover:text-yellow-500 transition-colors">Privacy Policy</a>
          <a href="/terms" className="text-[10px] uppercase tracking-widest font-black hover:text-yellow-500 transition-colors">Terms of Service</a>
        </div>
      </footer>
    </main>
  );
}