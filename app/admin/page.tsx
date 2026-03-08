"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { 
  collection, query, where, onSnapshot, doc, updateDoc, getDoc, addDoc, serverTimestamp, Timestamp, deleteDoc, 
  arrayUnion
} from 'firebase/firestore';
import { getRole, UserRole } from '@/utils/roles';
import { GodModeBackground, OmegaHeader, LoadingSequence, ReactorCore } from '@/components/GodMode';
import BottomNav from '@/components/BottomNav';
import { Check, X, Users, Trash2, Clock, ShieldCheck } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [scheduledRooms, setScheduledRooms] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'rooms' | 'apps'>('rooms');

  const [form, setForm] = useState({ title: '', desc: '', dateOffset: '0', hour: '09', min: '00', grade: '', reqs: '' });
  const ROOMS_PATH = 'artifacts/deskmates-online/public/data/rooms';

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) return router.push('/login');
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      const r = getRole(user, docSnap.data());
      setRole(r);

      if (!r.canManageRooms) return router.push('/profile');

      // Listen for Admin's own scheduled rooms
      const unsubRooms = onSnapshot(query(collection(db, ROOMS_PATH), where("moderatorId", "==", user.uid)), (snap) => {
        setScheduledRooms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });

      // RESTORED: Application listener for Founders
      let unsubApps = () => {};
      if (r.isFounder) {
        unsubApps = onSnapshot(query(collection(db, 'applications'), where('status', '==', 'pending')), (snap) => {
          setApps(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
      }
      return () => { unsubRooms(); unsubApps(); };
    });
    return () => unsubAuth();
  }, [router]);

  const issueViolation = async (agent: any, rule: any) => {
    if (!confirm(`DEDUCT ${rule.deduction} REP FROM ${agent.displayName.toUpperCase()}?`)) return;
    
    const currentRep = agent.reputation ?? 100;
    await updateDoc(doc(db, 'users', agent.uid), {
      reputation: Math.max(0, currentRep - rule.deduction),
      violationHistory: arrayUnion({
        type: rule.label,
        deduction: rule.deduction,
        timestamp: new Date().toISOString(),
        issuedBy: auth.currentUser?.uid
      })
    });
    alert("PENALTY ENFORCED.");
  };

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Establish Vietnam Baseline (GMT+7)
      const now = new Date();
      const vietnamNow = new Date(now.getTime() + (7 * 60 * 60 * 1000));
      
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + parseInt(form.dateOffset));
      targetDate.setHours(parseInt(form.hour), parseInt(form.min), 0, 0);

      // 2. THE PAST LOCK: Prevent scheduling earlier than right now
      if (targetDate.getTime() <= now.getTime()) {
        alert("ERROR: Protocol cannot be scheduled in the past. Synchronize to future time.");
        return;
      }

      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title })
      });
      const data = await res.json();
      
      await addDoc(collection(db, ROOMS_PATH), {
        title: form.title.toUpperCase(),
        description: form.desc,
        startTime: Timestamp.fromDate(targetDate), // Corrected temporal anchor
        grade: form.grade,
        reqs: form.reqs,
        moderatorId: auth.currentUser?.uid,
        status: 'scheduled', // Must match Lobby filter
        approvedAgents: [auth.currentUser?.uid],
        pendingRequests: [],
        hostUrl: data.hostRoomUrl.replace('deskmates.whereby', 'deskmate.whereby'),
        userUrl: data.roomUrl.replace('deskmates.whereby', 'deskmate.whereby'),
        createdAt: serverTimestamp()
      });
      alert("RESERVATION LOGGED.");
    } catch (e) { alert("Deployment Failed."); }
  };

  const handleApproveAgent = async (app: any) => {
    await updateDoc(doc(db, 'users', app.uid), { role: 'moderator' });
    await updateDoc(doc(db, 'applications', app.id), { status: 'approved' });
    alert(`OPERATIVE ${app.displayName} AUTHORIZED.`);
  };

  if (loading) return <LoadingSequence />;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 pb-32 relative overflow-hidden font-mono">
      <GodModeBackground />
      <OmegaHeader userName={role?.rank || "AGENT"} />

      <div className="flex gap-4 mb-10 relative z-20 max-w-xl mx-auto">
        <button onClick={() => setView('rooms')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase border transition-all ${view === 'rooms' ? 'bg-yellow-500 text-black border-yellow-500' : 'border-white/10 text-gray-600'}`}>War Room</button>
        {role?.isFounder && (
          <button onClick={() => setView('apps')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase border transition-all ${view === 'apps' ? 'bg-[#00FF94] text-black border-[#00FF94]' : 'border-white/10 text-gray-600'}`}>
            Clearance {apps.length > 0 && <span className="ml-2 bg-red-600 text-white px-2 py-0.5 rounded-full text-[8px]">{apps.length}</span>}
          </button>
        )}
      </div>

      {view === 'rooms' ? (
        <>
          <ReactorCore>
            <form onSubmit={handleCreateReservation} className="space-y-4">
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="SESSION TITLE (e.g. 10TH GRADE MATH)" className="w-full bg-black border-2 border-white/5 p-5 rounded-2xl text-yellow-500 font-black outline-none focus:border-yellow-500" />
              
              <div className="grid grid-cols-3 gap-2">
                <select value={form.dateOffset} onChange={e => setForm({...form, dateOffset: e.target.value})} className="bg-black border-2 border-white/5 p-4 rounded-xl text-[10px] font-black uppercase text-gray-400">
                  <option value="0">Today</option><option value="1">Tomorrow</option><option value="2">Day After</option>
                </select>
                <select value={form.hour} onChange={e => setForm({...form, hour: e.target.value})} className="bg-black border-2 border-white/5 p-4 rounded-xl text-[10px] font-black uppercase text-gray-400">
                  {Array.from({length: 24}).map((_, i) => <option key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}:00</option>)}
                </select>
                <select value={form.min} onChange={e => setForm({...form, min: e.target.value})} className="bg-black border-2 border-white/5 p-4 rounded-xl text-[10px] font-black uppercase text-gray-400">
                  <option value="00">00</option><option value="15">15</option><option value="30">30</option><option value="45">45</option>
                </select>
              </div>

              <input value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} placeholder="GRADE REQUIREMENT" className="w-full bg-black border-2 border-white/5 p-4 rounded-xl text-xs outline-none" />
              <button type="submit" className="w-full bg-yellow-500 text-black py-6 rounded-3xl font-black uppercase text-xs tracking-widest italic hover:scale-[1.01] transition-transform shadow-2xl shadow-yellow-500/10">Deploy Reservation</button>
            </form>
          </ReactorCore>

          <div className="max-w-4xl mx-auto space-y-6 mt-12">
            {scheduledRooms.map(room => (
              <div key={room.id} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[3rem] group hover:border-yellow-500/20 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black italic uppercase text-white">{room.title}</h3>
                    <p className="text-[10px] text-gray-600 font-bold uppercase mt-1 flex items-center gap-2"><Clock className="w-3 h-3" /> {room.startTime?.toDate().toLocaleString()}</p>
                  </div>
                  <button onClick={() => deleteDoc(doc(db, ROOMS_PATH, room.id))} className="p-4 bg-red-600/10 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
                {/* Pending requests would be mapped here */}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          {apps.map(app => (
            <div key={app.id} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] flex justify-between items-center group hover:border-[#00FF94]/20 transition-all">
              <div>
                <p className="font-black uppercase text-lg italic text-white group-hover:text-[#00FF94] transition-colors">{app.displayName}</p>
                <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">{app.school}</p>
              </div>
              <button onClick={() => handleApproveAgent(app)} className="p-5 bg-[#00FF94]/10 text-[#00FF94] rounded-2xl border border-[#00FF94]/20 hover:bg-[#00FF94] hover:text-black transition-all"><Check /></button>
            </div>
          ))}
        </div>
      )}
      <BottomNav />
    </div>
  );
}