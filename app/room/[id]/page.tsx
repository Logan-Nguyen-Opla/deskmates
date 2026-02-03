"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { GodModeBackground } from '@/components/GodMode';
import { getRole } from '@/utils/roles';

export default function RoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<any>(null);
  const [role, setRole] = useState('agent');

  useEffect(() => {
    const roomId = Array.isArray(id) ? id[0] : id;
    if (!roomId) return;

    // Listen to Firestore for the room data
    const unsub = onSnapshot(doc(db, 'rooms', roomId), (snap) => {
      const data = snap.data();
      if (!data || data.status === 'closed') {
        router.push('/');
        return;
      }
      setRoom(data);
      if (auth.currentUser) setRole(getRole(auth.currentUser, data));
    });

    return () => unsub();
  }, [id, router]);

  if (!room) return <div className="h-screen bg-black flex items-center justify-center text-yellow-500 font-mono">LOADING SECURE CHANNEL...</div>;

  // BYPASS LOGIC: If you are the owner, Moderator, or Founder, use hostUrl
  const isPrivileged = role === 'founder' || role === 'moderator' || auth.currentUser?.uid === room.moderatorId;
  const finalUrl = isPrivileged ? room.hostUrl : room.userUrl;

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden">
      {role === 'founder' && <GodModeBackground />}
      
      <div className="z-20 flex justify-between items-center px-6 py-4 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <h1 className="text-white font-black italic tracking-tighter text-lg">{room.title}</h1>
        <button onClick={() => router.push('/')} className="bg-red-500/20 text-red-500 border border-red-500/50 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest">Exit</button>
      </div>

      {/* THE JITSI KILLER: Pure Whereby Iframe */}
      <div className="flex-1 relative z-10">
        <iframe
          src={`${finalUrl}?embed&displayNames=on&background=off&chat=on`}
          allow="camera; microphone; fullscreen; display-capture"
          className="w-full h-full border-none"
        />
      </div>

      {isPrivileged && (
        <div className="absolute bottom-10 left-10 z-30">
          <button 
            onClick={async () => {
              if (confirm("NUKE SESSION?")) {
                await updateDoc(doc(db, 'rooms', id as string), { status: 'closed' });
              }
            }}
            className="bg-red-600 text-white font-black px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest shadow-2xl"
          >
            Terminate Room
          </button>
        </div>
      )}
    </div>
  );
}