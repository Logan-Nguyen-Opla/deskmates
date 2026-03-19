"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc, arrayUnion, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { GodModeBackground } from '@/components/GodMode';
import { ShieldCheck, ArrowRight, Clock, BookOpen, Mic, Video, Loader2, AlertTriangle } from 'lucide-react';

export default function BriefingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const ROOMS_PATH = 'rooms';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    if (!id) return;
    const unsubRoom = onSnapshot(doc(db, ROOMS_PATH, id as string), (snap) => {
        if (!snap.exists()) router.push('/'); else setRoom(snap.data());
    });
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (user) onSnapshot(doc(db, 'users', user.uid), (snap) => setUserStats(snap.data() || {}));
    });
    return () => { unsubRoom(); unsubAuth(); clearInterval(timer); };
  }, [id, router]);

  if (!room) return <div className="h-screen bg-black" />;

  // TEMPORAL GATING & LIMITS/briefing/page.tsx]
  const startTime = room.startTime?.toDate();
  const isTooEarly = startTime && currentTime < startTime;
  const isFull = room.approvedAgents?.length >= (room.maxParticipants || 99);
  const isApproved = room.approvedAgents?.includes(auth.currentUser?.uid);
  const hasRequested = room.pendingRequests?.some((r: any) => r.uid === auth.currentUser?.uid);

  const handleJoin = async () => {
    if (isTooEarly) return alert("TEMPORAL LOCK: Room is not open yet.");
    setIsSyncing(true);
    try {
      const sessionRef = await addDoc(collection(db, 'sessions'), { 
        userId: auth.currentUser?.uid, 
        roomId: id, 
        startTime: serverTimestamp(), 
        status: 'active' 
      });
      router.push(`/room/${id}?sessionId=${sessionRef.id}`);
    } catch (e) { setIsSyncing(false); }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono p-4 md:p-8 flex flex-col items-center justify-center w-full">
      <GodModeBackground />
      <div className="max-w-3xl w-full relative z-10">
        <div className="bg-[#0a0a0a] border border-white/5 p-8 md:p-12 rounded-[4rem] space-y-10 shadow-2xl">
            <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">{room.title}</h1>

            {/* STATUS WARNINGS/briefing/page.tsx] */}
            <div className="space-y-4">
              {isTooEarly && (
                <div className="bg-blue-600/10 border border-blue-600/30 p-6 rounded-3xl flex items-center gap-4 text-blue-500 animate-pulse">
                  <Clock className="w-6 h-6" />
                  <div>
                    <p className="text-[10px] font-black uppercase">Temporal Lock Active</p>
                    <p className="text-xs font-bold uppercase tracking-widest">Wait Time: {Math.ceil((startTime.getTime() - currentTime.getTime()) / 60000)}m</p>
                  </div>
                </div>
              )}
              {isFull && !isApproved && (
                <div className="bg-red-600/10 border border-red-600/30 p-6 rounded-3xl flex items-center gap-4 text-red-600">
                  <AlertTriangle className="w-6 h-6" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Uplink Terminated: Maximum Capacity Reached</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Time (VN)</p>
                    <p className="text-xs font-black text-yellow-500">{startTime?.toLocaleTimeString('vi-VN') || 'ASAP'}</p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Occupancy</p>
                    <p className="text-xs font-black text-yellow-500">{room.approvedAgents?.length || 0} / {room.maxParticipants || '∞'}</p>
                </div>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed italic border-l-4 border-yellow-500 pl-8 py-4 bg-white/5 rounded-r-3xl">
                {room.description || "Standard focus session initiated."}
            </p>

            {isApproved ? (
              <button disabled={isSyncing || isTooEarly} onClick={handleJoin} className={`w-full py-8 rounded-[2.5rem] font-black uppercase text-sm flex items-center justify-center gap-6 transition-all ${isTooEarly ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-yellow-500 text-black shadow-2xl hover:scale-[1.02]'}`}>
                {isSyncing ? <Loader2 className="animate-spin" /> : "Establish Neural Link"}
              </button>
            ) : (
              <button onClick={async () => {
                const payload = { uid: auth.currentUser?.uid, displayName: auth.currentUser?.displayName, academic: { reputation: userStats?.reputation || 100 } };
                await updateDoc(doc(db, ROOMS_PATH, id as string), { pendingRequests: arrayUnion(payload) });
                alert("REQUEST TRANSMITTED.");
              }} disabled={hasRequested || isFull} className="w-full border border-white/20 text-gray-400 py-8 rounded-[2.5rem] font-black uppercase text-sm hover:text-white transition-all">
                {hasRequested ? 'Clearance Pending...' : 'Request Access'}
              </button>
            )}
        </div>
      </div>
    </div>
  );
}