"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, getDoc, addDoc, serverTimestamp, arrayUnion, Timestamp } from 'firebase/firestore';
import { getRole, UserRole } from '@/utils/roles';
import { ACADEMIC_SUBJECTS } from '@/utils/reputation';
import { GodModeBackground, OmegaHeader, LoadingSequence, ReactorCore } from '@/components/GodMode';
import BottomNav from '@/components/BottomNav';
import { Check, X, Users, Trash2, Clock, Mic, Video, Loader2 } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [scheduledRooms, setScheduledRooms] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [view, setView] = useState<'rooms' | 'apps'>('rooms');

  const [form, setForm] = useState({ title: '', desc: '', dateOffset: '0', hour: '09', min: '00', subject: ACADEMIC_SUBJECTS[0], reqMic: false, reqCamera: false });
  const ROOMS_PATH = 'rooms';

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) return router.push('/login');
      setCurrentUser(user);
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      const r = getRole(user, docSnap.data());
      setRole(r);

      // RESTORED: Kick out normal users. Only Admins/Founders allowed.
      if (!r.canManageRooms) return router.push('/profile');
      
      const unsubRooms = onSnapshot(collection(db, ROOMS_PATH), (snap) => {
        const activeRooms = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter((room: any) => room.status !== 'closed')
          .filter((room: any) => r.isFounder || room.moderatorId === user.uid);
          
        setScheduledRooms(activeRooms);
        setLoading(false);
      });

      let unsubApps = () => {};
      if (r.isFounder) {
        unsubApps = onSnapshot(collection(db, 'applications'), (snap) => {
            const pendingApps = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter((a: any) => a.status === 'pending');
            setApps(pendingApps);
        });
      }
      return () => { unsubRooms(); unsubApps(); };
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

      if (targetDate.getTime() <= new Date().getTime()) {
        alert("ERROR: Protocol cannot be scheduled in the past.");
        setIsDeploying(false);
        return;
      }

      await addDoc(collection(db, ROOMS_PATH), {
        title: form.title.toUpperCase(),
        description: form.desc,
        subject: form.subject,         
        reqMic: form.reqMic,           
        reqCamera: form.reqCamera,     
        startTime: Timestamp.fromDate(targetDate),
        moderatorId: currentUser.uid,
        moderator: currentUser.displayName,
        status: 'scheduled',
        approvedAgents: [currentUser.uid],
        pendingRequests: [],
        createdAt: serverTimestamp()
      });
      alert("RESERVATION DEPLOYED.");
      setForm({ ...form, title: '', desc: '' });
    } catch (e) { alert("Deployment Failed."); }
    setIsDeploying(false);
  };

  // THE CRITICAL FIX: Bypass `arrayRemove` to guarantee the approval works
  const handleApproveAgent = async (roomId: string, agent: any) => {
    try {
      const roomRef = doc(db, ROOMS_PATH, roomId);
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists()) return;
      
      const roomData = roomSnap.data();
      // Manually filter out the approved user from the pending array
      const newPending = (roomData.pendingRequests || []).filter((r: any) => r.uid !== agent.uid);
      
      await updateDoc(roomRef, { 
        approvedAgents: arrayUnion(agent.uid), 
        pendingRequests: newPending 
      });
    } catch (e) {
      alert("Approval Failed.");
    }
  };

  if (loading) return <LoadingSequence />;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 pb-32 relative overflow-hidden font-mono">
      <GodModeBackground />
      <OmegaHeader userName={role?.rank || "AGENT"} />

      <div className="flex gap-4 mb-10 relative z-20 max-w-xl mx-auto">
        <button onClick={() => setView('rooms')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase border transition-all ${view === 'rooms' ? 'bg-yellow-500 text-black border-yellow-500' : 'border-white/10 text-gray-600'}`}>My Protocols</button>
        {role?.isFounder && <button onClick={() => setView('apps')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase border transition-all ${view === 'apps' ? 'bg-[#00FF94] text-black border-[#00FF94]' : 'border-white/10 text-gray-600'}`}>Global Clearance {apps.length > 0 && <span className="ml-2 bg-red-600 text-white px-2 py-0.5 rounded-full text-[8px]">{apps.length}</span>}</button>}
      </div>

      {view === 'rooms' ? (
        <>
          <ReactorCore>
            <form onSubmit={handleCreateReservation} className="space-y-4">
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="SESSION TITLE (e.g. LATE NIGHT FOCUS)" className="w-full bg-black border-2 border-white/5 p-5 rounded-2xl text-yellow-500 font-black outline-none focus:border-yellow-500" required />
              <textarea value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} placeholder="Session Description..." className="w-full bg-black border-2 border-white/5 p-5 rounded-2xl text-xs outline-none focus:border-yellow-500 h-24" />
              
              <div className="grid grid-cols-3 gap-2">
                <select value={form.dateOffset} onChange={e => setForm({...form, dateOffset: e.target.value})} className="bg-black border-2 border-white/5 p-4 rounded-xl text-[10px] font-black uppercase text-gray-400 focus:border-yellow-500 outline-none"><option value="0">Today</option><option value="1">Tomorrow</option><option value="2">Day After</option></select>
                <select value={form.hour} onChange={e => setForm({...form, hour: e.target.value})} className="bg-black border-2 border-white/5 p-4 rounded-xl text-[10px] font-black uppercase text-gray-400 focus:border-yellow-500 outline-none">{Array.from({length: 24}).map((_, i) => <option key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}:00</option>)}</select>
                <select value={form.min} onChange={e => setForm({...form, min: e.target.value})} className="bg-black border-2 border-white/5 p-4 rounded-xl text-[10px] font-black uppercase text-gray-400 focus:border-yellow-500 outline-none"><option value="00">00</option><option value="15">15</option><option value="30">30</option><option value="45">45</option></select>
              </div>

              <div className="flex gap-4 p-2">
                <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="flex-1 bg-black border-2 border-white/5 p-4 rounded-xl text-[10px] font-black uppercase focus:border-yellow-500 outline-none">{ACADEMIC_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                <div className="flex flex-col justify-center gap-2 px-4">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 cursor-pointer hover:text-white"><input type="checkbox" checked={form.reqMic} onChange={e => setForm({...form, reqMic: e.target.checked})} className="accent-yellow-500 w-4 h-4" /> <Mic className="w-3 h-3" /> Mic Req</label>
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 cursor-pointer hover:text-white"><input type="checkbox" checked={form.reqCamera} onChange={e => setForm({...form, reqCamera: e.target.checked})} className="accent-yellow-500 w-4 h-4" /> <Video className="w-3 h-3" /> Cam Req</label>
                </div>
              </div>

              <button disabled={isDeploying} type="submit" className="w-full bg-yellow-500 text-black py-6 rounded-3xl font-black uppercase text-xs tracking-widest italic hover:scale-[1.01] transition-transform shadow-2xl shadow-yellow-500/10 flex justify-center items-center gap-2">
                  {isDeploying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Deploy Reservation'}
              </button>
            </form>
          </ReactorCore>

          <div className="max-w-4xl mx-auto space-y-6 mt-12">
            {scheduledRooms.map(room => (
              <div key={room.id} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[3rem] group hover:border-yellow-500/20 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black italic uppercase text-white">{room.title}</h3>
                    <p className="text-[10px] text-gray-600 font-bold uppercase mt-1 flex items-center gap-2"><Clock className="w-3 h-3" /> {room.startTime?.toDate ? room.startTime.toDate().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : 'No Time Set'}</p>
                  </div>
                  <button onClick={() => updateDoc(doc(db, ROOMS_PATH, room.id), {status: 'closed'})} className="p-4 bg-red-600/10 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mb-4 flex items-center gap-2"><Users className="w-3 h-3"/> Pending Clearances</h4>
                  {(!room.pendingRequests || room.pendingRequests.length === 0) ? <p className="text-[10px] text-gray-700 italic">No incoming transmissions...</p> : 
                    room.pendingRequests?.map((req: any) => (
                      <div key={req.uid} className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/5 group hover:border-[#00FF94]/30 transition-all">
                        <div><p className="font-black text-white uppercase text-sm">{req.displayName}</p></div>
                        <button onClick={() => handleApproveAgent(room.id, req)} className="bg-[#00FF94]/10 text-[#00FF94] p-4 rounded-xl border border-[#00FF94]/20 hover:bg-[#00FF94] hover:text-black transition-all"><Check/></button>
                      </div>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          {apps.map(app => (
            <div key={app.id} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] flex justify-between items-center group hover:border-[#00FF94]/20 transition-all">
              <div><p className="font-black uppercase text-lg italic text-white group-hover:text-[#00FF94] transition-colors">{app.displayName}</p><p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">{app.school}</p></div>
              <button onClick={() => { updateDoc(doc(db, 'users', app.uid), { role: 'moderator' }); updateDoc(doc(db, 'applications', app.id), { status: 'approved' }); }} className="p-5 bg-[#00FF94]/10 text-[#00FF94] rounded-2xl border border-[#00FF94]/20 hover:bg-[#00FF94] hover:text-black transition-all"><Check /></button>
            </div>
          ))}
        </div>
      )}
      <BottomNav />
    </div>
  );
}