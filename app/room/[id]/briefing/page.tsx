"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc, arrayUnion, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { GodModeBackground } from '@/components/GodMode';
import { ShieldCheck, ArrowRight, Clock, BookOpen, Mic, Video, MicOff, VideoOff, Loader2 } from 'lucide-react';

export default function BriefingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const ROOMS_PATH = 'rooms';

  useEffect(() => {
    if (!id) return;
    const unsubRoom = onSnapshot(doc(db, ROOMS_PATH, id as string), (snap) => {
        if (!snap.exists()) router.push('/');
        else setRoom(snap.data());
    });
    
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        onSnapshot(doc(db, 'users', user.uid), (snap) => setUserStats(snap.data() || {}));
      }
    });
    return () => { unsubRoom(); unsubAuth(); };
  }, [id, router]);

  // THE CRITICAL FIX: Explicitly strip out undefined values so the request works for Normal Users
  const requestAccess = async () => {
    if (!auth.currentUser) return router.push('/login');
    setIsRequesting(true);
    try {
      const payload = {
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName || "Unknown Agent",
        academic: {
            reputation: userStats?.reputation ?? 100,
            subjects: userStats?.subjects || []
        }
      };

      await updateDoc(doc(db, ROOMS_PATH, id as string), {
        pendingRequests: arrayUnion(payload)
      });
      alert("TRANSMISSION SENT. AWAITING ROOM ADMIN APPROVAL.");
    } catch (error: any) {
      alert("Error sending request. Signal Lost.");
    }
    setIsRequesting(false);
  };

  const handleJoin = async () => {
    if (!auth.currentUser) return router.push('/login');
    setIsSyncing(true);
    try {
      const q = query(collection(db, 'sessions'), where("userId", "==", auth.currentUser.uid), where("roomId", "==", id), where("status", "==", "active"));
      const snapshot = await getDocs(q);
      
      let sessionId = snapshot.empty ? (await addDoc(collection(db, 'sessions'), { userId: auth.currentUser.uid, roomId: id, startTime: serverTimestamp(), status: 'active', pointsEarned: 0 })).id : snapshot.docs[0].id;
      
      router.push(`/room/${id}?sessionId=${sessionId}`);
    } catch (e) {
      alert("Handshake Failed. Try again.");
      setIsSyncing(false);
    }
  };

  if (!room) return <div className="h-screen bg-black" />;

  const isApproved = room.approvedAgents?.includes(auth.currentUser?.uid);
  const hasRequested = room.pendingRequests?.some((r: any) => r.uid === auth.currentUser?.uid);

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
                      {room.startTime?.toDate ? room.startTime.toDate().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short' }) : 'ASAP'}
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
              <button disabled={isSyncing} onClick={handleJoin} className="w-full bg-yellow-500 text-black py-8 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.5em] flex items-center justify-center gap-6 hover:scale-[1.02] transition-transform shadow-[0_0_40px_rgba(255,215,0,0.2)]">
                  {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Synchronize Link <ArrowRight className="w-5 h-5" /></>}
              </button>
            ) : (
              <button onClick={requestAccess} disabled={hasRequested || isRequesting} className="w-full border border-white/20 text-gray-400 py-8 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.5em] hover:text-white hover:border-white transition-all flex items-center justify-center gap-4">
                {isRequesting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {isRequesting ? 'TRANSMITTING...' : (hasRequested ? 'Clearance Pending...' : 'Request Operation Access')}
              </button>
            )}
        </div>
        <button onClick={() => router.push('/')} className="text-[10px] text-gray-700 uppercase font-black tracking-widest mx-auto block hover:text-white transition-colors">Abort Mission</button>
      </div>
    </div>
  );
}