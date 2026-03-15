"use client";

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getReputationStatus, REPUTATION_RULES, ACADEMIC_SUBJECTS, VIETNAMESE_GRADES, formatScore } from '@/utils/reputation';
import { calculateBadges, BadgeData } from '@/utils/badges';
import { GodModeBackground, LoadingSequence } from '@/components/GodMode';
import { getRole, UserRole } from '@/utils/roles';
import BottomNav from '@/components/BottomNav';
import { useRouter } from 'next/navigation';
import { 
  Zap, Shield, Crown, Plus, Trash2, BookOpen, Star, HelpCircle, X, LogOut 
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [helpTab, setHelpTab] = useState<string | null>(null);
  
  // State for stable custom score entry
  const [newSub, setNewSub] = useState({ name: ACADEMIC_SUBJECTS[0], val: '', isCustom: false });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) return router.push('/login');
      setUser(currentUser);
      
      return onSnapshot(doc(db, 'users', currentUser.uid), (snap) => {
        const data = snap.data() || {};
        setStats(data);
        setRole(getRole(currentUser, data));
        setLoading(false);
      });
    });
    return () => unsub();
  }, [router]);

  const addSubject = async () => {
    if (!newSub.val || !user) return;
    const finalVal = formatScore(newSub.val);
    await updateDoc(doc(db, 'users', user.uid), {
      subjects: arrayUnion({ name: newSub.name, grade: finalVal, id: Date.now() })
    });
    setNewSub({ ...newSub, val: '', isCustom: false });
  };

  if (loading) return <LoadingSequence />;

  const rep = stats?.reputation ?? 100;
  const status = getReputationStatus(rep);
  const hours = Math.floor((stats?.totalSeconds || 0) / 3600);
  const badges = calculateBadges(stats, role?.rank?.toLowerCase() || 'agent');

  return (
    <div className="min-h-screen bg-black text-white font-mono pb-32 relative overflow-hidden p-4 md:p-8">
      <GodModeBackground />
      
      <div className="relative z-10 max-w-2xl mx-auto space-y-6 pt-12">
        
        {/* IDENTITY: FIXED CROWN CLIPPING */}
        <div className="text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto">
             {role?.rank === 'FOUNDER' && (
               <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-500 w-10 h-10 animate-bounce z-20 drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]" />
             )}
             <div className="w-full h-full rounded-full border-4 border-yellow-500/20 overflow-hidden bg-white/5 relative z-10 shadow-2xl">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Shield className="w-10 h-10 text-gray-700 m-auto" />
                )}
             </div>
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">{user?.displayName}</h1>
          
          {/* BADGE LIST WITH HELP */}
          <div className="flex flex-wrap justify-center gap-2 relative">
            <button onClick={() => setHelpTab('badges')} className="absolute -right-6 top-1 text-gray-600 hover:text-white transition-colors">
                <HelpCircle className="w-4 h-4" />
            </button>
            {badges.map(b => (
              <span key={b.id} style={{ borderColor: `${b.color}44`, color: b.color }} className="text-[8px] font-black px-3 py-1 rounded-full border bg-black/50 uppercase tracking-widest shadow-lg">
                {b.label}
              </span>
            ))}
          </div>
        </div>

        {/* REPUTATION CARD WITH HELP */}
        <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[3rem] text-center relative overflow-hidden shadow-2xl group">
          <button onClick={() => setHelpTab('reputation')} className="absolute right-6 top-6 text-gray-600 group-hover:text-yellow-500 transition-colors z-20">
              <HelpCircle className="w-5 h-5" />
          </button>
          <div className="absolute top-0 left-0 h-1 bg-yellow-500 transition-all duration-1000" style={{width: `${rep}%`}} />
          <h2 className="text-4xl font-black italic tracking-tighter mb-2">{rep} <span className="text-[10px] text-gray-600 uppercase tracking-widest">Reputation</span></h2>
          <div className="flex justify-center gap-6 text-[9px] font-black uppercase tracking-widest">
             <span className={status.canMic ? "text-[#00FF94]" : "text-red-600"}>Mic: {status.canMic ? "ON" : "OFF"}</span>
             <span className={status.canCamera ? "text-[#00FF94]" : "text-red-600"}>Cam: {status.canCamera ? "ON" : "OFF"}</span>
             <span className="text-yellow-500">Multiplier: {status.multiplier}x</span>
          </div>
        </div>

        {/* CORE FOCUS STATS */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={<Zap className="w-4 h-4" />} label="Focus Points" value={stats?.totalPoints || 0} />
          <StatCard icon={<Star className="w-4 h-4" />} label="Hours Learned" value={hours} />
        </div>

        {/* NEURAL TRANSCRIPT */}
        <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[3rem] space-y-6 shadow-2xl">
          <h3 className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.4em] flex items-center gap-3 border-b border-white/5 pb-6">
            <BookOpen className="w-4 h-4"/> Neural Transcript
          </h3>
          <div className="space-y-3">
            {stats?.subjects?.map((s: any) => (
              <div key={s.id} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 group hover:border-yellow-500/20 transition-all">
                <span className="text-[10px] font-black uppercase text-gray-500">{s.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-black text-yellow-500 italic">{s.grade}</span>
                  <button onClick={() => updateDoc(doc(db, 'users', user.uid), { subjects: arrayRemove(s) })}><Trash2 className="w-3 h-3 text-red-900 hover:text-red-500 transition-colors" /></button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-4 pt-6 border-t border-white/5">
            <div className="grid grid-cols-2 gap-3">
              <select value={newSub.name} onChange={e => setNewSub({...newSub, name: e.target.value})} className="bg-black border border-white/10 p-4 rounded-xl text-[10px] font-black uppercase outline-none focus:border-yellow-500">
                {ACADEMIC_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select 
                value={newSub.isCustom ? "custom" : newSub.val} 
                onChange={e => {
                  const val = e.target.value;
                  if (val === "custom") setNewSub({...newSub, isCustom: true, val: ''});
                  else setNewSub({...newSub, isCustom: false, val: val});
                }} 
                className="bg-black border border-white/10 p-4 rounded-xl text-[10px] font-black uppercase outline-none focus:border-yellow-500"
              >
                <option value="">Score...</option>
                {VIETNAMESE_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                <option value="custom">Manual Point</option>
              </select>
            </div>
            
            {newSub.isCustom && (
              <input 
                type="text" 
                placeholder="Enter (e.g. 9.1)" 
                value={newSub.val}
                onChange={e => setNewSub({...newSub, val: e.target.value})} 
                className="w-full bg-black border border-white/10 p-4 rounded-xl text-center text-xs font-black text-yellow-500 outline-none" 
              />
            )}
            <button onClick={addSubject} className="w-full bg-yellow-500 text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
              <Plus className="w-4 h-4"/> Link Intel
            </button>
          </div>
        </div>

        {/* ADMIN ACTIONS & LOGOUT */}
        <div className="space-y-4">
            {/* RESTORED: Only Admins see this button */}
            {role?.canManageRooms && (
              <button onClick={() => router.push('/admin')} className="w-full bg-yellow-500 text-black py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-[0_0_30px_rgba(255,215,0,0.2)]">
                Enter Command Deck
              </button>
            )}
            
            <button onClick={() => auth.signOut()} className="w-full border border-red-900/30 text-red-500 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-red-900/10 transition-colors flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" /> Terminate Session
            </button>
        </div>

        {/* INFO OVERLAYS */}
        {helpTab && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
            <div className="max-w-md w-full bg-[#0a0a0a] border border-white/10 p-8 rounded-[3rem] space-y-6 relative overflow-y-auto max-h-[80vh] shadow-2xl">
              <button onClick={() => setHelpTab(null)} className="absolute right-8 top-8 text-gray-500 hover:text-white"><X /></button>
              
              {helpTab === 'reputation' ? (
                <div className="space-y-6">
                  <h3 className="text-xl font-black italic text-yellow-500 uppercase tracking-tighter">Reputation Protocol</h3>
                  <div className="space-y-4">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest border-b border-white/5 pb-2">Penalties</p>
                    {REPUTATION_RULES.VIOLATIONS.map(v => (
                      <div key={v.label} className="flex justify-between items-center text-xs">
                        <span className="text-gray-300 italic">{v.label}</span>
                        <span className="text-red-600 font-black">-{v.deduction}</span>
                      </div>
                    ))}
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest border-b border-white/5 pb-2 pt-4">Neural Recovery</p>
                    <p className="text-xs italic text-gray-300">{REPUTATION_RULES.RECOVERY}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-xl font-black italic text-[#00FF94] uppercase tracking-tighter">Achievement Array</h3>
                  <div className="space-y-4">
                    {calculateBadges(stats, role?.rank?.toLowerCase() || 'agent').map(b => (
                      <div key={b.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: b.color }} />
                           <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: b.color }}>{b.label}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 italic pl-3">{b.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2.5rem] space-y-2 group hover:border-yellow-500/20 transition-colors shadow-xl">
      <div className="text-yellow-500 group-hover:scale-110 transition-transform">{icon}</div>
      <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{label}</div>
      <div className="text-2xl font-black italic">{value}</div>
    </div>
  );
}