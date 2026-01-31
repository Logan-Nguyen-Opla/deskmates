"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, increment, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { GodModeBackground } from '@/components/GodMode';
import { getRole } from '@/utils/roles';

export default function RoomPage() {
  const [role, setRole] = useState('agent');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id: rawRoomId } = useParams(); 
  // FIX: Ensure roomId is always a string for Jitsi
  const roomId = Array.isArray(rawRoomId) ? rawRoomId[0] : rawRoomId || "unknown";
  
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const secondsRef = useRef(0);

  // 1. INIT
  useEffect(() => {
    if (!sessionId || !roomId) return;
    const init = async () => {
       const user = auth.currentUser;
       if (user) {
           const userDoc = await getDoc(doc(db, 'users', user.uid));
           setRole(getRole(user, userDoc.data()));
       }
       setLoading(false);
    };
    init();
    const interval = setInterval(() => { secondsRef.current += 1; }, 1000);
    return () => clearInterval(interval);
  }, [sessionId, roomId]);

  // 2. END SESSION
  const handleEndSession = useCallback(async () => {
    if (!sessionId || !auth.currentUser) return;
    const points = Math.floor(secondsRef.current / 60);
    try {
        await updateDoc(doc(db, 'sessions', sessionId as string), { 
            status: 'completed', endTime: serverTimestamp(), durationSeconds: secondsRef.current, pointsEarned: points 
        });
        await setDoc(doc(db, 'users', auth.currentUser.uid), { 
            totalPoints: increment(points), totalSeconds: increment(secondsRef.current), sessionsCount: increment(1) 
        }, { merge: true });
    } catch (e) { console.error(e); }
  }, [sessionId]);

  // 3. LISTEN FOR CLOSURE
  useEffect(() => {
    if (!roomId) return;
    const unsub = onSnapshot(doc(db, 'rooms', roomId), (snap) => {
        if (snap.data()?.status === 'closed') {
            handleEndSession().then(() => router.push('/profile'));
        }
    });
    return () => unsub();
  }, [roomId, handleEndSession, router]);

  if (loading) return <div className="h-screen bg-black text-white flex items-center justify-center font-mono">AUTHENTICATING...</div>;

  return (
    <div className={`h-screen flex flex-col relative overflow-hidden ${role === 'founder' ? 'bg-black' : 'bg-[#050505]'}`}>
      
      {role === 'founder' && <GodModeBackground />}

      <div className={`relative z-10 flex justify-between items-center px-6 py-4 border-b backdrop-blur-md ${role === 'founder' ? 'border-yellow-900/50 bg-black/50' : 'border-[#27272a] bg-[#121212]/80'}`}>
         <div className="font-bold text-white tracking-widest text-sm">SECURE CHANNEL // {roomId.slice(0,6)}</div>
         <button onClick={async () => { await handleEndSession(); router.push('/profile'); }} className="text-xs text-red-500 hover:text-white uppercase font-bold">Disconnect</button>
      </div>

      <div className="flex-1 relative z-10">
        <JitsiMeeting
            domain="meet.jit.si"
            // Change the prefix to something totally unique to bypass the "Locked" name
            roomName={`DM-V1-SECURE-PROBATION-${roomId}-${auth.currentUser?.uid.slice(0,5)}`}
            configOverwrite={{
                startWithAudioMuted: true,
                disableThirdPartyRequests: true,
                prejoinPageEnabled: false,
                // 🛑 FORCE BYPASS THE LOGIN SCREEN
                enableWelcomePage: false,
                enableClosePage: false,
                disableDeepLinking: true,
                // This tells Jitsi to let the first person in be the 'host' automatically
                p2p: { enabled: true }, 
                deploymentInfo: { userRegion: "us-west" }
            }}
            interfaceConfigOverwrite={{
                SHOW_JITSI_WATERMARK: false,
                HIDE_INVITE_MORE_HEADER: true,
                // Force the UI to stay clean
                RECENT_LIST_ENABLED: false,
                VIDEO_LAYOUT_FIT: 'both',
                TOOLBAR_BUTTONS: ['camera', 'chat', 'microphone', 'raisehand', 'tileview', 'hangup']
            }}
            userInfo={{ 
                displayName: auth.currentUser?.displayName || "Agent",
                email: auth.currentUser?.email || "" 
            }}
            onApiReady={(api) => api.addListener('videoConferenceLeft', () => { handleEndSession(); router.push('/profile'); })}
            getIFrameRef={(iframe) => { 
                iframe.style.height = '100%'; 
                iframe.style.border = 'none';
                if (role === 'founder') iframe.style.boxShadow = 'inset 0 0 50px rgba(255, 215, 0, 0.1)';
                if (role === 'moderator') iframe.style.boxShadow = 'inset 0 0 50px rgba(0, 255, 148, 0.1)';
            }}
        />
      </div>

      {(role === 'founder' || role === 'moderator') && (
         <div className="absolute bottom-6 left-6 z-20">
             <button 
                onClick={async () => {
                    if (!confirm("TERMINATE SESSION FOR EVERYONE?")) return;
                    await updateDoc(doc(db, 'rooms', roomId), { status: 'closed' });
                }}
                className={`backdrop-blur border px-4 py-3 rounded-lg font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center gap-2 ${
                    role === 'founder' 
                    ? 'bg-black/80 border-red-900 text-red-600 hover:bg-red-900 hover:text-white' 
                    : 'bg-[#00FF94]/10 border-[#00FF94]/30 text-[#00FF94] hover:bg-[#00FF94] hover:text-black'
                }`}
             >
                {role === 'founder' ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                {role === 'founder' ? "NUKE ROOM" : "SHUTDOWN"}
             </button>
         </div>
      )}
    </div>
  );
}