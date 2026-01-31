"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { 
  doc, getDoc, updateDoc, setDoc, 
  serverTimestamp, increment, onSnapshot 
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { GodModeBackground } from '@/components/GodMode';
import { getRole } from '@/utils/roles';

export default function RoomPage() {
  const [role, setRole] = useState('agent');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id: rawRoomId } = useParams();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const secondsRef = useRef(0);

  // 🛑 THE GHOST BYPASS: Generate a unique ID so Jitsi doesn't ask for a login
  const [jitsiRoomId] = useState(() => 
    `Deskmates-Session-${Math.random().toString(36).substring(2, 10)}-${Date.now().toString(36)}`
  );

  const roomId = Array.isArray(rawRoomId) ? rawRoomId[0] : rawRoomId || "unknown";

  // 1. AUTH & ROLE INIT
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

  // 2. END SESSION & SYNC
  const handleEndSession = useCallback(async () => {
    if (!sessionId || !auth.currentUser) return;
    const points = Math.floor(secondsRef.current / 60);
    try {
        await updateDoc(doc(db, 'sessions', sessionId as string), { 
            status: 'completed', 
            endTime: serverTimestamp(), 
            durationSeconds: secondsRef.current, 
            pointsEarned: points 
        });
        await setDoc(doc(db, 'users', auth.currentUser.uid), { 
            totalPoints: increment(points), 
            totalSeconds: increment(secondsRef.current), 
            sessionsCount: increment(1) 
        }, { merge: true });
    } catch (e) { console.error("Sync Error:", e); }
  }, [sessionId]);

  // 3. THE ENFORCER: Listen for Mod "Nuke"
  useEffect(() => {
    if (!roomId) return;
    const unsub = onSnapshot(doc(db, 'rooms', roomId), (snap) => {
        if (snap.data()?.status === 'closed') {
            handleEndSession().then(() => {
                alert("This protocol has been terminated by High Command.");
                router.push('/profile');
            });
        }
    });
    return () => unsub();
  }, [roomId, handleEndSession, router]);

  if (loading) return (
    <div className="h-screen bg-black text-yellow-500 flex flex-col items-center justify-center font-mono gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        DECRYPTING CHANNEL...
    </div>
  );

  return (
    <div className={`h-screen flex flex-col relative overflow-hidden ${role === 'founder' ? 'bg-black' : 'bg-[#050505]'}`}>
      
      {role === 'founder' && <GodModeBackground />}

      {/* TOP STATUS BAR */}
      <div className={`relative z-10 flex justify-between items-center px-6 py-4 border-b backdrop-blur-md ${role === 'founder' ? 'border-yellow-900/50 bg-black/50' : 'border-[#27272a] bg-[#121212]/80'}`}>
         <div className="flex flex-col">
            <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${role === 'founder' ? 'text-yellow-600' : 'text-[#00FF94]'}`}>
                {role === 'founder' ? 'Founder Priority' : 'Secure Uplink'}
            </span>
            <div className="font-bold text-white text-xs font-mono">{roomId.slice(0,8).toUpperCase()}</div>
         </div>
         <button 
            onClick={async () => { await handleEndSession(); router.push('/profile'); }} 
            className="text-[10px] bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded uppercase font-black tracking-widest hover:bg-red-500 hover:text-white transition-all"
         >
            Disconnect
         </button>
      </div>

      {/* THE VIDEO ENGINE */}
      <div className="flex-1 relative z-10">
        <JitsiMeeting
            domain="meet.jit.si"
            roomName={jitsiRoomId} 
            configOverwrite={{
                startWithAudioMuted: true,
                disableThirdPartyRequests: true,
                prejoinPageEnabled: false,
                enableWelcomePage: false,
                enableClosePage: false,
                disableLobby: true, // 🛑 KILL THE MODERATOR WALL
                deploymentInfo: { userRegion: "us-west" }
            }}
            interfaceConfigOverwrite={{
                SHOW_JITSI_WATERMARK: false,
                HIDE_INVITE_MORE_HEADER: true,
                TOOLBAR_BUTTONS: ['camera', 'chat', 'microphone', 'raisehand', 'tileview', 'hangup']
            }}
            userInfo={{ 
                displayName: auth.currentUser?.displayName || "Agent",
                email: auth.currentUser?.email || "" 
            }}
            onApiReady={(api) => {
                api.addListener('videoConferenceLeft', () => { 
                    handleEndSession(); 
                    router.push('/profile'); 
                });
            }}
            getIFrameRef={(iframe) => { 
                iframe.style.height = '100%'; 
                iframe.style.border = 'none';
                if (role === 'founder') iframe.style.boxShadow = 'inset 0 0 100px rgba(255, 215, 0, 0.15)';
                if (role === 'moderator') iframe.style.boxShadow = 'inset 0 0 100px rgba(0, 255, 148, 0.1)';
            }}
        />
      </div>

      {/* MODERATOR OVERRIDE CONTROLS */}
      {(role === 'founder' || role === 'moderator') && (
         <div className="absolute bottom-10 left-10 z-20">
             <button 
                onClick={async () => {
                    if (!confirm("⚠️ ALERT: Shutdown this session for all participants?")) return;
                    await updateDoc(doc(db, 'rooms', roomId), { status: 'closed' });
                }}
                className={`backdrop-blur border px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.3em] transition-all flex items-center gap-3 shadow-2xl ${
                    role === 'founder' 
                    ? 'bg-black/90 border-red-900 text-red-600 hover:bg-red-600 hover:text-white' 
                    : 'bg-[#00FF94]/10 border-[#00FF94]/40 text-[#00FF94] hover:bg-[#00FF94] hover:text-black'
                }`}
             >
                {role === 'founder' ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                {role === 'founder' ? "EXECUTE NUKE" : "TERMINATE ROOM"}
             </button>
         </div>
      )}
    </div>
  );
}