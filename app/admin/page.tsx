"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, doc, getDoc, updateDoc, query, where } from 'firebase/firestore';
import { getRole, UserRole } from '@/utils/roles';
import { GodModeBackground, LoadingSequence } from '@/components/GodMode';
import { Check, X, ShieldAlert } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) return router.push('/login');
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const r = getRole(currentUser, userDoc.data());
      setRole(r);

      if (!r.canManageRooms) return router.push('/profile');

      // If Founder, listen for applications
      if (r.isFounder) {
        const q = query(collection(db, 'applications'), where('status', '==', 'pending'));
        const unsubApps = onSnapshot(q, (snap) => {
          setApps(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsubApps();
      }
      setLoading(false);
    });
    return () => unsubAuth();
  }, [router]);

  const handleDecision = async (id: string, userId: string, approved: boolean) => {
    try {
        await updateDoc(doc(db, 'applications', id), { status: approved ? 'approved' : 'rejected' });
        if (approved) {
            await updateDoc(doc(db, 'users', userId), { role: 'moderator' });
        }
    } catch (e) { alert("Action failed."); }
  };

  if (loading) return <LoadingSequence />;

  return (
    <div className="min-h-screen bg-black text-white p-10 font-mono relative">
      {role?.isFounder && <GodModeBackground />}
      <h1 className="text-yellow-500 font-black italic text-4xl tracking-tighter mb-10">COMMAND CENTER</h1>

      {role?.isFounder && (
        <section className="max-w-4xl mx-auto space-y-6 relative z-10">
          <h2 className="text-xs font-bold uppercase tracking-[0.5em] text-gray-500 mb-4">Pending Clearances</h2>
          {apps.length === 0 ? <p className="text-gray-700">No signals detected.</p> : apps.map(app => (
            <div key={app.id} className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl flex justify-between items-center">
              <div>
                <p className="font-bold text-yellow-500">{app.displayName}</p>
                <p className="text-xs text-gray-500 italic">"{app.reason}"</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleDecision(app.id, app.uid, true)} className="p-3 bg-green-500/10 text-green-500 rounded-full hover:bg-green-500 hover:text-black transition-all"><Check /></button>
                <button onClick={() => handleDecision(app.id, app.uid, false)} className="p-3 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all"><X /></button>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}