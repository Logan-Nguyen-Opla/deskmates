"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, increment, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { GodModeBackground } from '@/components/GodMode';
import { getRole, UserRole } from '@/utils/roles'; // FIXED: Imported UserRole

export default function RoomPage() {
  // THE FIX: Set the state to accept the UserRole object instead of a string
  const [role, setRole] = useState<UserRole | null>(null); 
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id: rawRoomId } = useParams();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const secondsRef = useRef(0);

  const [jitsiRoomId] = useState(() => `Deskmates-Session-${Math.random().toString(36).substring(2, 10)}-${Date.now().toString(36)}`);
  const roomId = Array.isArray(rawRoomId) ? rawRoomId[0] : rawRoomId || "unknown";

  const ROOMS_PATH = 'rooms';

  useEffect(() => {
    if (!sessionId || !roomId) return;
    const init = async () => {
       const user = auth.currentUser;
       if (user) {
           const userDoc = await getDoc(doc(db, 'users', user.uid));
           setRole(getRole(user, userDoc.data())); // Now safely accepts the object
       }
       setLoading(false);
    };
    init();
    const interval = setInterval(() => { secondsRef.current += 1; }, 1000);
    return () => clearInterval(interval);
  }, [sessionId, roomId]);

  const handleEndSession = useCallback(async () => {
    if (!sessionId || !auth.currentUser) return;
    const points = Math.floor(secondsRef.current / 60);
    try {
        await updateDoc(doc(db, 'sessions', sessionId as string), { status: 'completed', endTime: serverTimestamp(), durationSeconds: secondsRef.current, pointsEarned: points });
        await setDoc(doc(db, 'users', auth.currentUser.uid), { totalPoints: increment(points), totalSeconds: increment(secondsRef.current), sessionsCount: increment(1) }, { merge: true });
    } catch (e) { console.error("Sync Error:", e); }
  }, [sessionId]);

  useEffect(() => {
    if (!roomId) return;
    const unsub = onSnapshot(doc(db, ROOMS_PATH, roomId), (snap) => {
        if (!snap.exists() || snap.data()?.status === 'closed') {
            handleEndSession().then(() => {
                alert("Protocol Terminated by High Command.");
                router.push('/');
            });
        }
    });
    return () => unsub();
  }, [roomId, handleEndSession, router]);

  if (loading) return <div className="h-screen bg-black text-yellow-500 flex flex-col items-center justify-center font-mono gap-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>DECRYPTING CHANNEL...</div>;

  return (
    <div className={`h-screen flex flex-col relative overflow-hidden ${role?.isFounder ? 'bg-black' : 'bg-[#050505]'}`}>
      {role?.isFounder && <GodModeBackground />}

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

      <div className="flex-1 relative z-10">
        <JitsiMeeting
            domain="meet.jit.si"
            roomName={jitsiRoomId} 
            configOverwrite={{ startWithAudioMuted: true, disableThirdPartyRequests: true, prejoinPageEnabled: false, enableWelcomePage: false, enableClosePage: false, disableLobby: true }}
            interfaceConfigOverwrite={{ SHOW_JITSI_WATERMARK: false, HIDE_INVITE_MORE_HEADER: true, TOOLBAR_BUTTONS: ['camera', 'chat', 'microphone', 'raisehand', 'tileview', 'hangup'] }}
            userInfo={{ displayName: auth.currentUser?.displayName || "Agent", email: auth.currentUser?.email || "" }}
            onApiReady={(api) => { api.addListener('videoConferenceLeft', () => { handleEndSession(); router.push('/profile'); }); }}
            getIFrameRef={(iframe) => { 
              iframe.style.height = '100%'; 
              iframe.style.border = 'none'; 
              // THE FIX: Converted to object checks
              if (role?.isFounder) iframe.style.boxShadow = 'inset 0 0 100px rgba(255, 215, 0, 0.15)';
              else if (role?.canManageRooms) iframe.style.boxShadow = 'inset 0 0 100px rgba(0, 255, 148, 0.1)';
            }}
        />
      </div>

      {/* THE FIX: Converted to canManageRooms check */}
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