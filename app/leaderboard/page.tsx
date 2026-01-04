"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'; 
import { db, auth } from '@/lib/firebase';
import BottomNav from '@/components/BottomNav';
import { Trophy, Medal, Crown } from 'lucide-react';
import { GodModeBackground } from '@/components/GodMode';

const FOUNDER_EMAIL = "logan.nguyen.opla@gmail.com";
const FOUNDER_NAME = "Logan Ng";

export default function Leaderboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [isGodMode, setIsGodMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check Auth for Theme
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const isFounder = user.email?.toLowerCase() === FOUNDER_EMAIL || user.displayName === FOUNDER_NAME;
        setIsGodMode(isFounder);
      }
    });

    // 2. Fetch Leaderboard Data
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy("totalPoints", "desc"), limit(50));

    const unsubscribeData = onSnapshot(q, (snapshot) => {
      const leaderboardData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(leaderboardData);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeData();
    };
  }, []);

  if (loading) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center">
       <div className={`w-12 h-12 border-4 ${isGodMode ? 'border-yellow-500' : 'border-[#00FF94]'} border-t-transparent rounded-full animate-spin`} />
    </div>
  );

  return (
    <div className={`min-h-screen font-sans pb-24 relative overflow-hidden ${isGodMode ? 'bg-black text-white selection:bg-yellow-500 selection:text-black' : 'bg-[#050505] text-white'}`}>
      
      {isGodMode && <GodModeBackground />}

      <header className={`p-6 border-b relative z-10 backdrop-blur-md sticky top-0 ${isGodMode ? 'bg-black/50 border-yellow-500/30' : 'bg-[#121212]/50 border-[#27272a]'}`}>
        <h1 className={`text-2xl font-black italic tracking-tighter ${isGodMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500' : 'text-[#00FF94]'}`}>
          RANKINGS
        </h1>
        <p className={`text-xs uppercase tracking-widest mt-1 ${isGodMode ? 'text-yellow-700 font-bold' : 'text-[#A1A1AA]'}`}>
          Top Focus Agents
        </p>
      </header>

      <div className="p-4 space-y-4 relative z-10">
        
        {/* PODIUM (Top 3) */}
        {users.length > 0 && (
          <div className="flex justify-center items-end gap-2 mb-8 mt-4">
            
            {/* 2nd Place */}
            {users[1] && (
              <div className="flex flex-col items-center w-1/3">
                 <div className="w-16 h-16 rounded-full border-2 border-gray-400 overflow-hidden mb-2 bg-[#121212]">
                    {users[1].photoURL ? <img src={users[1].photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500">?</div>}
                 </div>
                 <div className="h-24 w-full bg-gradient-to-t from-gray-800 to-gray-600 rounded-t-lg flex items-end justify-center pb-2 relative">
                    <span className="text-2xl font-black text-white/50 absolute top-2">2</span>
                    <span className="text-[10px] font-bold uppercase truncate px-1">{users[1].displayName?.split(' ')[0]}</span>
                 </div>
              </div>
            )}

            {/* 1st Place */}
            {users[0] && (
              <div className="flex flex-col items-center w-1/3 relative -top-4">
                 <Crown className="w-6 h-6 text-yellow-400 animate-bounce mb-1" />
                 <div className="w-20 h-20 rounded-full border-2 border-yellow-400 overflow-hidden mb-2 bg-[#121212] shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                    {users[0].photoURL ? <img src={users[0].photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-yellow-500">?</div>}
                 </div>
                 <div className="h-32 w-full bg-gradient-to-t from-yellow-700 to-yellow-500 rounded-t-lg flex items-end justify-center pb-2 relative shadow-[0_0_30px_rgba(255,215,0,0.2)]">
                    <span className="text-4xl font-black text-white/50 absolute top-2">1</span>
                    <span className="text-xs font-black uppercase truncate px-1 text-black">{users[0].displayName?.split(' ')[0]}</span>
                 </div>
              </div>
            )}

            {/* 3rd Place */}
            {users[2] && (
              <div className="flex flex-col items-center w-1/3">
                 <div className="w-16 h-16 rounded-full border-2 border-orange-700 overflow-hidden mb-2 bg-[#121212]">
                    {users[2].photoURL ? <img src={users[2].photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-orange-700">?</div>}
                 </div>
                 <div className="h-20 w-full bg-gradient-to-t from-orange-900 to-orange-700 rounded-t-lg flex items-end justify-center pb-2 relative">
                    <span className="text-2xl font-black text-white/50 absolute top-2">3</span>
                    <span className="text-[10px] font-bold uppercase truncate px-1">{users[2].displayName?.split(' ')[0]}</span>
                 </div>
              </div>
            )}
          </div>
        )}

        {/* LIST (4th - 50th) */}
        <div className="space-y-2">
          {users.slice(3).map((user, index) => (
            <div key={user.id} className={`flex items-center gap-4 p-4 rounded-xl border ${isGodMode ? 'bg-[#080808]/50 border-yellow-500/10' : 'bg-[#121212] border-[#27272a]'}`}>
              <span className={`text-lg font-mono font-bold w-6 text-center ${isGodMode ? 'text-yellow-700' : 'text-[#52525B]'}`}>{index + 4}</span>
              
              <div className="w-10 h-10 rounded-full bg-[#1A1A1A] overflow-hidden flex-shrink-0">
                {user.photoURL && <img src={user.photoURL} className="w-full h-full object-cover" />}
              </div>
              
              <div className="flex-1">
                <div className={`font-bold text-sm ${isGodMode ? 'text-yellow-100' : 'text-white'}`}>{user.displayName}</div>
                <div className="text-[10px] text-[#A1A1AA] uppercase">{user.totalSeconds ? (user.totalSeconds / 3600).toFixed(1) + 'h Focus' : '0.0h Focus'}</div>
              </div>

              <div className={`font-mono font-bold ${isGodMode ? 'text-yellow-500' : 'text-[#00FF94]'}`}>
                {user.totalPoints || 0}
              </div>
            </div>
          ))}
        </div>

      </div>
      <BottomNav />
    </div>
  );
}