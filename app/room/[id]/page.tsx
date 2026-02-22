"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { GodModeBackground } from '@/components/GodMode';
import { getRole, UserRole } from '@/utils/roles';

export default function RoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<any>(null);
  const [role, setRole] = useState<UserRole | null>(null); // Corrected to object type
  const [loading, setLoading] = useState(true);

  const ROOMS_PATH = 'artifacts/deskmates-online/public/data/rooms';

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, ROOMS_PATH, id as string), (snap) => {
      const data = snap.data();
      if (!data || data.status === 'closed') {
        router.push('/');
        return;
      }
      setRoom(data);
      if (auth.currentUser) setRole(getRole(auth.currentUser, data));
      setLoading(false);
    });
    return () => unsub();
  }, [id, router]);

  if (loading || !room) return <div className="h-screen bg-black" />;

  // FIXED: Accessing the boolean from the role object
  const isPrivileged = role?.canManageRooms || auth.currentUser?.uid === room.moderatorId;
  const rawUrl = isPrivileged ? (room.hostUrl || room.userUrl) : room.userUrl;
  
  // FIXED: Subdomain enforcement
  const finalUrl = (rawUrl || "").replace('deskmates.whereby', 'deskmate.whereby');

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden relative font-sans">
      {role?.isFounder && <GodModeBackground />}
      
      <div className="z-20 flex justify-between items-end px-12 py-12 border-b-[10px] border-yellow-500 bg-black/95">
        <div className="pr-16">
          <h1 className="text-7xl font-black italic tracking-tighter text-white uppercase leading-none pr-10">{room.title}</h1>
          <p className="text-[10px] text-yellow-600 font-black uppercase tracking-[0.6em] mt-3 italic">Uplink Stable</p>
        </div>
        <button onClick={() => router.push('/')} className="bg-red-600 text-white px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest">Disconnect</button>
      </div>

      <div className="flex-1 relative z-10 p-8">
        <div className="w-full h-full rounded-[4rem] overflow-hidden border-8 border-white/5 bg-black">
            <iframe src={`${finalUrl}?embed&displayNames=on&background=off&chat=on`} allow="camera; microphone; fullscreen; display-capture" className="w-full h-full border-none" />
        </div>
      </div>
    </div>
  );
}