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
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const ROOMS_PATH = 'artifacts/deskmates-online/public/data/rooms';
    
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

  const isPrivileged = role?.canManageRooms || auth.currentUser?.uid === room.moderatorId;
  const rawUrl = isPrivileged ? room.hostUrl : room.userUrl;
  
  // FINAL SUBDOMAIN ENFORCEMENT
  const finalUrl = rawUrl?.replace('deskmates.whereby', 'deskmate.whereby') || "";

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden relative font-mono">
      {role?.isFounder && <GodModeBackground />}
      
      <div className="z-20 flex justify-between items-end px-12 py-12 border-b-4 border-white/5 bg-black/95">
        <div className="pr-12">
          <h1 className="text-6xl font-black italic tracking-tighter text-white uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {room.title}
          </h1>
          <p className="text-[10px] text-yellow-600 font-black uppercase tracking-[0.6em] mt-3">Link Established • {isPrivileged ? "GOD" : "AGENT"} LEVEL</p>
        </div>
        <button onClick={() => router.push('/')} className="bg-red-600 text-white px-12 py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform active:scale-95">Disconnect</button>
      </div>

      <div className="flex-1 relative z-10 p-10">
        <div className="w-full h-full rounded-[5rem] overflow-hidden border-8 border-white/5 shadow-[0_0_100px_rgba(0,0,0,1)]">
            <iframe
              src={`${finalUrl}?embed&displayNames=on&background=off&chat=on&people=off`}
              allow="camera; microphone; fullscreen; display-capture"
              className="w-full h-full border-none"
            />
        </div>
      </div>
    </div>
  );
}