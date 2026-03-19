"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, getDoc, addDoc, serverTimestamp, arrayUnion, Timestamp } from 'firebase/firestore';
import { getRole, UserRole } from '@/utils/roles';
import { ACADEMIC_SUBJECTS } from '@/utils/reputation';
import { GodModeBackground, OmegaHeader, LoadingSequence, ReactorCore } from '@/components/GodMode';
import BottomNav from '@/components/BottomNav';
import { Check, X, Users, Trash2, Clock, Mic, Video, Loader2, UserPlus } from 'lucide-react'; // Added UserPlus

export default function AdminPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [scheduledRooms, setScheduledRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);

  // UPDATED: Added maxParticipants
  const [form, setForm] = useState({ 
    title: '', desc: '', dateOffset: '0', hour: '09', min: '00', 
    subject: ACADEMIC_SUBJECTS[0], reqMic: false, reqCamera: false,
    maxParticipants: '10' // Default limit
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
        maxParticipants: parseInt(form.maxParticipants), // NEW: Limit saved
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

  const handleApproveAgent = async (roomId: string, agent: any) => {
    const roomRef = doc(db, ROOMS_PATH, roomId);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) return;
    
    const roomData = roomSnap.data();
    const newPending = (roomData.pendingRequests || []).filter((r: any) => r.uid !== agent.uid);
    
    await updateDoc(roomRef, { 
      approvedAgents: arrayUnion(agent.uid), 
      pendingRequests: newPending 
    });
  };

  if (loading) return <LoadingSequence />;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 pb-32 relative overflow-hidden font-mono">
      <GodModeBackground />
      <OmegaHeader userName={role?.rank || "AGENT"} />

      <ReactorCore>
        <form onSubmit={handleCreateReservation} className="space-y-4">
          <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="SESSION TITLE" className="w-full bg-black border-2 border-white/5 p-5 rounded-2xl text-yellow-500 font-black outline-none focus:border-yellow-500" required />
          
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-gray-500 ml-2">Limit Agents</label>
                <input type="number" value={form.maxParticipants} onChange={e => setForm({...form, maxParticipants: e.target.value})} className="w-full bg-black border-2 border-white/5 p-4 rounded-xl text-xs outline-none focus:border-yellow-500" />
             </div>
             <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-gray-500 ml-2">Subject</label>
                <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full bg-black border-2 border-white/5 p-4 rounded-xl text-[10px] font-black uppercase outline-none">
                  {ACADEMIC_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>
          </div>

          <button disabled={isDeploying} type="submit" className="w-full bg-yellow-500 text-black py-6 rounded-3xl font-black uppercase text-xs tracking-widest italic shadow-2xl flex justify-center items-center gap-2">
              {isDeploying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Deploy Reservation'}
          </button>
        </form>
      </ReactorCore>

      {/* FIXED: AGGRESSIVE APPROVAL UI */}
      <div className="max-w-4xl mx-auto space-y-6 mt-12">
        <h2 className="text-sm font-black text-yellow-500 uppercase tracking-[0.5em] mb-4 border-b border-white/5 pb-4">Protocol Management</h2>
        {scheduledRooms.map(room => (
          <div key={room.id} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[3rem] shadow-2xl">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-2xl font-black italic uppercase text-white">{room.title}</h3>
                <p className="text-[9px] text-yellow-700 font-bold uppercase mt-2">{room.approvedAgents?.length || 0} / {room.maxParticipants || '∞'} Agents Authorized</p>
              </div>
              <button onClick={() => updateDoc(doc(db, ROOMS_PATH, room.id), {status: 'closed'})} className="p-4 bg-red-600/10 text-red-600 rounded-2xl hover:bg-red-600 transition-all"><Trash2 className="w-4 h-4" /></button>
            </div>

            {/* THE CLEARANCE AREA: This is where you allow users */}
            <div className="bg-white/2 p-6 rounded-[2rem] border border-dashed border-white/10">
              <h4 className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#00FF94]"/> Inbound Clearances ({room.pendingRequests?.length || 0})
              </h4>
              <div className="space-y-3">
                {(!room.pendingRequests || room.pendingRequests.length === 0) ? (
                  <p className="text-[9px] text-gray-700 italic uppercase font-bold text-center py-4">No pending signals...</p>
                ) : (
                  room.pendingRequests.map((req: any) => (
                    <div key={req.uid} className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-[#00FF94]/30 transition-all">
                      <div>
                        <p className="font-black text-white uppercase text-xs">{req.displayName}</p>
                        <p className="text-[8px] text-yellow-600 font-bold uppercase mt-1">Rep: {req.academic?.reputation || 100}</p>
                      </div>
                      <button onClick={() => handleApproveAgent(room.id, req)} className="bg-[#00FF94] text-black p-3 rounded-xl font-black text-[10px] uppercase hover:scale-105 transition-all">Authorize</button>
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