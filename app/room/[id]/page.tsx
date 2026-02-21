"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { GodModeBackground } from '@/components/GodMode';
import { getRole, UserRole } from '@/utils/roles';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<any>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // PATH CHECK: Matches your manifesto
  const ROOMS_PATH = 'artifacts/deskmates-online/public/data/rooms';
  const roomId = params?.id as string;

  useEffect(() => {
    if (!roomId) return;

    const unsub = onSnapshot(doc(db, ROOMS_PATH, roomId), (snap) => {
      const data = snap.data();
      if (!data || data.status === 'closed') {
        router.push('/');
        return;
      }
      setRoom(data);
      if (auth.currentUser) {
        setRole(getRole(auth.currentUser, data));
      }
      setLoading(false);
    });

    return () => unsub();
  }, [roomId, router]);

  if (loading || !room) return (
    <div className="h-screen bg-black text-yellow-500 flex items-center justify-center font-mono uppercase font-black tracking-[1em] animate-pulse">
        Linking...
    </div>
  );

  const isPrivileged = role?.canManageRooms || auth.currentUser?.uid === room.moderatorId;
  
  // THE FIX: Selecting the specific URL and fixing the subdomain
  const rawUrl = isPrivileged ? (room.hostUrl || room.userUrl) : room.userUrl;
  const finalUrl = (rawUrl || "").replace('deskmates.whereby', 'deskmate.whereby');

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden relative font-mono">
      {role?.isFounder && <GodModeBackground />}
      
      <div className="z-20 flex justify-between items-end px-12 py-10 border-b-2 border-white/5 bg-black/95">
        <div className="pr-12">
          <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase">{room.title}</h1>
          <p className="text-[10px] text-yellow-600 font-black uppercase tracking-[0.5em] mt-2">
            Protocol: {isPrivileged ? "Command" : "Agent"} Link
          </p>
        </div>
        <button 
          onClick={() => router.push('/')} 
          className="bg-red-600 text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-all active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.2)]"
        >
          Disconnect
        </button>
      </div>

      <div className="flex-1 relative z-10 p-8">
        <div className="w-full h-full rounded-[4rem] overflow-hidden border-4 border-white/10 shadow-2xl bg-black">
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