"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot } from 'firebase/firestore'; 
import { db, auth } from '@/lib/firebase';
import BottomNav from '@/components/BottomNav';
import { Radio } from 'lucide-react';
import { GodModeBackground } from '@/components/GodMode';

export default function Lobby() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGodMode, setIsGodMode] = useState(false);

  // Correct path from your documentation [cite: 5]
  const ROOMS_PATH = 'artifacts/deskmates-online/public/data/rooms';

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
      } else {
        setIsGodMode(user.email?.toLowerCase() === "logan.nguyen.opla@gmail.com");
        const roomsRef = collection(db, ROOMS_PATH);
        const unsubscribeRooms = onSnapshot(roomsRef, (snapshot) => {
          // Type assertion fixes the 'status' property error
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

  const handleJoinRoom = (roomId: string) => {
    router.push(`/room/${roomId}`);
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center font-mono">SYNCING...</div>;

  return (
    <div className={`min-h-screen pb-24 relative overflow-hidden ${isGodMode ? 'bg-black' : 'bg-[#050505]'}`}>
      {isGodMode && <GodModeBackground />}
      <header className="p-6 border-b flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-10">
          <h1 className="text-2xl font-black italic text-yellow-500">DESKMATES</h1>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/20"><Radio className="w-3 h-3 text-yellow-500 animate-pulse" /><span className="text-[10px] text-yellow-500 font-bold uppercase">Ready</span></div>
      </header>
      <div className="p-4 space-y-4 relative z-10">
        {rooms.map((room) => (
          <div key={room.id} onClick={() => handleJoinRoom(room.id)} className="cursor-pointer border border-[#27272a] rounded-2xl p-5 bg-[#121212] hover:border-yellow-500 transition-all">
            <h3 className="font-bold text-lg">{room.title}</h3>
            <div className="flex items-center justify-between text-xs text-[#A1A1AA] mt-3">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500" /><span>{room.participants || 0} online</span></div>
              <span className="font-mono opacity-50">MOD: {room.moderator?.split(' ')[0]}</span>
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}