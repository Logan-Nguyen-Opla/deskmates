"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot } from 'firebase/firestore'; 
import { db, auth } from '@/lib/firebase';
import BottomNav from '@/components/BottomNav';
import { Radio, ShieldCheck, Crown, Clock } from 'lucide-react'; // FIXED: Added Clock
import { GodModeBackground } from '@/components/GodMode';

export default function Lobby() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGodMode, setIsGodMode] = useState(false);

  // UNIFIED PATH
  const ROOMS_PATH = 'rooms';

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
      } else {
        setIsGodMode(user.email?.toLowerCase() === "logan.nguyen.opla@gmail.com");

        // THE FIX: Fetch all active/scheduled rooms.
        const roomsRef = collection(db, ROOMS_PATH);
        const unsubscribeRooms = onSnapshot(roomsRef, (snapshot) => {
          const liveRooms = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as any))
            .filter((room) => room.status !== 'closed'); // Ignores terminated rooms
          
          setRooms(liveRooms);
          setLoading(false);
        });
        return () => unsubscribeRooms();
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center font-mono text-yellow-500"><div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" /></div>;

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
      </header>

      <div className="p-4 space-y-4 relative z-10 max-w-2xl mx-auto mt-4">
        {rooms.length === 0 && (
          <div className={`text-center py-20 font-black text-2xl opacity-20 ${isGodMode ? 'text-yellow-900' : 'text-[#27272a]'}`}>
            NO ACTIVE SIGNALS
          </div>
        )}

        {rooms.map((room) => (
          <div key={room.id} onClick={() => router.push(`/room/${room.id}/briefing`)} className={`group cursor-pointer border rounded-3xl p-6 transition-all hover:-translate-y-1 relative overflow-hidden ${isGodMode ? 'bg-[#080808]/50 border-yellow-500/30 hover:border-yellow-400' : 'bg-[#121212] border-[#27272a] hover:border-[#00FF94]'}`}>
            <div className={`absolute inset-0 bg-gradient-to-r translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ${isGodMode ? 'from-yellow-500/0 via-yellow-500/10 to-yellow-500/0' : 'from-[#00FF94]/0 via-[#00FF94]/5 to-[#00FF94]/0'}`} />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <h3 className={`font-black text-xl italic uppercase transition-colors ${isGodMode ? 'group-hover:text-yellow-400' : 'group-hover:text-[#00FF94]'}`}>{room.title}</h3>
              <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${isGodMode ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-[#00FF94]/10 text-[#00FF94] border-[#00FF94]/20'}`}>
                {room.subject || "GENERAL"}
              </span>
            </div>
            <div className={`flex items-center justify-between text-[10px] font-black uppercase tracking-widest relative z-10 ${isGodMode ? 'text-yellow-900' : 'text-[#A1A1AA]'}`}>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span>{room.startTime?.toDate ? room.startTime.toDate().toLocaleString('vi-VN', { timeStyle: 'short', dateStyle: 'short' }) : 'ASAP'}</span>
              </div>
              <span className="flex items-center gap-1">MOD: {room.moderator?.split(' ')[0] || 'ADMIN'}</span>
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}