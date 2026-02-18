"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, onSnapshot } from 'firebase/firestore';
import { getRole, UserRole } from '@/utils/roles';
import { GodModeBackground } from '@/components/GodMode';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // FIX: Explicitly define the type for role
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) return router.push('/login');

      const userDocSnap = await getDoc(doc(db, 'users', currentUser.uid));
      // Safely assign the UserRole object
      setRole(getRole(currentUser, userDocSnap.data()));
      setLoading(false);
    });

    return () => unsubAuth();
  }, [router]);

  if (loading) return <div className="h-screen bg-black" />;

  // Aesthetic for you/Logan, but power check for the rest
  const isFounder = role?.isFounder;
  const canManage = role?.canManageRooms;

  if (!canManage) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        {isFounder && <GodModeBackground />}
        <h1 className="text-yellow-500 font-black italic text-4xl mb-4 tracking-tighter uppercase">Access Restricted</h1>
        <p className="text-gray-500 uppercase text-[10px] tracking-[0.4em] font-bold">
            Founder Identity Verified. Admin Clearance Missing.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-10 font-mono relative">
      {isFounder && <GodModeBackground />}
      <h1 className="text-yellow-500 font-black italic text-2xl tracking-tighter">Command Center</h1>
      {/* ... rest of your admin UI ... */}
    </div>
  );
}