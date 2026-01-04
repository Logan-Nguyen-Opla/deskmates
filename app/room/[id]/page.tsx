"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc, 
  serverTimestamp, 
  increment,
  onSnapshot 
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Video, Flame, CheckCircle2, ShieldAlert, Crown } from 'lucide-react';
import { GodModeBackground } from '@/components/GodMode'; // Import the Visuals

const FOUNDER_EMAIL = "logan.nguyen.opla@gmail.com";
const FOUNDER_NAME = "Logan Ng";

export default function RoomPage() {
  const [seconds, setSeconds] = useState(0);
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGodMode, setIsGodMode] = useState(false); // God Mode State
  
  const secondsRef = useRef(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id: roomId } = useParams(); 
  const sessionId = searchParams.get('sessionId');

  // 1. INIT
  useEffect(() => {
    if (!sessionId || !roomId) return;

    // A. Check God Mode
    const user = auth.currentUser;
    if (user) {
        const isFounder = user.email?.toLowerCase() === FOUNDER_EMAIL || user.displayName === FOUNDER_NAME;
        setIsGodMode(isFounder);
    }

    const initPage = async () => {
      try {
        const sessionRef = doc(db, 'sessions', sessionId);
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

        const roomRef = doc(db, 'rooms', roomId as string);
        const roomSnap = await getDoc(roomRef);
        if (roomSnap.exists()) {
          setRoomData(roomSnap.data());
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    initPage();
    const interval = setInterval(() => {
      setSeconds(s => {
        const newVal = s + 1;
        secondsRef.current = newVal;
        return newVal;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionId, roomId, router]);

  // 2. END SESSION (Standard)
  const handleEndSession = useCallback(async () => {
    if (!sessionId || !auth.currentUser) return;
    const currentSeconds = secondsRef.current;
    
    // Check if already closed
    const sessionRef = doc(db, 'sessions', sessionId);
    const freshSnap = await getDoc(sessionRef);
    if (freshSnap.exists() && freshSnap.data().status === 'completed') {
      router.push('/profile');
      return;
    }
    
    const points = Math.floor(currentSeconds / 60); 

    try {
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
    } catch (error) {
      console.error("Error syncing:", error);
    }
  }, [sessionId, router]);

  // 3. NUKE ROOM (God Mode Only)
  const handleNukeRoom = async () => {
    if (!confirm("⚠️ FOUNDER COMMAND ⚠️\n\nClose this room and kick EVERYONE out?")) return;
    try {
        await updateDoc(doc(db, 'rooms', roomId as string), { status: 'closed' });
        alert("PROTOCOL TERMINATED.");
    } catch (e) {
        alert("Command Failed.");
    }
  };

  // 4. LISTEN FOR NUKE
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


  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const rs = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(rs).padStart(2, '0')}`;
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-yellow-500 animate-pulse font-mono">SYNCING...</div>;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-1000 ${isGodMode ? 'bg-black text-white font-serif' : 'bg-gradient-to-br from-[#050505] via-[#0A1828] to-[#050505] font-sans'}`}>
      
      {/* RENDER GOD MODE BACKGROUND IF FOUNDER */}
      {isGodMode && <GodModeBackground />}

      <div className="relative z-10 text-center space-y-8">
        
        {/* Status Badge */}
        <div className={`text-xs uppercase tracking-[0.3em] font-black px-4 py-2 rounded-full inline-block ${isGodMode ? 'border border-yellow-500 text-yellow-500 animate-pulse' : 'border border-[#00FF94]/30 text-[#00FF94]'}`}>
          {isGodMode ? "RECORDING: OMEGA LEVEL" : "Recording Session"}
        </div>
        
        {/* Timer */}
        <div className={`text-7xl font-mono tracking-tighter tabular-nums ${isGodMode ? 'text-yellow-400 drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]' : 'text-white drop-shadow-[0_0_15px_rgba(0,255,148,0.3)]'}`}>
          {formatTime(seconds)}
        </div>

        <h2 className={`text-xl font-bold ${isGodMode ? 'text-yellow-100' : 'text-white'}`}>{roomData?.title || "Study Room"}</h2>

        <div className="space-y-4 pt-4 w-full max-w-md mx-auto">
          <button 
            onClick={() => window.open(roomData?.meetLink || 'https://meet.google.com/new', '_blank')}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase shadow-xl hover:scale-105 transition-transform ${isGodMode ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 text-black shadow-yellow-500/20' : 'bg-gradient-to-r from-[#00FF94] to-[#00D4FF] text-black shadow-[#00FF94]/10'}`}
          >
            <Video className="w-5 h-5" /> Open Google Meet
          </button>
          
          <button 
            onClick={async () => {
                await handleEndSession();
                router.push('/profile');
            }}
            className="w-full bg-[#1A1A1A] border border-[#27272a] text-[#A1A1AA] py-4 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-[#27272a] hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            End & Sync Points
          </button>

          {/* --- GOD MODE NUKE BUTTON --- */}
          {isGodMode && (
             <button 
                onClick={handleNukeRoom}
                className="w-full mt-4 bg-[#1a0000] border border-red-900 text-red-500 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-red-950 transition-colors flex items-center justify-center gap-2 animate-pulse"
             >
                <ShieldAlert className="w-4 h-4" />
                TERMINATE PROTOCOL
             </button>
          )}

        </div>
      </div>
      
      {/* Visual Badge */}
      <div className="fixed bottom-12 flex gap-4 relative z-10">
        <div className={`p-4 border rounded-2xl flex items-center gap-3 ${isGodMode ? 'bg-black border-yellow-900/50 text-yellow-500' : 'bg-[#121212] border-[#27272a] text-white'}`}>
           {isGodMode ? <Crown className="text-yellow-500 w-5 h-5" /> : <Flame className="text-[#FF5C00] w-5 h-5" />}
           <span className="text-xs font-bold uppercase">{isGodMode ? "Founder Active" : "Focus Mode On"}</span>
        </div>
      </div>
    </div>
  );
}