"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot } from 'firebase/firestore'; 
import { db, auth } from '@/lib/firebase';
import BottomNav from '@/components/BottomNav';
import { Radio, Users } from 'lucide-react';
import { GodModeBackground } from '@/components/GodMode';

export default function Lobby() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGodMode, setIsGodMode] = useState(false);

  // Updated path for your new project ID
  const ROOMS_PATH = 'artifacts/deskmates-online/public/data/rooms';

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
      } else {
        setIsGodMode(user.email?.toLowerCase() === "logan.nguyen.opla@gmail.com");

        const roomsRef = collection(db, ROOMS_PATH);
        const unsubscribeRooms = onSnapshot(roomsRef, (snapshot) => {
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

  if (loading) return <div className="h-screen bg-black flex items-center justify-center font-mono text-yellow-500">SYNCHRONIZING LOBBY...</div>;

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden bg-black text-white">
      {isGodMode && <GodModeBackground />}
      
      <header className="p-6 border-b border-white/5 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50">
          <h1 className="text-2xl font-black italic text-yellow-500 tracking-tighter">DESKMATES</h1>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/20 bg-yellow-500/5">
            <Radio className="w-3 h-3 text-yellow-500 animate-pulse" />
            <span className="text-[10px] text-yellow-500 font-black uppercase tracking-widest">Live Lobby</span>
          </div>
      </header>

      <div className="p-4 space-y-4 relative z-10 max-w-2xl mx-auto">
        {rooms.length === 0 ? (
          <div className="py-20 text-center border border-white/5 rounded-3xl opacity-30">
            <p className="text-[10px] uppercase font-black tracking-widest">No Active Sessions Found</p>
          </div>
        ) : (
          rooms.map((room) => (
            <div 
              key={room.id} 
              onClick={() => router.push(`/room/${room.id}`)} 
              className="group cursor-pointer border border-white/5 rounded-[2rem] p-6 bg-[#0a0a0a] hover:border-yellow-500/50 transition-all hover:bg-[#111]"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-black text-lg italic uppercase tracking-tight text-white group-hover:text-yellow-500 transition-colors">{room.title}</h3>
                <div className="p-2 bg-yellow-500/10 rounded-full group-hover:bg-yellow-500 group-hover:text-black transition-all">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                  <span className="text-gray-400">{room.participants || 0} Online</span>
                </div>
                <span className="text-gray-600">MOD: {room.moderator?.split(' ')[0] || 'System'}</span>
              </div>
            </div>
          ))
        )}
      </div>
      <BottomNav />
    </div>
  );
}