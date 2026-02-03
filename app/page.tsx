"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore'; 
import { db, auth } from '@/lib/firebase';
import BottomNav from '@/components/BottomNav';
import { Radio, ShieldCheck } from 'lucide-react';
import { GodModeBackground } from '@/components/GodMode';

export default function Lobby() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGodMode, setIsGodMode] = useState(false);

  // Path from your schema [cite: 2]
  const ROOMS_PATH = 'artifacts/deskmates-online/public/data/rooms';

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
      } else {
        setIsGodMode(user.email?.toLowerCase() === "logan.nguyen.opla@gmail.com");

        const roomsRef = collection(db, ROOMS_PATH);
        const unsubscribeRooms = onSnapshot(roomsRef, (snapshot) => {
          // --- FIX: Type assertion solves the 'status' property error ---
          const liveRooms = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as any))
            .filter((room) => room.status === 'live');
          
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
    // Direct navigation to the room page
    router.push(`/room/${roomId}`);
  };

  if (loading) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center">
      <div className={`w-12 h-12 border-4 ${isGodMode ? 'border-yellow-500' : 'border-[#00FF94]'} border-t-transparent rounded-full animate-spin`} />
    </div>
  );

  return (
    <div className={`min-h-screen pb-24 relative overflow-hidden ${isGodMode ? 'bg-black text-white' : 'bg-[#050505] text-white'}`}>
      {isGodMode && <GodModeBackground />}
      <header className={`p-6 border-b relative z-10 backdrop-blur-md sticky top-0 flex justify-between items-center ${isGodMode ? 'bg-black/50 border-yellow-500/30' : 'bg-[#121212]/50 border-[#27272a]'}`}>
        <h1 className={`text-2xl font-black italic tracking-tighter ${isGodMode ? 'text-yellow-500' : 'text-[#00FF94]'}`}>
            {isGodMode ? "GOD MODE" : "DESKMATES"}
        </h1>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${isGodMode ? 'border-yellow-500/30' : 'border-[#00FF94]/20'}`}>
            <Radio className={`w-3 h-3 animate-pulse ${isGodMode ? 'text-yellow-500' : 'text-[#00FF94]'}`} />
            <span className="text-[10px] font-bold">LIVE</span>
        </div>
      </header>

      <div className="p-4 space-y-4 relative z-10">
        {rooms.map((room) => (
          <div key={room.id} onClick={() => handleJoinRoom(room.id)} className="cursor-pointer border border-[#27272a] rounded-2xl p-5 bg-[#121212] hover:border-[#00FF94] transition-all">
            <h3 className="font-bold text-lg">{room.title}</h3>
            <div className="flex items-center justify-between text-xs text-[#A1A1AA] mt-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00FF94]" />
                <span>{room.participants || 0} online</span>
              </div>
              <span className="font-mono">MOD: {room.moderator?.split(' ')[0]}</span>
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}