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

export default function AdminPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [myRooms, setMyRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');

  // THE PATH FROM YOUR SCREENSHOT
  const ROOMS_PATH = 'artifacts/deskmates-online/public/data/rooms';

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) return router.push('/login');
      
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      const r = getRole(user, docSnap.data());
      setRole(r);

      if (!r.canManageRooms) return router.push('/profile');

      // Fetch from the deep artifacts path
      const unsubRooms = onSnapshot(query(collection(db, ROOMS_PATH), where("status", "==", "live")), (snap) => {
        setMyRooms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });

      return () => unsubRooms();
    });
    return () => unsubAuth();
  }, [router]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      
      const wherebyData = await res.json();
      if (!res.ok) throw new Error(wherebyData.error);

      // Save to Firestore using the deep artifacts path
      await addDoc(collection(db, ROOMS_PATH), {
        title: title.toUpperCase(),
        moderator: "★ FOUNDER",
        status: 'live',
        createdAt: serverTimestamp(),
        hostUrl: wherebyData.hostRoomUrl.replace('deskmates.whereby', 'deskmate.whereby'),
        userUrl: wherebyData.roomUrl.replace('deskmates.whereby', 'deskmate.whereby')
      });
      
      setTitle('');
      alert("Protocol Synchronized: Room Live.");
    } catch (err: any) {
      alert("Signal Lost: " + err.message);
    }
  };

  if (loading) return <LoadingSequence />;

  return (
    <div className="min-h-screen bg-black text-white p-10 pb-32 relative overflow-hidden font-mono">
      <GodModeBackground />
      <OmegaHeader userName={role?.rank || "AGENT"} />
      
      {role?.isFounder && (
        <ReactorCore>
          <form onSubmit={handleCreateRoom} className="flex gap-6">
            <input 
              value={title} onChange={e => setTitle(e.target.value)}
              className="flex-1 bg-black border-2 border-yellow-500/20 p-6 rounded-3xl text-yellow-500 font-black italic outline-none focus:border-yellow-500"
              placeholder="ENTER MISSION TITLE..."
            />
            <button className="bg-yellow-500 text-black px-12 rounded-3xl font-black uppercase text-xs italic hover:scale-105 transition-transform">Deploy</button>
          </form>
        </ReactorCore>
      )}

      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        {myRooms.map(room => (
          <SignalCard key={room.id} room={room} onClose={(id) => updateDoc(doc(db, ROOMS_PATH, id), { status: 'closed' })} />
        ))}
      </div>
      <BottomNav />
    </div>
  );
}