"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { 
  collection, query, where, onSnapshot, doc, updateDoc, getDoc, addDoc, serverTimestamp, arrayUnion, arrayRemove, Timestamp, deleteDoc 
} from 'firebase/firestore';
import { getRole, UserRole } from '@/utils/roles';
import { GodModeBackground, OmegaHeader, LoadingSequence, ReactorCore } from '@/components/GodMode';
import BottomNav from '@/components/BottomNav';
import { Check, X, Calendar, Users, Trash2, Clock } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [scheduledRooms, setScheduledRooms] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'rooms' | 'apps'>('rooms');

  // MOBILE-FRIENDLY DATE STATE
  const [form, setForm] = useState({ title: '', desc: '', dateOffset: '0', hour: '09', min: '00', grade: '', reqs: '' });
  const ROOMS_PATH = 'artifacts/deskmates-online/public/data/rooms';

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) return router.push('/login');
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      const r = getRole(user, docSnap.data());
      setRole(r);

      if (!r.canManageRooms) return router.push('/profile');

      const unsubRooms = onSnapshot(query(collection(db, ROOMS_PATH), where("moderatorId", "==", user.uid)), (snap) => {
        setScheduledRooms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });

      if (r.isFounder) {
        onSnapshot(query(collection(db, 'applications'), where('status', '==', 'pending')), (snap) => {
          setApps(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
      }
      return () => unsubRooms();
    });
    return () => unsubAuth();
  }, [router]);

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + parseInt(form.dateOffset));
      targetDate.setHours(parseInt(form.hour), parseInt(form.min), 0, 0);

      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title })
      });
      const data = await res.json();
      
      await addDoc(collection(db, ROOMS_PATH), {
        title: form.title.toUpperCase(),
        description: form.desc,
        startTime: Timestamp.fromDate(targetDate),
        grade: form.grade,
        reqs: form.reqs,
        moderatorId: auth.currentUser?.uid,
        status: 'scheduled',
        approvedAgents: [auth.currentUser?.uid],
        pendingRequests: [],
        hostUrl: data.hostRoomUrl.replace('deskmates.whereby', 'deskmate.whereby'),
        userUrl: data.roomUrl.replace('deskmates.whereby', 'deskmate.whereby'),
        createdAt: serverTimestamp()
      });
      alert("RESERVATION LOGGED.");
    } catch (e) { alert("Deployment Failed."); }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 pb-32 relative overflow-hidden font-mono">
      <GodModeBackground />
      <OmegaHeader userName={role?.rank || "AGENT"} />

      {/* VIEW TOGGLE */}
      <div className="flex gap-4 mb-8 relative z-20">
        <button onClick={() => setView('rooms')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase border ${view === 'rooms' ? 'bg-yellow-500 text-black' : 'border-white/10 text-gray-500'}`}>War Room</button>
        {role?.isFounder && <button onClick={() => setView('apps')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase border ${view === 'apps' ? 'bg-[#00FF94] text-black' : 'border-white/10 text-gray-500'}`}>Clearance</button>}
      </div>

      {view === 'rooms' ? (
        <>
          <ReactorCore>
            <form onSubmit={handleCreateReservation} className="space-y-4">
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="MISSION TITLE" className="w-full bg-black border-2 border-white/5 p-4 rounded-xl text-yellow-500 font-black outline-none" />
              
              <div className="grid grid-cols-3 gap-2">
                <select value={form.dateOffset} onChange={e => setForm({...form, dateOffset: e.target.value})} className="bg-black border-2 border-white/5 p-4 rounded-xl text-[10px] font-black uppercase">
                  <option value="0">Today</option>
                  <option value="1">Tomorrow</option>
                  <option value="2">Day After</option>
                </select>
                <select value={form.hour} onChange={e => setForm({...form, hour: e.target.value})} className="bg-black border-2 border-white/5 p-4 rounded-xl text-[10px] font-black uppercase">
                  {Array.from({length: 24}).map((_, i) => <option key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}:00</option>)}
                </select>
                <select value={form.min} onChange={e => setForm({...form, min: e.target.value})} className="bg-black border-2 border-white/5 p-4 rounded-xl text-[10px] font-black uppercase">
                  <option value="00">00</option><option value="15">15</option><option value="30">30</option><option value="45">45</option>
                </select>
              </div>

              {/* RESTORED SUBMIT BUTTON */}
              <button type="submit" className="w-full bg-yellow-500 text-black py-5 rounded-2xl font-black uppercase text-xs tracking-widest italic hover:scale-[1.02] transition-transform">Initialize Reservation</button>
            </form>
          </ReactorCore>

          <div className="space-y-6 mt-10">
            {scheduledRooms.map(room => (
              <div key={room.id} className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2.5rem] relative">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter">{room.title}</h3>
                  {/* RESTORED REMOVE ROOM */}
                  <button onClick={() => deleteDoc(doc(db, ROOMS_PATH, room.id))} className="p-3 bg-red-600/10 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
                {/* Pending Agent logic here... */}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4 relative z-10">
          {apps.map(app => (
            <div key={app.id} className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl flex justify-between items-center">
              <div><p className="font-black uppercase text-sm">{app.displayName}</p><p className="text-[10px] text-gray-600">{app.school}</p></div>
              {/* RESTORED ALLOW ADMIN BUTTON */}
              <button onClick={() => updateDoc(doc(db, 'users', app.uid), {role: 'moderator'})} className="p-4 bg-[#00FF94]/10 text-[#00FF94] rounded-xl hover:bg-[#00FF94] hover:text-black transition-all"><Check /></button>
            </div>
          ))}
        </div>
      )}
      <BottomNav />
    </div>
  );
}