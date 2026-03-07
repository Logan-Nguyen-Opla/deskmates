"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { GodModeBackground } from '@/components/GodMode';
import { ShieldCheck, ArrowRight, Clock, Users, BookOpen } from 'lucide-react';

export default function BriefingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);

  const ROOMS_PATH = 'artifacts/deskmates-online/public/data/rooms';

  useEffect(() => {
    if (!id) return;
    const unsubRoom = onSnapshot(doc(db, ROOMS_PATH, id as string), (snap) => {
        if (!snap.exists()) router.push('/');
        else setRoom(snap.data());
    });
    const unsubUser = onSnapshot(doc(db, 'users', auth.currentUser?.uid || 'none'), (snap) => setUserStats(snap.data()));
    return () => { unsubRoom(); unsubUser(); };
  }, [id, router]);

  const requestAccess = async () => {
    await updateDoc(doc(db, ROOMS_PATH, id as string), {
      pendingRequests: arrayUnion({
        uid: auth.currentUser?.uid,
        displayName: auth.currentUser?.displayName,
        academic: userStats
      })
    });
    alert("TRANSMISSION SENT. AWAITING MODERATOR APPROVAL.");
  };

  if (!room) return <div className="h-screen bg-black" />;

  const isApproved = room.approvedAgents?.includes(auth.currentUser?.uid);
  const hasRequested = room.pendingRequests?.some((r: any) => r.uid === auth.currentUser?.uid);

  return (
    <div className="min-h-screen bg-black text-white font-mono p-8 flex flex-col items-center justify-center">
      <GodModeBackground />
      <div className="max-w-3xl w-full space-y-8 relative z-10">
        <div className="bg-[#0a0a0a] border border-white/5 p-12 rounded-[4rem] space-y-12 shadow-2xl">
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-yellow-500">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em]">Neural Briefing Protocol</span>
                </div>
                <h1 className="text-6xl font-black italic text-white uppercase tracking-tighter leading-none">{room.title}</h1>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-2 flex items-center gap-2"><Clock className="w-3 h-3"/> Session Time</p>
                    <p className="text-sm font-black text-yellow-500 italic">{room.time?.replace('T', ' • ')}</p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-2 flex items-center gap-2"><BookOpen className="w-3 h-3"/> Target Grade</p>
                    <p className="text-sm font-black text-yellow-500 italic">{room.grade || 'OPEN'}</p>
                </div>
            </div>

            <div className="space-y-6">
                <p className="text-gray-400 text-sm leading-relaxed italic border-l-4 border-yellow-500 pl-8 py-4 bg-white/5 rounded-r-3xl">
                    {room.desc || "Standard study session initiated. Microphones strictly off."}
                </p>
                <div className="bg-red-600/10 border border-red-600/20 p-4 rounded-2xl flex items-center gap-4">
                    <ShieldCheck className="text-red-600 w-5 h-5" />
                    <p className="text-[10px] font-black uppercase text-red-600">Requirement: {room.reqs || "Absolute Silence"}</p>
                </div>
            </div>

            {isApproved ? (
              <button onClick={() => router.push(`/room/${id}`)} className="w-full bg-white text-black py-8 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.5em] flex items-center justify-center gap-6 hover:bg-yellow-500 transition-all">Synchronize Link <ArrowRight className="w-5 h-5" /></button>
            ) : (
              <button onClick={requestAccess} disabled={hasRequested} className="w-full border border-white/20 text-gray-500 py-8 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.5em] hover:text-white hover:border-white transition-all">
                {hasRequested ? 'Clearance Pending...' : 'Request Operation Access'}
              </button>
            )}
        </div>
      </div>
    </div>
  );
}