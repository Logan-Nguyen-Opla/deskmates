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
        // Correctly assigning the UserRole object
        setRole(getRole(auth.currentUser, data));
      }
      setLoading(false);
    });

    return () => unsub();
  }, [roomId, router]);

  if (loading || !room) return (
    <div className="h-screen bg-black text-yellow-500 flex items-center justify-center font-mono uppercase tracking-widest">
        Establishing Secure Uplink...
    </div>
  );

  // FIXED: Proper declaration of isPrivileged
  const isPrivileged = role?.canManageRooms || auth.currentUser?.uid === room.moderatorId;
  
  // FIXED: Corrected subdomain to 'deskmate' and handled selection
  const rawUrl = isPrivileged ? room.hostUrl : room.userUrl;
  const finalUrl = (rawUrl || "").replace('deskmates.whereby', 'deskmate.whereby');

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden relative selection:bg-yellow-500 selection:text-black">
      {role?.isFounder && <GodModeBackground />}
      
      {/* HEADER SECTION */}
      <div className="z-20 flex justify-between items-end px-10 py-8 border-b-2 border-yellow-500/10 bg-black/90 backdrop-blur-md">
        <div className="pr-10">
          <h1 className="text-4xl font-black italic tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]">
            {room.title}
          </h1>
          <p className="text-[10px] text-yellow-600 font-black uppercase tracking-[0.4em] mt-1">
            {isPrivileged ? "Command Authority Active" : "Neural Link Synchronized"}
          </p>
        </div>
        <button 
          onClick={() => router.push('/')} 
          className="bg-red-500/10 border border-red-500/20 text-red-500 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95"
        >
          Disconnect
        </button>
      </div>

      {/* VIDEO ENGINE FRAME */}
      <div className="flex-1 relative z-10 p-6">
        <div className="w-full h-full rounded-[3rem] overflow-hidden border-2 border-white/5 shadow-2xl bg-black">
            <iframe
              src={`${finalUrl}?embed&displayNames=on&background=off&chat=on`}
              allow="camera; microphone; fullscreen; display-capture"
              className="w-full h-full border-none"
              title="Focus Session"
            />
        </div>
      </div>
    </div>
  );
}