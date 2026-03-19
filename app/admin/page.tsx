"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, getDoc, addDoc, serverTimestamp, arrayUnion, arrayRemove, Timestamp } from 'firebase/firestore';
import { getRole, UserRole } from '@/utils/roles';
import { ACADEMIC_SUBJECTS } from '@/utils/reputation';
import { GodModeBackground, OmegaHeader, LoadingSequence, ReactorCore } from '@/components/GodMode';
import BottomNav from '@/components/BottomNav';
import { Check, Trash2, Clock, Mic, Video, Loader2, UserPlus, BookOpen, Users } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [scheduledRooms, setScheduledRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);

  // FULL STATE RESTORED
  const [form, setForm] = useState({ 
    title: '', desc: '', dateOffset: '0', hour: '09', min: '00', 
    subject: ACADEMIC_SUBJECTS[0], reqMic: false, reqCamera: false,
    maxParticipants: '10'
  });

  const ROOMS_PATH = 'rooms';

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) return router.push('/login');
      setCurrentUser(user);
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      const r = getRole(user, docSnap.data());
      setRole(r);

      if (!r.canManageRooms) return router.push('/profile');
      
      const unsubRooms = onSnapshot(collection(db, ROOMS_PATH), (snap) => {
        const activeRooms = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter((room: any) => room.status !== 'closed')
          .filter((room: any) => r.isFounder || room.moderatorId === user.uid);
          
        setScheduledRooms(activeRooms);
        setLoading(false);
      });

      return () => unsubRooms();
    });
    return () => unsubAuth();
  }, [router]);

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDeploying || !currentUser) return;
    setIsDeploying(true);
    
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + parseInt(form.dateOffset));
      targetDate.setHours(parseInt(form.hour), parseInt(form.min), 0, 0);

      await addDoc(collection(db, ROOMS_PATH), {
        title: form.title.toUpperCase(),
        description: form.desc,
        subject: form.subject,         
        reqMic: form.reqMic,           
        reqCamera: form.reqCamera,
        maxParticipants: parseInt(form.maxParticipants),
        startTime: Timestamp.fromDate(targetDate),
        moderatorId: currentUser.uid,
        moderator: currentUser.displayName,
        status: 'scheduled',
        approvedAgents: [currentUser.uid],
        pendingRequests: [],
        createdAt: serverTimestamp()
      });
      alert("RESERVATION DEPLOYED.");
      // Reset logic
      setForm({ ...form, title: '', desc: '' });
    } catch (e) { alert("Deployment Failed."); }
    setIsDeploying(false);
  };

  const handleApproveAgent = async (roomId: string, agent: any) => {
    const roomRef = doc(db, ROOMS_PATH, roomId);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) return;
    const roomData = roomSnap.data();
    const newPending = (roomData.pendingRequests || []).filter((r: any) => r.uid !== agent.uid);
    await updateDoc(roomRef, { approvedAgents: arrayUnion(agent.uid), pendingRequests: newPending });
  };

  if (loading) return <LoadingSequence />;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 pb-32 relative overflow-x-hidden font-mono w-full max-w-full">
      <GodModeBackground />
      <OmegaHeader userName={role?.rank || "AGENT"} />

      <ReactorCore>
        <form onSubmit={handleCreateReservation} className="space-y-6">
          <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="MISSION TITLE" className="w-full bg-black border-2 border-white/5 p-5 rounded-2xl text-yellow-500 font-black outline-none focus:border-yellow-500" required />
          
          {/* RESTORED: DATE & TIME SELECTORS */}
          <div className="grid grid-cols-3 gap-2">
            <select value={form.dateOffset} onChange={e => setForm({...form, dateOffset: e.target.value})} className="bg-black border-2 border-white/5 p-4 rounded-xl text-[10px] font-black uppercase text-gray-400 focus:border-yellow-500 outline-none">
              <option value="0">Today</option><option value="1">Tomorrow</option><option value="2">Day After</option>
            </select>
            <select value={form.hour} onChange={e => setForm({...form, hour: e.target.value})} className="bg-black border-2 border-white/5 p-4 rounded-xl text-[10px] font-black uppercase text-gray-400 focus:border-yellow-500 outline-none">
              {Array.from({length: 24}).map((_, i) => <option key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}:00</option>)}
            </select>
            <select value={form.min} onChange={e => setForm({...form, min: e.target.value})} className="bg-black border-2 border-white/5 p-4 rounded-xl text-[10px] font-black uppercase text-gray-400 focus:border-yellow-500 outline-none">
              <option value="00">00</option><option value="15">15</option><option value="30">30</option><option value="45">45</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-gray-500 ml-2 flex items-center gap-1"><Users className="w-3 h-3"/> Agent Limit</label>
                <input type="number" value={form.maxParticipants} onChange={e => setForm({...form, maxParticipants: e.target.value})} className="w-full bg-black border-2 border-white/5 p-4 rounded-xl text-xs outline-none focus:border-yellow-500" />
             </div>
             <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-gray-500 ml-2 flex items-center gap-1"><BookOpen className="w-3 h-3"/> Subject</label>
                <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full bg-black border-2 border-white/5 p-4 rounded-xl text-[10px] font-black uppercase outline-none focus:border-yellow-500">
                  {ACADEMIC_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>
          </div>

          {/* HARDWARE CHECKBOXES */}
          <div className="flex gap-6 p-2 justify-center">
            <label className="flex items-center gap-3 text-[10px] font-black uppercase text-gray-400 cursor-pointer hover:text-white">
              <input type="checkbox" checked={form.reqMic} onChange={e => setForm({...form, reqMic: e.target.checked})} className="accent-yellow-500 w-4 h-4" /> 
              <Mic className="w-3 h-3" /> Mic Req
            </label>
            <label className="flex items-center gap-3 text-[10px] font-black uppercase text-gray-400 cursor-pointer hover:text-white">
              <input type="checkbox" checked={form.reqCamera} onChange={e => setForm({...form, reqCamera: e.target.checked})} className="accent-yellow-500 w-4 h-4" /> 
              <Video className="w-3 h-3" /> Cam Req
            </label>
          </div>

          <button disabled={isDeploying} type="submit" className="w-full bg-yellow-500 text-black py-6 rounded-3xl font-black uppercase text-xs tracking-widest italic shadow-2xl flex justify-center items-center gap-2 hover:scale-[1.01] transition-transform">
              {isDeploying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Deploy Reservation'}
          </button>
        </form>
      </ReactorCore>

      <div className="max-w-4xl mx-auto space-y-8 mt-12">
        <h2 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.6em] border-b border-white/5 pb-4 ml-2">Protocol Command</h2>
        {scheduledRooms.map(room => (
          <div key={room.id} className="bg-[#0a0a0a] border border-white/5 p-6 md:p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group hover:border-yellow-500/20 transition-all">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-black italic uppercase text-white">{room.title}</h3>
                <p className="text-[9px] text-yellow-700 font-bold uppercase mt-2">{room.approvedAgents?.length || 0} / {room.maxParticipants || '∞'} Agents Synchronized</p>
              </div>
              <button onClick={() => updateDoc(doc(db, ROOMS_PATH, room.id), {status: 'closed'})} className="p-4 bg-red-600/10 text-red-600 rounded-2xl border border-red-600/20 hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
            </div>

            <div className="bg-white/[0.02] p-6 rounded-[2.5rem] border border-dashed border-white/10">
              <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#00FF94]"/> Inbound Clearance Requests
              </h4>
              <div className="space-y-3">
                {(!room.pendingRequests || room.pendingRequests.length === 0) ? (
                  <p className="text-[9px] text-gray-700 italic uppercase font-black tracking-widest text-center py-6">No signals detected</p>
                ) : (
                  room.pendingRequests.map((req: any) => (
                    <div key={req.uid} className="flex justify-between items-center bg-white/5 p-5 rounded-3xl border border-white/5 group-hover:border-white/10 transition-all">
                      <div>
                        <p className="font-black text-white uppercase text-xs tracking-tight">{req.displayName}</p>
                        <p className="text-[8px] text-yellow-600 font-bold uppercase mt-1">Status: Ready • Rep: {req.academic?.reputation || 100}</p>
                      </div>
                      <button onClick={() => handleApproveAgent(room.id, req)} className="bg-[#00FF94] text-black px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Authorize</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}