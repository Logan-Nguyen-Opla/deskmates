"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { getRole, UserRole } from '@/utils/roles';
import BottomNav from '@/components/BottomNav';
import { GodModeBackground } from '@/components/GodMode';
import { Trophy, Zap, Shield, LogOut, Crown } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) return router.push('/login');
      setUser(currentUser);
      
      const userRef = doc(db, 'users', currentUser.uid);
      const unsubData = onSnapshot(userRef, (snap) => {
        const data = snap.data() || {};
        setStats(data);
        setRole(getRole(currentUser, data));
        setLoading(false);
      });
      return () => unsubData();
    });
    return () => unsub();
  }, [router]);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center font-mono text-yellow-500 uppercase">Scanning Identity...</div>;

  const isFounder = role?.isFounder;

  return (
    <div className="min-h-screen bg-black text-white font-mono pb-24 relative overflow-hidden">
      {isFounder && <GodModeBackground />}

      <div className="relative z-10 p-8 pt-20 max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-yellow-500/10 border border-yellow-500/20 rounded-full mx-auto flex items-center justify-center relative">
             {isFounder && <Crown className="absolute -top-4 text-yellow-500 w-8 h-8 animate-bounce" />}
             <Shield className={`w-10 h-10 ${isFounder ? 'text-yellow-500' : 'text-gray-600'}`} />
          </div>
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase">{user?.displayName || 'Agent'}</h1>
            <p className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.4em]">{role?.rank}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={<Zap className="w-4 h-4" />} label="Focus Points" value={isFounder ? '∞' : (stats?.totalPoints || 0)} />
          <StatCard icon={<Trophy className="w-4 h-4" />} label="Rank" value={isFounder ? 'OMEGA' : 'BRONZE'} />
        </div>

        {/* Action Center */}
        <div className="space-y-3">
            {isFounder || role?.canManageRooms ? (
                <button onClick={() => router.push('/admin')} className="w-full py-4 bg-yellow-500 text-black font-black text-[10px] uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-transform">
                    Enter Command Center
                </button>
            ) : (
                <button onClick={() => router.push('/apply')} className="w-full py-4 border border-white/10 text-gray-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white/5 transition-colors">
                    Request Moderator Clearance
                </button>
            )}
            
            <button onClick={() => auth.signOut()} className="w-full py-4 border border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-red-500/5 transition-colors flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" /> Terminate Session
            </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: any, label: string, value: any }) {
  return (
    <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] space-y-2">
      <div className="text-yellow-500">{icon}</div>
      <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{label}</div>
      <div className="text-xl font-black italic">{value}</div>
    </div>
  );
}