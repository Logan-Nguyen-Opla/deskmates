"use client";

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getRole, UserRole } from '@/utils/roles';
import BottomNav from '@/components/BottomNav';
import { 
  GodModeBackground, 
  LoadingSequence // FIXED: Added LoadingSequence
} from '@/components/GodMode';
import { useRouter } from 'next/navigation';
import { Zap, Shield, Crown, Star, Plus, Trash2, BookOpen, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [newSub, setNewSub] = useState({ name: '', grade: '' });

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

  const addSubject = async () => {
    if (!newSub.name || !newSub.grade || !user) return;
    await updateDoc(doc(db, 'users', user.uid), { 
      subjects: arrayUnion({ ...newSub, id: Date.now() }) 
    });
    setNewSub({ name: '', grade: '' });
  };

  if (loading) return <LoadingSequence />;

  const hours = Math.floor((stats?.totalSeconds || 0) / 3600);

  return (
    <div className="min-h-screen bg-black text-white font-mono pb-32 relative overflow-hidden">
      <GodModeBackground />
      <div className="relative z-10 p-8 pt-20 max-w-2xl mx-auto space-y-8">
        {/* IDENTITY */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-yellow-500/10 border border-yellow-500/20 rounded-full mx-auto flex items-center justify-center relative">
             {role?.isFounder && <Crown className="absolute -top-4 text-yellow-500 w-8 h-8 animate-bounce" />}
             <Shield className={`w-10 h-10 ${role?.isFounder ? 'text-yellow-500' : 'text-gray-600'}`} />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">{user?.displayName}</h1>
          <div className="flex flex-wrap justify-center gap-2">
            {hours >= 1 && <Badge label="INITIATE" color="#94a3b8" />}
            {hours >= 10 && <Badge label="SPECIALIST" color="#fbbf24" />}
            {hours >= 50 && <Badge label="ELITE" color="#00FF94" />}
            {hours >= 100 && <Badge label="OMEGA" color="#ef4444" />}
          </div>
        </div>

        {/* NEURAL TRANSCRIPT */}
        <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[3.5rem] space-y-8 shadow-2xl">
            <h3 className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.4em] border-b border-white/5 pb-6 flex items-center gap-3"><BookOpen className="w-4 h-4"/> Neural Transcript</h3>
            <div className="space-y-4">
                {stats?.subjects?.length === 0 ? <p className="text-[9px] text-gray-700 uppercase font-bold tracking-widest text-center py-4">No Subjects Logged</p> : 
                  stats?.subjects?.map((s: any) => (
                    <div key={s.id} className="flex justify-between items-center bg-white/5 p-5 rounded-3xl border border-white/5 group hover:border-yellow-500/20 transition-all">
                        <span className="text-xs font-black uppercase text-gray-400 tracking-tighter">{s.name}</span>
                        <div className="flex items-center gap-6">
                            <span className="text-sm font-black text-yellow-500 italic">{s.grade}</span>
                            <button onClick={() => updateDoc(doc(db, 'users', user.uid), { subjects: arrayRemove(s) })}><Trash2 className="w-3 h-3 text-red-900 hover:text-red-500 transition-colors" /></button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex gap-4 pt-4 border-t border-white/5">
                <input value={newSub.name} onChange={e => setNewSub({...newSub, name: e.target.value})} placeholder="SUBJECT (E.G. IELTS)" className="flex-1 bg-black border border-white/10 p-5 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-yellow-500 transition-colors" />
                <input value={newSub.grade} onChange={e => setNewSub({...newSub, grade: e.target.value})} placeholder="7.5" className="w-24 bg-black border border-white/10 p-5 rounded-2xl text-[10px] font-black text-center outline-none focus:border-yellow-500 transition-colors" />
                <button onClick={addSubject} className="bg-yellow-500 text-black p-5 rounded-2xl hover:scale-105 transition-transform"><Plus className="w-5 h-5"/></button>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={<Zap className="w-4 h-4" />} label="Focus Points" value={stats?.totalPoints || 0} />
          <StatCard icon={<Star className="w-4 h-4" />} label="Hours Learned" value={hours} />
        </div>

        <div className="space-y-4">
            {role?.canManageRooms && <button onClick={() => router.push('/admin')} className="w-full bg-yellow-500 text-black py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-[0_0_30px_rgba(255,215,0,0.2)]">Enter Command Deck</button>}
            <button onClick={() => auth.signOut()} className="w-full border border-red-900/30 text-red-500 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-red-900/10 transition-colors">Terminate Session</button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function Badge({ label, color }: any) {
    return <span style={{ borderColor: `${color}44`, color: color }} className="text-[8px] font-black px-4 py-1.5 rounded-full border bg-black/50 uppercase tracking-widest">{label}</span>;
}

function StatCard({ icon, label, value }: any) {
  return (
    <div className="bg-[#050505] border border-white/5 p-8 rounded-[3rem] space-y-2 group hover:border-yellow-500/20 transition-colors">
      <div className="text-yellow-500 group-hover:scale-110 transition-transform">{icon}</div>
      <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{label}</div>
      <div className="text-2xl font-black italic">{value}</div>
    </div>
  );
}