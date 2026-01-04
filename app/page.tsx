"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  collection, onSnapshot, addDoc, serverTimestamp, query, where, getDocs, getDoc, doc 
} from 'firebase/firestore'; 
import { db, auth } from '@/lib/firebase';
import BottomNav from '@/components/BottomNav';
import { Radio, Crown, ShieldCheck } from 'lucide-react';
import { GodModeBackground } from '@/components/GodMode';

const FOUNDER_EMAIL = "logan.nguyen.opla@gmail.com";
const FOUNDER_NAME = "Logan Ng";

export default function Lobby() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGodMode, setIsGodMode] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
      } else {
        const isFounder = user.email?.toLowerCase() === FOUNDER_EMAIL || user.displayName === FOUNDER_NAME;
        setIsGodMode(isFounder);

        const roomsRef = collection(db, 'rooms');
        const unsubscribeRooms = onSnapshot(roomsRef, (snapshot) => {
          // --- FIX: FILTER OUT CLOSED ROOMS ---
          const liveRooms = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter((room: any) => room.status !== 'closed'); // <--- CRITICAL FIX
          
          setRooms(liveRooms);
          setLoading(false);
        });
        return () => unsubscribeRooms();
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  const handleJoinRoom = async (roomId: string) => {
    if (!auth.currentUser) return router.push('/login');
    try {
      // --- FIX: CHECK IF ROOM IS ACTUALLY OPEN FIRST ---
      const roomRef = doc(db, 'rooms', roomId);
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists() || roomSnap.data().status === 'closed') {
        alert("This room has ended.");
        return;
      }

      // Check for existing session
      const q = query(collection(db, 'sessions'), where("userId", "==", auth.currentUser.uid), where("roomId", "==", roomId), where("status", "==", "active"));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        router.push(`/room/${roomId}?sessionId=${snapshot.docs[0].id}`);
      } else {
        const sessionRef = await addDoc(collection(db, 'sessions'), {
          userId: auth.currentUser.uid, roomId: roomId, startTime: serverTimestamp(), status: 'active', pointsEarned: 0
        });
        router.push(`/room/${roomId}?sessionId=${sessionRef.id}`);
      }
    } catch (error) { alert("Connection Error."); }
  };

  if (loading) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
      <div className={`w-12 h-12 border-4 ${isGodMode ? 'border-yellow-500' : 'border-[#00FF94]'} border-t-transparent rounded-full animate-spin`} />
    </div>
  );

  return (
    <div className={`min-h-screen font-sans pb-24 relative overflow-hidden transition-colors duration-1000 ${isGodMode ? 'bg-black text-white selection:bg-yellow-500 selection:text-black' : 'bg-[#050505] text-white'}`}>
      
      {isGodMode && <GodModeBackground />}

      <header className={`p-6 border-b relative z-10 backdrop-blur-md sticky top-0 flex justify-between items-center ${isGodMode ? 'bg-black/50 border-yellow-500/30' : 'bg-[#121212]/50 border-[#27272a]'}`}>
        <div>
          <div className="flex items-center gap-2">
             {isGodMode && <ShieldCheck className="w-5 h-5 text-yellow-500 animate-pulse" />}
             <h1 className={`text-2xl font-black italic tracking-tighter ${isGodMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500' : 'text-[#00FF94]'}`}>
                {isGodMode ? "GOD MODE" : "DESKMATES"}
             </h1>
          </div>
          <p className={`text-xs uppercase tracking-widest mt-1 ${isGodMode ? 'text-yellow-700 font-bold' : 'text-[#A1A1AA]'}`}>
            {isGodMode ? "Founder Clearance: Omega" : "Study Together"}
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${isGodMode ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-[#00FF94]/10 border-[#00FF94]/20'}`}>
            <Radio className={`w-3 h-3 animate-pulse ${isGodMode ? 'text-yellow-500' : 'text-[#00FF94]'}`} />
            <span className={`text-[10px] font-bold ${isGodMode ? 'text-yellow-500' : 'text-[#00FF94]'}`}>
                {rooms.reduce((acc, r) => acc + (r.participants || 0), 0)} Online
            </span>
        </div>
      </header>

      <div className="p-4 space-y-4 relative z-10">
        {rooms.length === 0 && (
          <div className={`text-center py-20 font-black text-2xl opacity-20 ${isGodMode ? 'text-yellow-900' : 'text-[#27272a]'}`}>
            NO ACTIVE SIGNALS
          </div>
        )}

        {rooms.map((room) => (
          <div key={room.id} onClick={() => handleJoinRoom(room.id)} className={`group cursor-pointer border rounded-2xl p-5 transition-all hover:-translate-y-1 relative overflow-hidden ${isGodMode ? 'bg-[#080808]/50 border-yellow-500/30 hover:border-yellow-400' : 'bg-[#121212] border-[#27272a] hover:border-[#00FF94]'}`}>
            <div className={`absolute inset-0 bg-gradient-to-r translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ${isGodMode ? 'from-yellow-500/0 via-yellow-500/10 to-yellow-500/0' : 'from-[#00FF94]/0 via-[#00FF94]/5 to-[#00FF94]/0'}`} />
            <div className="flex justify-between items-start mb-3 relative z-10">
              <h3 className={`font-bold text-lg transition-colors ${isGodMode ? 'group-hover:text-yellow-400' : 'group-hover:text-[#00FF94]'}`}>{room.title}</h3>
              {room.isHot && <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase border ${isGodMode ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20' : 'bg-[#FF5C00]/20 text-[#FF5C00] border-[#FF5C00]/20'}`}>HOT</span>}
            </div>
            <div className={`flex items-center justify-between text-xs relative z-10 ${isGodMode ? 'text-yellow-900/80' : 'text-[#A1A1AA]'}`}>
              <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full animate-pulse ${isGodMode ? 'bg-yellow-500' : 'bg-[#00FF94]'}`} /><span>{room.participants || 0} online</span></div>
              <span className="font-mono text-[10px] opacity-70 flex items-center gap-1">{room.moderator?.includes('★') && <Crown className="w-3 h-3 text-yellow-500" />} MOD: {room.moderator?.split(' ')[0]}</span>
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}