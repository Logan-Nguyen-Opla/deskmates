"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getRole, UserRole } from '@/utils/roles';
import BottomNav from '@/components/BottomNav';
import { GodModeBackground } from '@/components/GodMode';
import { Trophy, Zap, Shield, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  // FIX: Explicitly define the state type as UserRole or null
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const data = userDoc.data() || {};
      setStats(data);
      
      // Correctly set the role object
      setRole(getRole(currentUser, data));
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center font-mono text-yellow-500 uppercase tracking-widest">Scanning Identity...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-mono pb-24 relative overflow-hidden">
      {role?.isFounder && <GodModeBackground />}

      <div className="relative z-10 p-8 pt-20 max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-yellow-500/10 border border-yellow-500/20 rounded-full mx-auto flex items-center justify-center">
             <Shield className={`w-10 h-10 ${role?.isFounder ? 'text-yellow-500' : 'text-gray-600'}`} />
          </div>
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">{user?.displayName || 'Agent'}</h1>
            <p className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.4em]">{role?.rank}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={<Zap className="w-4 h-4" />} label="Focus Points" value={stats?.totalPoints || 0} />
          <StatCard icon={<Trophy className="w-4 h-4" />} label="Rank" value={role?.rank === 'FOUNDER' ? 'TOP 0.1%' : 'BRONZE'} />
        </div>

        <button 
          onClick={() => auth.signOut()}
          className="w-full py-4 border border-red-500/20 rounded-2xl flex items-center justify-center gap-3 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/5 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Terminate Session
        </button>
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