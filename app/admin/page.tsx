"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { createDeskmatesRoom } from '@/services/roomService';
import BottomNav from '@/components/BottomNav';
import { Zap } from 'lucide-react';
import { getRole } from '@/utils/roles';
import { GodModeBackground, OmegaHeader, ReactorCore, SignalCard, LoadingSequence } from '@/components/GodMode';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState('agent');
  const [loading, setLoading] = useState(true);
  const [myRooms, setMyRooms] = useState<any[]>([]);
  const [title, setTitle] = useState('');

  const ROOMS_PATH = 'artifacts/deskmates-online/public/data/rooms';

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) return router.push('/login');
      setUser(currentUser);
      const userDocSnap = await getDoc(doc(db, 'users', currentUser.uid));
      setRole(getRole(currentUser, userDocSnap.data()));

      const unsubRooms = onSnapshot(collection(db, ROOMS_PATH), (snapshot) => {
        setMyRooms(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(r => r.status === 'live'));
        setLoading(false);
      });
      return () => unsubRooms();
    });
    return () => unsubscribeAuth();
  }, [router]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await createDeskmatesRoom(title, user); // Calls Whereby API
      setTitle('');
      alert("Deployment Successful.");
    } catch (error) {
      alert("Deployment Error.");
    }
  };

  const handleCloseRoom = async (roomId: string) => {
    if (!confirm("Terminate Room?")) return;
    await updateDoc(doc(db, ROOMS_PATH, roomId), { status: 'closed' });
  };

  if (loading) return <LoadingSequence />;

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 relative overflow-hidden font-mono">
      <GodModeBackground />
      <OmegaHeader userName="Founder" />
      <ReactorCore>
          <form onSubmit={handleCreateRoom} className="space-y-8">
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black border border-yellow-900/30 p-5 rounded-lg text-yellow-100" placeholder="SESSION TITLE" required />
              <button type="submit" className="w-full bg-yellow-500 text-black font-black py-6 rounded-lg flex justify-center gap-2"><Zap /> DEPLOY SIGNAL</button>
          </form>
      </ReactorCore>
      <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          {myRooms.map(room => (
              <SignalCard key={room.id} room={room} onClose={handleCloseRoom} />
          ))}
      </div>
      <BottomNav />
    </div>
  );
}