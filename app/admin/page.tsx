"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import BottomNav from '@/components/BottomNav';
import { Check, X, Zap, Plus, Activity } from 'lucide-react';
import { getRole, UserRole } from '@/utils/roles';
import { GodModeBackground, OmegaHeader, SignalCard, LoadingSequence, ReactorCore } from '@/components/GodMode';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [myRooms, setMyRooms] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [view, setView] = useState<'rooms' | 'applications'>('rooms');
  
  // Creation State
  const [title, setTitle] = useState('');

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) return router.push('/login');
      setUser(currentUser);
      
      const userDocSnap = await getDoc(doc(db, 'users', currentUser.uid));
      const calculatedRole = getRole(currentUser, userDocSnap.data());
      setRole(calculatedRole);

      if (!calculatedRole.canManageRooms) return router.push('/profile');

      const ROOMS_PATH = 'artifacts/deskmates-online/public/data/rooms';
      const unsubRooms = onSnapshot(query(collection(db, ROOMS_PATH), where("status", "==", "live")), (snap) => {
        setMyRooms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });

      let unsubApps = () => {};
      if (calculatedRole.isFounder) {
          unsubApps = onSnapshot(query(collection(db, 'applications'), where('status', '==', 'pending')), (snap) => {
              setApplications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          });
      }
      return () => { unsubRooms(); unsubApps(); };
    });
    return () => unsubscribeAuth();
  }, [router]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    try {
      const ROOMS_PATH = 'artifacts/deskmates-online/public/data/rooms';
      await addDoc(collection(db, ROOMS_PATH), {
        title: title.toUpperCase(),
        moderator: role?.isFounder ? "★ FOUNDER" : (user.displayName || "Mod"),
        moderatorId: user.uid,
        status: 'live',
        participants: 0,
        createdAt: serverTimestamp(),
        hostUrl: "https://deskmates.whereby.com/lobby", // Standard fallback
        userUrl: "https://deskmates.whereby.com/lobby"
      });
      setTitle('');
      alert("SIGNAL DEPLOYED.");
    } catch (e) { alert("Deployment Failed."); }
  };

  if (loading) return <LoadingSequence />;

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 relative overflow-hidden font-mono">
      <GodModeBackground />
      <OmegaHeader userName={role?.isFounder ? "FOUNDER" : "OPERATIVE"} />

      {/* GOD-ONLY ROOM CREATION */}
      {role?.isFounder && (
          <ReactorCore>
              <form onSubmit={handleCreateRoom} className="flex gap-4">
                  <input 
                    value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="ENTER PROTOCOL NAME..."
                    className="flex-1 bg-black border border-yellow-500/30 p-4 rounded-xl text-yellow-500 outline-none focus:border-yellow-500"
                  />
                  <button className="bg-yellow-500 text-black px-8 rounded-xl font-black uppercase text-[10px] flex items-center gap-2 hover:scale-105 transition-transform">
                      <Plus className="w-4 h-4"/> Deploy
                  </button>
              </form>
          </ReactorCore>
      )}

      {/* TABS & LISTING */}
      <div className="flex justify-center gap-4 mb-8 relative z-10">
          <button onClick={() => setView('rooms')} className={`text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 border transition-all ${view === 'rooms' ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-black text-yellow-700 border-yellow-900/30'}`}>Active Signals</button>
          {role?.isFounder && (
            <button onClick={() => setView('applications')} className={`text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 border transition-all ${view === 'applications' ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-black text-yellow-700 border-yellow-900/30'}`}>Approvals ({applications.length})</button>
          )}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          {view === 'rooms' ? myRooms.map(room => <SignalCard key={room.id} room={room} onClose={() => updateDoc(doc(db, 'artifacts/deskmates-online/public/data/rooms', room.id), {status: 'closed'})}/>) : 
          applications.map(app => (
            <div key={app.id} className="bg-[#050505] border border-yellow-900/30 p-6 rounded-2xl flex justify-between items-center">
                <div><p className="text-yellow-500 font-bold">{app.displayName}</p><p className="text-gray-500 text-xs italic">"{app.reason}"</p></div>
                <div className="flex gap-2">
                    <button onClick={() => {updateDoc(doc(db, 'users', app.uid), {role: 'moderator'}); updateDoc(doc(db, 'applications', app.id), {status: 'approved'});}} className="p-3 bg-green-900/10 text-green-500 border border-green-900/50 rounded"><Check /></button>
                    <button onClick={() => updateDoc(doc(db, 'applications', app.id), {status: 'rejected'})} className="p-3 bg-red-900/10 text-red-500 border border-red-500/50 rounded"><X /></button>
                </div>
            </div>
          ))}
      </div>
      <BottomNav />
    </div>
  );
}