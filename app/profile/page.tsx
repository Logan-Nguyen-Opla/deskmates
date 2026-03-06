"use client";

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getRole, UserRole } from '@/utils/roles';
import BottomNav from '@/components/BottomNav';
import { GodModeBackground } from '@/components/GodMode';
import { useRouter } from 'next/navigation'; // REQUIRED FIX
import { 
  Zap, 
  Shield, 
  Crown, 
  GraduationCap, 
  Star,
  Settings,
  LogOut 
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter(); // INITIALIZED ROUTER
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [academic, setAcademic] = useState({ school: '', target: '' });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) return router.push('/login');
      setUser(currentUser);
      
      const userRef = doc(db, 'users', currentUser.uid);
      const unsubData = onSnapshot(userRef, (snap) => {
        const data = snap.data() || {};
        setStats(data);
        setAcademic({ school: data.school || '', target: data.target || '' });
        setRole(getRole(currentUser, data));
        setLoading(false);
      });
      return () => unsubData();
    });
    return () => unsub();
  }, [router]);

  const saveAcademic = async () => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), academic);
    setIsEditing(false);
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center font-mono text-yellow-500">SCANNING BIOMETRICS...</div>;

  const hours = Math.floor((stats?.totalSeconds || 0) / 3600);

  return (
    <div className="min-h-screen bg-black text-white font-mono pb-32 relative overflow-hidden">
      <GodModeBackground />
      
      <div className="relative z-10 p-8 pt-20 max-w-2xl mx-auto space-y-8">
        {/* IDENTITY HEADER */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-yellow-500/10 border border-yellow-500/20 rounded-full mx-auto flex items-center justify-center relative">
             {role?.isFounder && <Crown className="absolute -top-4 text-yellow-500 w-8 h-8 animate-bounce" />}
             <Shield className={`w-10 h-10 ${role?.isFounder ? 'text-yellow-500' : 'text-gray-600'}`} />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">{user?.displayName}</h1>
          
          {/* BADGE SYSTEM */}
          <div className="flex flex-wrap justify-center gap-2">
            {hours >= 1 && <RankBadge label="INITIATE" color="#94a3b8" />}
            {hours >= 10 && <RankBadge label="SPECIALIST" color="#fbbf24" />}
            {hours >= 50 && <RankBadge label="ELITE" color="#00FF94" />}
            {hours >= 100 && <RankBadge label="OMEGA" color="#ef4444" />}
          </div>
        </div>

        {/* ACADEMIC CREDENTIALS */}
        <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[3rem] space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.4em]">Academic Data</h3>
                <button 
                  onClick={() => isEditing ? saveAcademic() : setIsEditing(true)} 
                  className="text-[10px] text-gray-500 uppercase font-black hover:text-white"
                >
                  {isEditing ? '[ Save Protocol ]' : '[ Edit Intel ]'}
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                    <p className="text-[9px] text-gray-600 uppercase font-bold flex items-center gap-2"><GraduationCap className="w-3 h-3"/> Institution</p>
                    {isEditing ? (
                      <input value={academic.school} onChange={e => setAcademic({...academic, school: e.target.value})} className="bg-white/5 border-b border-yellow-500 outline-none w-full text-sm py-1" />
                    ) : (
                      <p className="text-sm font-bold text-gray-300">{stats?.school || 'Unlinked'}</p>
                    )}
                </div>
                <div className="space-y-1">
                    <p className="text-[9px] text-gray-600 uppercase font-bold flex items-center gap-2"><Star className="w-3 h-3"/> Target Grade</p>
                    {isEditing ? (
                      <input value={academic.target} onChange={e => setAcademic({...academic, target: e.target.value})} className="bg-white/5 border-b border-yellow-500 outline-none w-full text-sm py-1" />
                    ) : (
                      <p className="text-sm font-bold text-gray-300">{stats?.target || '0.0'}</p>
                    )}
                </div>
            </div>
        </div>

        {/* FOCUS STATS */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={<Zap className="w-4 h-4" />} label="Focus Points" value={stats?.totalPoints || 0} />
          <StatCard icon={<Star className="w-4 h-4" />} label="Hours Learned" value={hours} />
        </div>

        {/* ACTIONS */}
        <div className="space-y-4">
            {role?.canManageRooms && (
              <button 
                onClick={() => router.push('/admin')} 
                className="w-full bg-yellow-500 text-black py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] transition-transform"
              >
                Enter Command Deck
              </button>
            )}
            <button 
              onClick={() => auth.signOut()} 
              className="w-full border border-red-900/30 text-red-500 py-5 rounded-2xl font-black text-xs uppercase hover:bg-red-900/10 transition-colors"
            >
              Terminate Session
            </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

// Helper components
function RankBadge({ label, color }: { label: string, color: string }) {
    return (
      <span 
        style={{ borderColor: `${color}44`, color: color }} 
        className="text-[8px] font-black px-3 py-1 rounded-full border bg-black/50 uppercase tracking-widest shadow-[0_0_10px_rgba(0,0,0,0.5)]"
      >
        {label}
      </span>
    );
}

function StatCard({ icon, label, value }: any) {
  return (
    <div className="bg-[#050505] border border-white/5 p-6 rounded-[2rem] space-y-2 group hover:border-yellow-500/20 transition-colors">
      <div className="text-yellow-500 group-hover:scale-110 transition-transform">{icon}</div>
      <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{label}</div>
      <div className="text-xl font-black italic">{value}</div>
    </div>
  );
}