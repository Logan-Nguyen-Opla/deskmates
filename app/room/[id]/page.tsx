"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { 
  doc, getDoc, updateDoc, setDoc, 
  serverTimestamp, increment, onSnapshot 
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { CheckCircle2, ShieldAlert, Crown, Flame } from 'lucide-react';
import { GodModeBackground } from '@/components/GodMode';

const FOUNDER_EMAIL = "logan.nguyen.opla@gmail.com";
const FOUNDER_NAME = "Logan Ng";

export default function RoomPage() {
  const [seconds, setSeconds] = useState(0);
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGodMode, setIsGodMode] = useState(false);
  
  const secondsRef = useRef(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id: roomId } = useParams(); 
  const sessionId = searchParams.get('sessionId');

  // 1. INIT & AUTH CHECK
  useEffect(() => {
    if (!sessionId || !roomId) return;

    const user = auth.currentUser;
    if (user) {
        const isFounder = user.email?.toLowerCase() === FOUNDER_EMAIL || user.displayName === FOUNDER_NAME;
        setIsGodMode(isFounder);
    }

    const initPage = async () => {
      try {
        // Fetch Session Start Time
        const sessionRef = doc(db, 'sessions', sessionId as string);
        const sessionSnap = await getDoc(sessionRef);

        if (sessionSnap.exists()) {
          const data = sessionSnap.data();
          if (data.status === 'completed') {
             router.push('/'); 
             return;
          }
          if (data.startTime) {
            const start = data.startTime.toDate();
            const now = new Date();
            const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
            setSeconds(diff);
            secondsRef.current = diff;
          }
        }

        // Fetch Room Title
        const roomRef = doc(db, 'rooms', roomId as string);
        const roomSnap = await getDoc(roomRef);
        if (roomSnap.exists()) {
          setRoomData(roomSnap.data());
        }
        setLoading(false);
      } catch (error) { console.error(error); }
    };

    initPage();

    // Timer Interval
    const interval = setInterval(() => {
      setSeconds(s => {
        const newVal = s + 1;
        secondsRef.current = newVal;
        return newVal;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionId, roomId, router]);

  // 2. END SESSION LOGIC (Syncs Points)
  const handleEndSession = useCallback(async () => {
    if (!sessionId || !auth.currentUser) return;
    const currentSeconds = secondsRef.current;
    
    // Calculate Points (1 min = 1 point)
    const points = Math.floor(currentSeconds / 60); 

    try {
      const sessionRef = doc(db, 'sessions', sessionId as string);
      await updateDoc(sessionRef, {
        endTime: serverTimestamp(),
        status: 'completed',
        durationSeconds: currentSeconds,
        pointsEarned: points
      });

      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        displayName: auth.currentUser.displayName || "Unknown Deskmate",
        photoURL: auth.currentUser.photoURL,
        lastActive: serverTimestamp(),
        totalPoints: increment(points),
        totalSeconds: increment(currentSeconds),
        sessionsCount: increment(1)
      }, { merge: true });
    } catch (error) { console.error("Error syncing:", error); }
  }, [sessionId]);

  // 3. LISTEN FOR ROOM CLOSURE (Nuke Protocol)
  useEffect(() => {
    if (!roomId) return;
    const roomRef = doc(db, 'rooms', roomId as string);
    const unsubscribe = onSnapshot(roomRef, (snap) => {
      const data = snap.data();
      if (data && data.status === 'closed') {
        handleEndSession().then(() => {
            alert("Session Ended by Moderator.");
            router.push('/profile');
        });
      }
    });
    return () => unsubscribe();
  }, [roomId, handleEndSession, router]);

  // 4. JITSI EVENT HANDLERS
  const handleJitsiReady = (api: any) => {
      // When the user hangs up INSIDE the Jitsi window
      api.addListener('videoConferenceLeft', () => {
          handleEndSession();
          router.push('/profile');
      });
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const rs = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(rs).padStart(2, '0')}`;
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-yellow-500 animate-pulse font-mono">ESTABLISHING UPLINK...</div>;

  return (
    <div className={`h-screen flex flex-col relative overflow-hidden ${isGodMode ? 'bg-black' : 'bg-[#050505]'}`}>
      
      {/* GOD MODE VISUALS */}
      {isGodMode && <GodModeBackground />}

      {/* HEADER BAR */}
      <div className={`relative z-10 flex justify-between items-center px-6 py-4 border-b backdrop-blur-md ${isGodMode ? 'border-yellow-900/50 bg-black/50' : 'border-[#27272a] bg-[#121212]/80'}`}>
         <div>
            <h2 className={`font-bold text-lg ${isGodMode ? 'text-yellow-500' : 'text-white'}`}>
                {roomData?.title || "Secure Channel"}
            </h2>
            <div className="flex items-center gap-2 text-xs text-[#A1A1AA] font-mono">
               <div className={`w-2 h-2 rounded-full animate-pulse ${isGodMode ? 'bg-yellow-500' : 'bg-[#00FF94]'}`} />
               RECORDING TIME: {formatTime(seconds)}
            </div>
         </div>

         {/* Emergency Exit Button */}
         <button 
            onClick={async () => {
                await handleEndSession();
                router.push('/profile');
            }}
            className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
         >
            Disconnect
         </button>
      </div>

      {/* VIDEO CONTAINER */}
      <div className="flex-1 relative z-10">
        <JitsiMeeting
            domain="meet.jit.si"
            roomName={`Deskmates-${roomId}`}
            configOverwrite={{
                startWithAudioMuted: true,
                disableThirdPartyRequests: true,
                prejoinPageEnabled: false, // Skip the "Ready to join?" screen for speed
                toolbarButtons: [
                   'camera', 'chat', 'desktop', 'microphone', 'raisehand', 
                   'tileview', 'fullscreen', 'hangup' // Simplified Toolbar
                ]
            }}
            interfaceConfigOverwrite={{
                // Hide Jitsi watermark to look cleaner
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                DEFAULT_BACKGROUND: isGodMode ? '#000000' : '#121212',
            }}
            userInfo={{
                displayName: auth.currentUser?.displayName || "Deskmate Agent",
                email: auth.currentUser?.email || ""
            }}
            onApiReady={(externalApi) => handleJitsiReady(externalApi)}
            getIFrameRef={(iframeRef) => { 
                iframeRef.style.height = '100%'; 
                iframeRef.style.border = 'none';
                if(isGodMode) {
                    iframeRef.style.boxShadow = 'inset 0 0 50px rgba(255, 215, 0, 0.1)';
                }
            }}
        />
      </div>

      {/* GOD MODE NUKE BUTTON (Floating) */}
      {isGodMode && (
         <div className="absolute bottom-6 left-6 z-20">
             <button 
                onClick={async () => {
                    if (!confirm("⚠️ NUKE PROTOCOL: Kick everyone?")) return;
                    await updateDoc(doc(db, 'rooms', roomId as string), { status: 'closed' });
                }}
                className="bg-black/80 backdrop-blur border border-red-900 text-red-600 px-4 py-3 rounded-lg font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-900 hover:text-white transition-all flex items-center gap-2"
             >
                <ShieldAlert className="w-4 h-4" />
                NUKE ROOM
             </button>
         </div>
      )}

    </div>
  );
}