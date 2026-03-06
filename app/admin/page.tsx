"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { 
  collection, query, where, onSnapshot, doc, updateDoc, getDoc, addDoc, serverTimestamp 
} from 'firebase/firestore';
import { getRole, UserRole } from '@/utils/roles';
import { 
  GodModeBackground, OmegaHeader, SignalCard, LoadingSequence, ReactorCore 
} from '@/components/GodMode';
import BottomNav from '@/components/BottomNav';
import { Check, X, Users, Shield } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [myRooms, setMyRooms] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [view, setView] = useState<'rooms' | 'apps'>('rooms');
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');

  const ROOMS_PATH = 'artifacts/deskmates-online/public/data/rooms';

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) return router.push('/login');
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      const r = getRole(user, docSnap.data());
      setRole(r);
      if (!r.canManageRooms) return router.push('/profile');

      const unsubRooms = onSnapshot(query(collection(db, ROOMS_PATH), where("status", "==", "live")), (snap) => {
        setMyRooms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });

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

  const handleApprove = async (app: any) => {
    await updateDoc(doc(db, 'users', app.uid), { role: 'moderator' });
    await updateDoc(doc(db, 'applications', app.id), { status: 'approved' });
    alert("Operative Authorized.");
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await addDoc(collection(db, ROOMS_PATH), {
        title: title.toUpperCase(),
        moderator: "★ FOUNDER",
        status: 'live',
        createdAt: serverTimestamp(),
        description: "High-intensity focus session. Cameras recommended, microphones strictly off.",
        hostUrl: data.hostRoomUrl.replace('deskmates.whereby', 'deskmate.whereby'),
        userUrl: data.roomUrl.replace('deskmates.whereby', 'deskmate.whereby')
      });
      setTitle('');
    } catch (e: any) { alert("Signal Lost: " + e.message); }
  };

  if (loading) return <LoadingSequence />;

  return (
    <div className="min-h-screen bg-black text-white p-10 pb-32 relative overflow-hidden font-mono">
      <GodModeBackground />
      <OmegaHeader userName={role?.rank || "AGENT"} />
      
      <div className="flex justify-center gap-6 mb-12 relative z-20">
          <button onClick={() => setView('rooms')} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border ${view === 'rooms' ? 'bg-yellow-500 text-black border-yellow-500' : 'border-white/10 text-gray-500'}`}>War Room</button>
          {role?.isFounder && (
            <button onClick={() => setView('apps')} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border ${view === 'apps' ? 'bg-[#00FF94] text-black border-[#00FF94]' : 'border-white/10 text-gray-500'}`}>
                Clearance Requests {apps.length > 0 && <span className="ml-2 bg-red-600 text-white px-2 py-0.5 rounded-full text-[8px]">{apps.length}</span>}
            </button>
          )}
      </div>

      {view === 'rooms' ? (
        <>
            {role?.isFounder && (
                <ReactorCore>
                <form onSubmit={handleCreateRoom} className="flex gap-6">
                    <input value={title} onChange={e => setTitle(e.target.value)} className="flex-1 bg-black border-2 border-yellow-500/20 p-6 rounded-3xl text-yellow-500 font-black italic outline-none focus:border-yellow-500" placeholder="ENTER MISSION TITLE..." />
                    <button className="bg-yellow-500 text-black px-12 rounded-3xl font-black uppercase text-xs italic">Deploy</button>
                </form>
                </ReactorCore>
            )}
            <div className="max-w-5xl mx-auto space-y-6 relative z-10">
                {myRooms.map(room => <SignalCard key={room.id} room={room} onClose={(id) => updateDoc(doc(db, ROOMS_PATH, id), { status: 'closed' })} />)}
            </div>
        </>
      ) : (
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
            {apps.map(app => (
                <div key={app.id} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2rem] flex justify-between items-center">
                    <div>
                        <h4 className="text-xl font-black italic text-white uppercase">{app.displayName}</h4>
                        <p className="text-[10px] text-gray-500 mb-4">{app.school} • {app.contact}</p>
                        <p className="text-xs text-gray-400 italic">"{app.reason}"</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => handleApprove(app)} className="p-4 bg-[#00FF94]/10 text-[#00FF94] rounded-2xl hover:bg-[#00FF94] hover:text-black transition-all"><Check className="w-6 h-6"/></button>
                        <button onClick={() => updateDoc(doc(db, 'applications', app.id), {status: 'rejected'})} className="p-4 bg-red-600/10 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><X className="w-6 h-6"/></button>
                    </div>
                </div>
            ))}
        </div>
      )}
      <BottomNav />
    </div>
  );
}