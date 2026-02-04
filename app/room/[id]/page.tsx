"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase'; // Corrected path
import { GodModeBackground } from '@/components/GodMode';
import { getRole } from '@/utils/roles';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<any>(null);
  const [role, setRole] = useState('agent');
  const [loading, setLoading] = useState(true);

  // Path from your Firestore Schema [cite: 5, 7]
  const ROOMS_PATH = 'artifacts/deskmates-online/public/data/rooms';
  
  // TypeScript safe access to the URL ID
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
    <div className="h-screen bg-black text-yellow-500 flex items-center justify-center font-mono uppercase">
        Establishing Secure Uplink...
    </div>
  );

  // Privileged check: hostUrl for you, userUrl for the press/public
  const isPrivileged = role === 'founder' || role === 'moderator' || auth.currentUser?.uid === room.moderatorId;
  const finalUrl = isPrivileged ? room.hostUrl : room.userUrl;

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden relative">
      {role === 'founder' && <GodModeBackground />}
      
      <div className="z-20 flex justify-between items-center px-6 py-4 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <h1 className="text-white font-black italic text-lg">{room.title}</h1>
        <button onClick={() => router.push('/')} className="bg-red-500/20 text-red-500 border border-red-500/50 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest">Disconnect</button>
      </div>

      <div className="flex-1 relative z-10">
        <iframe
          src={`${finalUrl}?embed&displayNames=on&background=off&chat=on`}
          allow="camera; microphone; fullscreen; display-capture"
          className="w-full h-full border-none"
        />
      </div>
    </div>
  );
}