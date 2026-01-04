"use client";

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; 
import { useRouter } from 'next/navigation';
import { Settings, Clock, Zap, LogOut, ShieldCheck, Crown } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { GodModeBackground } from '@/components/GodMode'; // Import Background

const FOUNDER_EMAIL = "logan.nguyen.opla@gmail.com";
const FOUNDER_NAME = "Logan Ng";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>({ totalPoints: 0, totalSeconds: 0 }); 
  const [isGodMode, setIsGodMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
        
        // --- GOD MODE CHECK ---
        const isFounder = 
            currentUser.email?.toLowerCase() === FOUNDER_EMAIL || 
            currentUser.displayName === FOUNDER_NAME;
        setIsGodMode(isFounder);

        const userRef = doc(db, 'users', currentUser.uid);
        const unsubscribeFirestore = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setStats(docSnap.data());
          }
        });
        return () => unsubscribeFirestore();
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) { console.error(error); }
  };

  const formatHours = (seconds: number) => (seconds / 3600).toFixed(1) + 'h';

  return (
    <div className={`min-h-screen p-6 pb-24 relative overflow-hidden font-mono ${isGodMode ? 'bg-black text-white selection:bg-yellow-500 selection:text-black' : 'bg-[#050505] text-white'}`}>
      
      {/* GOD MODE BACKGROUND */}
      {isGodMode && <GodModeBackground />}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 relative z-10">
        <h2 className={`text-sm font-black uppercase tracking-[0.2em] ${isGodMode ? 'text-yellow-600' : 'text-[#A1A1AA]'}`}>
            {isGodMode ? "FOUNDER CLEARANCE" : "INTELLIGENCE PROFILE"}
        </h2>
        <Settings className={`${isGodMode ? 'text-yellow-500' : 'text-[#52525B]'} w-5 h-5 cursor-pointer`} />
      </div>

      {/* IDENTITY CARD */}
      <div className="text-center mb-10 relative z-10 group">
        <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center text-3xl font-black mb-4 overflow-hidden border-4 ${isGodMode ? 'border-yellow-500 shadow-[0_0_30px_rgba(255,215,0,0.4)]' : 'bg-gradient-to-br from-[#7000FF] to-[#00FF94] border-transparent'}`}>
          {user?.photoURL ? (
             <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
             user?.uid?.slice(0, 2).toUpperCase() || "??"
          )}
        </div>
        
        <div className="flex items-center justify-center gap-2">
            {isGodMode && <Crown className="w-5 h-5 text-yellow-500 animate-bounce" />}
            <h3 className={`text-xl font-bold ${isGodMode ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]' : 'text-white'}`}>
                {user?.displayName || "Deskmate Agent"}
            </h3>
        </div>
        
        <p className={`text-xs font-mono mt-1 ${isGodMode ? 'text-yellow-700' : 'text-[#52525B]'}`}>
          {isGodMode ? "STATUS: OMNIPOTENT" : "STATUS: ONLINE"}
        </p>
      </div>

      {/* STATS GRID (INFINITE FOR GOD MODE) */}
      <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
        {/* TIME */}
        <div className={`border p-4 rounded-2xl ${isGodMode ? 'bg-[#080808]/50 border-yellow-500/30' : 'bg-[#121212] border-[#27272a]'}`}>
          <Clock className={`${isGodMode ? 'text-yellow-400' : 'text-[#00FF94]'} w-5 h-5 mb-2`} />
          <div className="text-2xl font-black">
              {isGodMode ? "∞" : formatHours(stats.totalSeconds || 0)}
          </div>
          <div className={`text-[10px] uppercase font-bold ${isGodMode ? 'text-yellow-700' : 'text-[#A1A1AA]'}`}>Total Focus</div>
        </div>
        
        {/* POINTS */}
        <div className={`border p-4 rounded-2xl ${isGodMode ? 'bg-[#080808]/50 border-yellow-500/30' : 'bg-[#121212] border-[#27272a]'}`}>
          <Zap className={`${isGodMode ? 'text-orange-500' : 'text-[#FF5C00]'} w-5 h-5 mb-2`} />
          <div className="text-2xl font-black">
              {isGodMode ? "∞" : (stats.totalPoints || 0)}
          </div>
          <div className={`text-[10px] uppercase font-bold ${isGodMode ? 'text-yellow-700' : 'text-[#A1A1AA]'}`}>Points</div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="space-y-4 relative z-10">
        
        {isGodMode && (
            <button 
                onClick={() => router.push('/admin')}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 group"
            >
                <ShieldCheck className="w-4 h-4 group-hover:rotate-12 transition-transform" /> 
                Enter Command Deck
            </button>
        )}

        <button 
            onClick={handleLogout}
            className={`w-full border py-4 rounded-xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-colors ${
                isGodMode 
                ? 'bg-[#080808]/50 border-red-900/30 text-red-500 hover:bg-red-900/10' 
                : 'bg-[#1A1A1A] border-red-900/30 text-red-500 hover:bg-red-900/10'
            }`}
        >
            <LogOut className="w-4 h-4" />
            Disconnect
        </button>
      </div>

      <BottomNav />
    </div>
  );
}