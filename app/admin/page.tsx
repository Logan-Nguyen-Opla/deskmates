"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getRole, UserRole } from '@/utils/roles';
import { GodModeBackground, LoadingSequence } from '@/components/GodMode';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) return router.push('/login');

      const userDocSnap = await getDoc(doc(db, 'users', currentUser.uid));
      setRole(getRole(currentUser, userDocSnap.data()));
      setLoading(false);
    });

    return () => unsubAuth();
  }, [router]);

  if (loading) return <LoadingSequence />;

  if (!role?.canManageRooms) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center p-6 text-center font-mono">
        {role?.isFounder && <GodModeBackground />}
        <h1 className="text-yellow-500 font-black italic text-4xl mb-4 tracking-tighter uppercase">Access Restricted</h1>
        <p className="text-gray-500 uppercase text-[10px] tracking-[0.4em] font-bold">
            Founder Identity Verified. Admin Clearance Missing.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-10 font-mono relative">
      {role?.isFounder && <GodModeBackground />}
      <h1 className="text-yellow-500 font-black italic text-2xl tracking-tighter">Command Center</h1>
      <p className="text-gray-600 text-xs mt-2 uppercase tracking-widest">Logged in as {role?.rank}</p>
      {/* Add your room management UI here */}
    </div>
  );
}