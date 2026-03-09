"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { GodModeBackground } from '@/components/GodMode';
import { ShieldCheck, ArrowRight, Clock, BookOpen, Mic, Video, MicOff, VideoOff } from 'lucide-react';

export default function BriefingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);

  const ROOMS_PATH = 'rooms'; // UNIFIED PATH

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

  // THE FIX: Decodes Firestore Timestamp safely to Vietnam Time
  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'AWAITING DEPLOYMENT';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString('en-GB', { 
        timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'long', timeStyle: 'short' 
      });
    }
    return 'TIME FORMAT ERROR';
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono p-4 md:p-8 flex flex-col items-center justify-center">
      <GodModeBackground />
      <div className="max-w-3xl w-full space-y-8 relative z-10 pt-10">
        <div className="bg-[#0a0a0a] border border-white/5 p-8 md:p-12 rounded-[4rem] space-y-12 shadow-2xl">
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-yellow-500">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em]">Neural Briefing Protocol</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black italic text-white uppercase tracking-tighter leading-none">{room.title}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-2 flex items-center gap-2"><Clock className="w-3 h-3"/> Session Time</p>
                    <p className="text-sm font-black text-yellow-500 italic uppercase">
                      {formatTime(room.startTime)}
                    </p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-2 flex items-center gap-2"><BookOpen className="w-3 h-3"/> Target Subject</p>
                    <p className="text-sm font-black text-yellow-500 italic uppercase">{room.subject || 'GENERAL STUDY'}</p>
                </div>
            </div>

            <div className="space-y-6">
                <p className="text-gray-400 text-sm leading-relaxed italic border-l-4 border-yellow-500 pl-8 py-4 bg-white/5 rounded-r-3xl">
                    {room.description || "Standard study session initiated. Complete focus is required."}
                </p>
                
                {/* THE HARDWARE CHECKLIST UI */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl flex items-center gap-4 border ${room.reqMic ? 'bg-red-600/10 border-red-600/20 text-red-600' : 'bg-[#00FF94]/10 border-[#00FF94]/20 text-[#00FF94]'}`}>
                      {room.reqMic ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                      <p className="text-[10px] font-black uppercase tracking-widest">{room.reqMic ? "Mic Required" : "Mic Optional"}</p>
                  </div>
                  <div className={`p-4 rounded-2xl flex items-center gap-4 border ${room.reqCamera ? 'bg-red-600/10 border-red-600/20 text-red-600' : 'bg-[#00FF94]/10 border-[#00FF94]/20 text-[#00FF94]'}`}>
                      {room.reqCamera ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                      <p className="text-[10px] font-black uppercase tracking-widest">{room.reqCamera ? "Cam Required" : "Cam Optional"}</p>
                  </div>
                </div>
            </div>

            {isApproved ? (
              <button onClick={() => router.push(`/room/${id}`)} className="w-full bg-yellow-500 text-black py-8 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.5em] flex items-center justify-center gap-6 hover:scale-[1.02] transition-transform shadow-[0_0_40px_rgba(255,215,0,0.2)]">Synchronize Link <ArrowRight className="w-5 h-5" /></button>
            ) : (
              <button onClick={requestAccess} disabled={hasRequested} className="w-full border border-white/20 text-gray-400 py-8 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.5em] hover:text-white hover:border-white transition-all">
                {hasRequested ? 'Clearance Pending...' : 'Request Operation Access'}
              </button>
            )}
        </div>
        <button onClick={() => router.push('/')} className="text-[10px] text-gray-700 uppercase font-black tracking-widest mx-auto block hover:text-white transition-colors">Abort Mission</button>
      </div>
    </div>
  );
}