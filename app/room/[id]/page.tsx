"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { GodModeBackground } from '@/components/GodMode';
import { getRole } from '@/utils/roles';

export default function RoomPage() {
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<any>(null);
  const [role, setRole] = useState<any>(null);
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    
    // FIX: Auth check inside Effect
    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const uDoc = await getDoc(doc(db, 'users', user.uid));
        setRole(getRole(user, uDoc.data()));
      }
    });

    const unsubRoom = onSnapshot(doc(db, 'rooms', id as string), (snap) => {
      if (snap.exists() && snap.data().status !== 'closed') {
        setRoom(snap.data());
        setLoading(false); // RELEASES SPINNER
      } else {
        router.push('/');
      }
    });

    return () => { unsubAuth(); unsubRoom(); };
  }, [id, router]);

  if (loading || !room) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center font-mono gap-6">
      <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(255,215,0,0.3)]" />
      <p className="text-yellow-500 font-black text-[10px] uppercase tracking-[1em] animate-pulse">Synchronizing Link...</p>
    </div>
  );

  const isPrivileged = role?.isFounder || auth.currentUser?.uid === room.moderatorId;
  const finalUrl = isPrivileged ? (room.hostUrl || room.userUrl) : room.userUrl;

  return (
    <div className="h-screen bg-black overflow-hidden relative">
      <GodModeBackground />
      <div className="h-full w-full relative z-10 p-4 md:p-8">
        <iframe 
          src={`${finalUrl?.replace('deskmates.whereby', 'deskmate.whereby')}?embed&displayNames=on&background=off&chat=on&people=off`}
          className="w-full h-full border-none rounded-[3rem] shadow-2xl bg-black"
          allow="camera; microphone; fullscreen; display-capture"
        />
      </div>
    </div>
  );
}