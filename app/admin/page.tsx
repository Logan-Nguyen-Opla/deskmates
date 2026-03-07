"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  getDoc, 
  addDoc, 
  serverTimestamp, 
  arrayUnion, 
  arrayRemove,
  Timestamp // REQUIRED FOR RESERVATIONS
} from 'firebase/firestore';
import { getRole, UserRole } from '@/utils/roles';
import { 
  GodModeBackground, 
  OmegaHeader, 
  LoadingSequence, 
  ReactorCore 
} from '@/components/GodMode';
import BottomNav from '@/components/BottomNav';
import { Check, X, Calendar, BookOpen, Users } from 'lucide-react'; // FIXED: Added Users

export default function AdminPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [scheduledRooms, setScheduledRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({ title: '', desc: '', time: '', grade: '', reqs: '' });
  const ROOMS_PATH = 'artifacts/deskmates-online/public/data/rooms';

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) return router.push('/login');
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      const r = getRole(user, docSnap.data());
      setRole(r);

      if (!r.canManageRooms) return router.push('/profile');

      // Listen for rooms where the user is the moderator
      const unsubRooms = onSnapshot(query(collection(db, ROOMS_PATH), where("moderatorId", "==", user.uid)), (snap) => {
        setScheduledRooms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });

      return () => unsubRooms();
    });
    return () => unsubAuth();
  }, [router]);

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.time) return;
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title })
      });
      const data = await res.json();
      
      await addDoc(collection(db, ROOMS_PATH), {
        ...form,
        title: form.title.toUpperCase(),
        startTime: Timestamp.fromDate(new Date(form.time)), // CONVERT TO FIREBASE TIME
        moderatorId: auth.currentUser?.uid,
        status: 'scheduled',
        approvedAgents: [auth.currentUser?.uid],
        pendingRequests: [],
        hostUrl: data.hostRoomUrl.replace('deskmates.whereby', 'deskmate.whereby'),
        userUrl: data.roomUrl.replace('deskmates.whereby', 'deskmate.whereby'),
        createdAt: serverTimestamp()
      });
      setForm({ title: '', desc: '', time: '', grade: '', reqs: '' });
      alert("RESERVATION LOGGED.");
    } catch (e) { alert("Deployment Failed."); }
  };

  const approveAgent = async (roomId: string, agent: any) => {
    await updateDoc(doc(db, ROOMS_PATH, roomId), {
      approvedAgents: arrayUnion(agent.uid),
      pendingRequests: arrayRemove(agent)
    });
    alert(`AGENT ${agent.displayName.toUpperCase()} APPROVED.`);
  };

  if (loading) return <LoadingSequence />;

  return (
    <div className="min-h-screen bg-black text-white p-10 pb-32 relative overflow-hidden font-mono selection:bg-yellow-500 selection:text-black">
      <GodModeBackground />
      <OmegaHeader userName={role?.rank || "AGENT"} />

      <ReactorCore>
        <form onSubmit={handleCreateReservation} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="MISSION TITLE (e.g. 12TH GRADE MATH)" className="md:col-span-2 bg-black border-2 border-yellow-500/20 p-5 rounded-2xl text-yellow-500 font-black outline-none focus:border-yellow-500" />
          <textarea value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} placeholder="SESSION GOALS & TOPICS..." className="md:col-span-2 bg-black border-2 border-yellow-500/20 p-5 rounded-2xl text-sm outline-none h-24" />
          <input type="datetime-local" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="bg-black border-2 border-yellow-500/20 p-5 rounded-2xl text-xs outline-none text-white" />
          <input value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} placeholder="GRADE REQUIREMENT" className="bg-black border-2 border-yellow-500/20 p-5 rounded-2xl text-xs outline-none" />
          <input value={form.reqs} onChange={e => setForm({...form, reqs: e.target.value})} placeholder="PROTOCOL REQS (e.g. CAMERA ON)" className="md:col-span-2 bg-black border-2 border-yellow-500/20 p-5 rounded-2xl text-xs outline-none" />
          <button type="submit" className="md:col-span-2 bg-yellow-500 text-black py-6 rounded-2xl font-black uppercase text-xs tracking-widest italic hover:scale-[1.01] transition-transform">Initialize Reservation</button>
        </form>
      </ReactorCore>

      <div className="max-w-5xl mx-auto space-y-10">
        {scheduledRooms.map(room => (
          <div key={room.id} className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[3rem] relative overflow-hidden">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter">{room.title}</h3>
                <div className="flex gap-4 mt-4">
                  <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-[9px] font-black uppercase">Grade: {room.grade}</span>
                  <span className="bg-red-600/10 text-red-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">{room.reqs}</span>
                </div>
              </div>
              <button onClick={() => updateDoc(doc(db, ROOMS_PATH, room.id), {status: 'closed'})} className="bg-red-600/10 text-red-600 p-4 rounded-2xl border border-red-600/20 hover:bg-red-600 hover:text-white transition-all"><X/></button>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mb-4 flex items-center gap-3"><Users className="w-4 h-4 text-yellow-500"/> Incoming Clearance Requests</h4>
              {room.pendingRequests?.length === 0 ? <p className="text-[10px] text-gray-800 italic uppercase font-black tracking-widest py-10 text-center border border-white/5 rounded-3xl">No Pending Transmissions</p> : 
                room.pendingRequests?.map((req: any) => (
                  <div key={req.uid} className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/5 group hover:border-[#00FF94]/30 transition-all">
                    <div>
                      <p className="font-black text-white uppercase text-sm tracking-tight">{req.displayName}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {req.academic?.subjects?.map((s: any) => (
                          <span key={s.name} className="text-[8px] text-gray-600 font-bold uppercase border border-white/10 px-2 py-1 rounded">{s.name}: {s.grade}</span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => approveAgent(room.id, req)} className="bg-[#00FF94]/10 text-[#00FF94] p-4 rounded-xl border border-[#00FF94]/20 hover:bg-[#00FF94] hover:text-black transition-all"><Check/></button>
                  </div>
                ))
              }
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}