"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc, arrayUnion, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { GodModeBackground } from '@/components/GodMode';
import { ShieldCheck, ArrowRight, Clock, BookOpen, ShieldAlert, Loader2, AlertTriangle } from 'lucide-react';

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

  // LOGIC: Entry Checks
  const startTime = room.startTime?.toDate();
  const isTooEarly = startTime && currentTime < startTime;
  const isFull = room.approvedAgents?.length >= room.maxParticipants;
  const isApproved = room.approvedAgents?.includes(auth.currentUser?.uid);
  const hasRequested = room.pendingRequests?.some((r: any) => r.uid === auth.currentUser?.uid);

  const handleJoin = async () => {
    if (isTooEarly) return alert("PROTOCOL NOT YET ACTIVE.");
    setIsSyncing(true);
    try {
      // PRE-FETCH Whereby data to ensure room exists
      const res = await fetch('/api/rooms/create', { method: 'POST', body: JSON.stringify({ title: room.title }) });
      const sessionRef = await addDoc(collection(db, 'sessions'), { userId: auth.currentUser?.uid, roomId: id, startTime: serverTimestamp(), status: 'active' });
      router.push(`/room/${id}?sessionId=${sessionRef.id}`);
    } catch (e) { setIsSyncing(false); }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono p-4 flex flex-col items-center justify-center">
      <GodModeBackground />
      <div className="max-w-3xl w-full relative z-10">
        <div className="bg-[#0a0a0a] border border-white/5 p-8 md:p-12 rounded-[4rem] space-y-10 shadow-2xl">
            <h1 className="text-5xl font-black italic text-white uppercase tracking-tighter">{room.title}</h1>

            {/* WARNING SYSTEM */}
            <div className="space-y-4">
              {isTooEarly && (
                <div className="bg-blue-600/10 border border-blue-600/30 p-6 rounded-3xl flex items-center gap-4 text-blue-500">
                  <Clock className="w-6 h-6 animate-pulse" />
                  <div>
                    <p className="text-[10px] font-black uppercase">Temporal Lock Active</p>
                    <p className="text-xs italic font-bold">Opens in: {Math.ceil((startTime.getTime() - currentTime.getTime()) / 60000)} minutes</p>
                  </div>
                </div>
              )}
              {isFull && !isApproved && (
                <div className="bg-red-600/10 border border-red-600/30 p-6 rounded-3xl flex items-center gap-4 text-red-600">
                  <AlertTriangle className="w-6 h-6" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Protocol Maximum Capacity Reached</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
                    <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Time (VN)</p>
                    <p className="text-xs font-black text-yellow-500">{startTime?.toLocaleTimeString('vi-VN') || 'ASAP'}</p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
                    <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Occupancy</p>
                    <p className="text-xs font-black text-yellow-500">{room.approvedAgents?.length || 0} / {room.maxParticipants || '∞'}</p>
                </div>
            </div>

            {isApproved ? (
              <button disabled={isSyncing || isTooEarly} onClick={handleJoin} className={`w-full py-8 rounded-[2.5rem] font-black uppercase text-sm flex items-center justify-center gap-6 transition-all ${isTooEarly ? 'bg-gray-800 text-gray-500 grayscale' : 'bg-yellow-500 text-black shadow-2xl hover:scale-[1.02]'}`}>
                {isSyncing ? <Loader2 className="animate-spin" /> : "Establish Neural Link"}
              </button>
            ) : (
              <button onClick={async () => {
                await updateDoc(doc(db, ROOMS_PATH, id as string), { pendingRequests: arrayUnion({ uid: auth.currentUser?.uid, displayName: auth.currentUser?.displayName, academic: { reputation: userStats?.reputation || 100 } }) });
                alert("REQUEST TRANSMITTED.");
              }} disabled={hasRequested || isFull} className="w-full border border-white/20 text-gray-400 py-8 rounded-[2.5rem] font-black uppercase text-sm">
                {hasRequested ? 'Clearance Pending...' : 'Request Access'}
              </button>
            )}
        </div>
      </div>
    </div>
  );
}