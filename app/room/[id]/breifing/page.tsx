"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GodModeBackground } from '@/components/GodMode';
import { Users, Info, ShieldCheck, ArrowRight } from 'lucide-react';

export default function BriefingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    return onSnapshot(doc(db, 'artifacts/deskmates-online/public/data/rooms', id as string), (snap) => {
        if (!snap.exists()) router.push('/');
        else setRoom(snap.data());
    });
  }, [id]);

  if (!room) return <div className="h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white font-mono p-8 flex flex-col items-center justify-center">
      <GodModeBackground />
      
      <div className="max-w-2xl w-full space-y-8 relative z-10">
        <div className="bg-[#0a0a0a] border border-white/5 p-12 rounded-[4rem] space-y-10 shadow-2xl">
            <div className="space-y-2">
                <div className="flex items-center gap-3 text-yellow-500 mb-4">
                    <Info className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em]">Session Briefing</span>
                </div>
                <h1 className="text-5xl font-black italic text-white uppercase tracking-tighter leading-none">{room.title}</h1>
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Protocol ID: {id?.slice(0,12)}</p>
            </div>

            <div className="space-y-4">
                <p className="text-gray-400 text-sm leading-relaxed italic border-l-4 border-yellow-500 pl-6 py-2">
                    {room.description || "Standard study session initiated. Synchronize your focus with the collective network. Microphones must remain muted."}
                </p>
            </div>

            <div className="bg-black/50 p-6 rounded-3xl border border-white/5 space-y-4">
                <h4 className="text-[10px] text-gray-500 font-black uppercase flex items-center gap-2"><Users className="w-3 h-3"/> Active Agents</h4>
                <div className="flex flex-wrap gap-3">
                    <div className="px-4 py-2 bg-yellow-500/10 rounded-full border border-yellow-500/20 text-[10px] text-yellow-500 font-black uppercase tracking-widest">★ FOUNDER</div>
                    {/* Map participants here if you have a participant sub-collection */}
                </div>
            </div>

            <button 
                onClick={() => router.push(`/room/${id}`)}
                className="w-full bg-white text-black py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-yellow-500 transition-all group"
            >
                Synchronize Neural Link <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </button>
        </div>
        <button onClick={() => router.push('/')} className="text-[10px] text-gray-600 uppercase font-black tracking-widest mx-auto block hover:text-white transition-colors underline underline-offset-8">Abort Synchronization</button>
      </div>
    </div>
  );
}