"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, onSnapshot } from 'firebase/firestore';
import { getRole, UserRole } from '@/utils/roles';
import { createDeskmatesRoom } from '@/services/roomService';
import { GodModeBackground } from '@/components/GodMode';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  // FIX: Explicitly tell TypeScript this state is a UserRole or null
  const [role, setRole] = useState<UserRole | null>(null);
  const [myRooms, setMyRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const ROOMS_PATH = 'artifacts/deskmates-online/public/data/rooms';

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }

      setUser(currentUser);
      const userDocSnap = await getDoc(doc(db, 'users', currentUser.uid));
      // This now matches the state type perfectly
      setRole(getRole(currentUser, userDocSnap.data()));

      const unsubRooms = onSnapshot(collection(db, ROOMS_PATH), (snapshot) => {
        const rooms = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() } as any))
          .filter(r => r.status === 'live' && r.moderatorId === currentUser.uid);
        setMyRooms(rooms);
        setLoading(false);
      });

      return () => unsubRooms();
    });

    return () => unsubAuth();
  }, [router]);

  if (loading) return <div className="h-screen bg-black" />;

  // Aesthetic check for the founder background
  const showAesthetic = role?.isFounder;
  // Security check for actual admin powers
  const hasPower = role?.canManageRooms;

  if (!hasPower) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        {showAesthetic && <GodModeBackground />}
        <h1 className="text-yellow-500 font-black italic text-4xl mb-4 tracking-tighter uppercase">Access Restricted</h1>
        <p className="text-gray-500 uppercase text-[10px] tracking-[0.4em] font-bold">
            Founder Identity Verified. Administrative Clearance Required.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-10 font-mono relative overflow-hidden">
      {showAesthetic && <GodModeBackground />}
      
      <div className="relative z-10">
          <h1 className="text-yellow-500 font-black italic text-2xl mb-2 tracking-tighter uppercase">Command Center</h1>
          <p className="text-[10px] text-gray-600 mb-10 uppercase font-black tracking-widest">Rank: {role?.rank}</p>
          
          {/* Your room creation form goes here */}
          <div className="border border-white/5 bg-white/5 p-10 rounded-[3rem] text-center italic text-gray-500 text-xs">
            Ready for room deployment.
          </div>
      </div>
    </div>
  );
}