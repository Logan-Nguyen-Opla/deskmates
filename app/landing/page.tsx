"use client";

import { useState, useEffect } from 'react';
import { GodModeBackground } from '@/components/GodMode';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Radio, CheckCircle, Zap, Shield, Users } from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{joined: boolean, pos?: number, priority?: boolean}>({joined: false});
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Real-time synchronization of the waitlist count
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'waitlist'), (snap) => {
      setCount(snap.size);
    });
    return () => unsub();
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
        {/* LIVE COUNTER BADGE */}
        <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 px-6 py-2 rounded-full mb-10 backdrop-blur-md">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500">
                {count < 100 ? `${100 - count} Founder Spots Remaining` : `${count} Agents Synchronized`}
            </span>
        </div>

        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-500 to-yellow-900 mb-6">
          DESKMATES
        </h1>
        
        <p className="text-lg md:text-2xl font-bold uppercase tracking-[0.3em] mb-16">
            Stop Studying Alone.
        </p>

        <div id="signup" className="w-full max-w-xl">
            {status.joined ? (
              <div className="bg-[#0a0a0a] border border-yellow-500/40 p-12 rounded-[3rem] space-y-6 animate-in zoom-in duration-500">
                <div className="relative inline-block">
                    <CheckCircle className="w-16 h-16 text-yellow-500 mx-auto" />
                    {status.priority && <Zap className="w-6 h-6 text-yellow-500 absolute -top-2 -right-2 fill-yellow-500 animate-bounce" />}
                </div>
                <div>
                    <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tighter">
                        {status.priority ? 'Founder Priority Active' : 'Protocol Accepted'}
                    </h3>
                    <p className="text-gray-500 text-sm">You are Agent #{status.pos}. Confirmation sent to your inbox.</p>
                </div>
                {status.priority && (
                    <div className="text-[10px] text-yellow-800 font-black uppercase tracking-widest border border-yellow-900/30 py-2 rounded-lg">
                        Lifetime Priority Badge Secured
                    </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleJoin} className="space-y-12">
                <div className="relative group max-w-md mx-auto">
                  <div className="absolute -inset-1 bg-yellow-500 rounded-full blur opacity-10 group-focus-within:opacity-20 transition-all"></div>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter student email..." 
                    className="relative w-full bg-black border border-white/10 p-7 rounded-full text-sm focus:border-yellow-500 outline-none transition-all pr-40 placeholder:text-gray-800"
                  />
                  <button type="submit" disabled={loading} className="absolute right-3 top-3 bottom-3 bg-white text-black px-10 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-yellow-500 transition-all active:scale-95">
                    {loading ? '...' : 'Join'}
                  </button>
                </div>
                <p className="text-[10px] text-gray-700 uppercase font-black tracking-widest">A community-first build for students</p>
              </form>
            )}
        </div>
      </div>

      {/* RECTANGULAR WORKFLOW SECTION */}
      <div className="relative z-10 py-32 px-6 border-t border-white/5 bg-[#030303]">
        <div className="max-w-6xl mx-auto">
            <h2 className="text-center text-4xl font-black italic uppercase text-white mb-20">The Protocol</h2>
            <div className="grid md:grid-cols-4 gap-6">
                <VerticalStep num="01" title="Lobby Sync" desc="Browse active sessions. See who's online and find a study team instantly. No more dead links or isolated studying." />
                <VerticalStep num="02" title="Check-In" desc="Join a room to start your focus timer. The system automatically routes you to the secure Google Meet session." />
                <VerticalStep num="03" title="Deep Work" desc="Focus with peers under the core community rules: Camera ON for accountability, Microphone OFF for silence." />
                <VerticalStep num="04" title="Rank Up" desc="Finish to claim Focus Points. Your effort is tracked and ranked on the national weekly leaderboard." />
            </div>
        </div>
      </div>

      <footer className="relative z-10 p-20 border-t border-white/5 text-center text-[10px] text-gray-800 uppercase font-black tracking-[0.5em] italic">
        A Nguyen Nam Long Project — Deskmates Laboratory 2026
      </footer>
    </div>
  );
}

function VerticalStep({ num, title, desc }: any) {
    return (
        <div className="p-10 min-h-[460px] border border-white/5 bg-[#0a0a0a] rounded-[2.5rem] flex flex-col hover:border-yellow-500/20 transition-all group">
            <div className="text-6xl font-black text-yellow-500 mb-10 opacity-70 group-hover:opacity-100 transition-opacity">{num}</div>
            <h3 className="text-2xl font-black uppercase mb-6 text-white italic tracking-tighter">{title}</h3>
            <p className="text-[13px] text-gray-500 leading-relaxed font-bold uppercase tracking-wide">{desc}</p>
        </div>
    );
}