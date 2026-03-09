"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, increment, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { GodModeBackground } from '@/components/GodMode';
import { getRole, UserRole } from '@/utils/roles';

// Ensure Jitsi is imported if you are still using the Jitsi engine here. 
// If you are using the Whereby iframe, keep the iframe code instead.
import { JitsiMeeting } from '@jitsi/react-sdk'; 

export default function RoomPage() {
  const [role, setRole] = useState<UserRole | null>(null); 
  const [room, setRoom] = useState<any>(null); 
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const { id: rawRoomId } = useParams();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const secondsRef = useRef(0);

  const roomId = Array.isArray(rawRoomId) ? rawRoomId[0] : rawRoomId || "unknown";
  const ROOMS_PATH = 'rooms';

  useEffect(() => {
    if (!sessionId || !roomId) return;
    
    // THE CRITICAL FIX: Wrap the entire load inside onAuthStateChanged
    // This stops it from checking "auth.currentUser" before Firebase is ready.
    const unsubAuth = auth.onAuthStateChanged(async (user) => {
       if (user) {
           const userDoc = await getDoc(doc(db, 'users', user.uid));
           setRole(getRole(user, userDoc.data()));
       }
       
       // Only listen to the room AFTER we know who the user is
       const unsubRoom = onSnapshot(doc(db, ROOMS_PATH, roomId), (snap) => {
           if (!snap.exists() || snap.data()?.status === 'closed') {
               handleEndSession().then(() => {
                   alert("Protocol Terminated by High Command.");
                   router.push('/');
               });
           } else {
               setRoom(snap.data());
               setLoading(false); // THIS BREAKS THE INFINITE SPINNER
           }
       });
       
       return () => unsubRoom();
    });

    const interval = setInterval(() => { secondsRef.current += 1; }, 1000);
    
    return () => {
      clearInterval(interval);
      unsubAuth();
    };
  }, [sessionId, roomId]);

  const handleEndSession = useCallback(async () => {
    if (!sessionId || !auth.currentUser) return;
    const points = Math.floor(secondsRef.current / 60);
    try {
        await updateDoc(doc(db, 'sessions', sessionId as string), { status: 'completed', endTime: serverTimestamp(), durationSeconds: secondsRef.current, pointsEarned: points });
        await setDoc(doc(db, 'users', auth.currentUser.uid), { totalPoints: increment(points), totalSeconds: increment(secondsRef.current), sessionsCount: increment(1) }, { merge: true });
    } catch (e) { console.error("Sync Error:", e); }
  }, [sessionId]);

  if (loading || !room) return <div className="h-screen bg-black text-yellow-500 flex flex-col items-center justify-center font-mono gap-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>DECRYPTING CHANNEL...</div>;

  // WHEREBY LOGIC
  const isPrivileged = role?.isFounder || role?.canManageRooms || auth.currentUser?.uid === room.moderatorId;
  const rawUrl = isPrivileged ? (room.hostUrl || room.userUrl) : room.userUrl;
  const finalUrl = (rawUrl || "").replace('deskmates.whereby', 'deskmate.whereby');

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-black text-white">
      {/* UNIVERSAL BACKGROUND */}
      <GodModeBackground />

      <div className={`relative z-10 flex justify-between items-center px-6 py-4 border-b backdrop-blur-md ${role?.isFounder ? 'border-yellow-900/50 bg-black/50' : 'border-[#27272a] bg-[#121212]/80'}`}>
         <div className="flex flex-col">
            <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${role?.isFounder ? 'text-yellow-600' : 'text-[#00FF94]'}`}>
                {role?.isFounder ? 'Founder Priority' : 'Secure Uplink'}
            </span>
            <div className="font-bold text-white text-xs font-mono">{roomId.slice(0,8).toUpperCase()}</div>
         </div>
         <button onClick={async () => { await handleEndSession(); router.push('/profile'); }} className="text-[10px] bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded uppercase font-black tracking-widest hover:bg-red-500 hover:text-white transition-all">
            Disconnect
         </button>
      </div>

      <div className="flex-1 relative z-10 p-4 md:p-10">
        <div className={`w-full h-full rounded-[2rem] md:rounded-[4rem] overflow-hidden border-4 shadow-2xl bg-black ${role?.isFounder ? 'border-yellow-500/20 shadow-[0_0_100px_rgba(255,215,0,0.15)]' : (role?.canManageRooms ? 'border-[#00FF94]/20 shadow-[0_0_100px_rgba(0,255,148,0.1)]' : 'border-white/5')}`}>
            <iframe
              src={`${finalUrl}?embed&displayNames=on&background=off&chat=on&people=off`}
              allow="camera; microphone; fullscreen; display-capture"
              className="w-full h-full border-none"
            />
        </div>
      </div>

      {role?.canManageRooms && (
         <div className="absolute bottom-10 left-10 z-20">
             <button onClick={async () => { if (confirm("⚠️ ALERT: Shutdown session?")) await updateDoc(doc(db, ROOMS_PATH, roomId), { status: 'closed' }); }} className={`backdrop-blur border px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.3em] transition-all flex items-center gap-3 shadow-2xl ${role?.isFounder ? 'bg-black/90 border-red-900 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-[#00FF94]/10 border-[#00FF94]/40 text-[#00FF94] hover:bg-[#00FF94] hover:text-black'}`}>
                {role?.isFounder ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                {role?.isFounder ? "EXECUTE NUKE" : "TERMINATE ROOM"}
             </button>
         </div>
      )}
    </div>
  );
}