"use client";

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getReputationStatus, ACADEMIC_SUBJECTS, VIETNAMESE_GRADES, formatScore } from '@/utils/reputation';
import { GodModeBackground, LoadingSequence } from '@/components/GodMode';
import BottomNav from '@/components/BottomNav';
import { Zap, Shield, Crown, Plus, Trash2, BookOpen, User } from 'lucide-react';

export default function ProfilePage() {
  const [stats, setStats] = useState<any>(null);
  const [newSub, setNewSub] = useState({ name: ACADEMIC_SUBJECTS[0], val: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) return;
      onSnapshot(doc(db, 'users', user.uid), (snap) => {
        setStats(snap.data() || {});
        setLoading(false);
      });
    });
    return () => unsub();
  }, []);

  const addSubject = async () => {
    if (!newSub.val || !auth.currentUser) return;
    const finalVal = formatScore(newSub.val);
    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      subjects: arrayUnion({ name: newSub.name, grade: finalVal, id: Date.now() })
    });
    setNewSub({ ...newSub, val: '' });
  };

  if (loading) return <LoadingSequence />;

  const rep = stats?.reputation ?? 100;
  const status = getReputationStatus(rep);

  return (
    <div className="min-h-screen bg-black text-white font-mono pb-32 relative overflow-hidden p-4">
      <GodModeBackground />
      <div className="relative z-10 max-w-xl mx-auto space-y-6 pt-12">
        
        {/* REPUTATION CARD */}
        <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[3rem] text-center relative overflow-hidden">
          <div className={`absolute top-0 left-0 h-1 bg-yellow-500 transition-all`} style={{width: `${rep}%`}} />
          <h2 className="text-4xl font-black italic tracking-tighter mb-2">{rep} <span className="text-[10px] text-gray-600 uppercase">Reputation</span></h2>
          <div className="flex justify-center gap-4 text-[9px] font-black uppercase">
             <span className={status.canMic ? "text-[#00FF94]" : "text-red-600"}>Mic: {status.canMic ? "ON" : "OFF"}</span>
             <span className={status.canCamera ? "text-[#00FF94]" : "text-red-600"}>Cam: {status.canCamera ? "ON" : "OFF"}</span>
             <span className="text-yellow-500">Mult: {status.multiplier}x</span>
          </div>
        </div>

        {/* TRANSCRIPT */}
        <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[3rem] space-y-6">
          <h3 className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.4em] flex items-center gap-2"><BookOpen className="w-4 h-4"/> Neural Transcript</h3>
          <div className="space-y-3">
            {stats?.subjects?.map((s: any) => (
              <div key={s.id} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black uppercase text-gray-500">{s.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-yellow-500 italic">{s.grade}</span>
                  <button onClick={() => updateDoc(doc(db, 'users', auth.currentUser!.uid), { subjects: arrayRemove(s) })}><Trash2 className="w-3 h-3 text-red-900" /></button>
                </div>
              </div>
            ))}
          </div>
          
          {/* SUBJECT ENTRY */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="grid grid-cols-2 gap-4">
              <select value={newSub.name} onChange={e => setNewSub({...newSub, name: e.target.value})} className="bg-black border border-white/10 p-4 rounded-xl text-[10px] font-black uppercase">
                {ACADEMIC_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={newSub.val} onChange={e => setNewSub({...newSub, val: e.target.value})} className="bg-black border border-white/10 p-4 rounded-xl text-[10px] font-black uppercase">
                <option value="">Score Type...</option>
                {VIETNAMESE_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                <option value="custom">Custom Point...</option>
              </select>
            </div>
            {newSub.val === "custom" && (
              <input type="text" placeholder="Enter point (e.g. 9.1)" onChange={e => setNewSub({...newSub, val: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl text-center text-xs font-black" />
            )}
            <button onClick={addSubject} className="w-full bg-yellow-500 text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"><Plus className="w-4 h-4"/> Link Intel</button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}