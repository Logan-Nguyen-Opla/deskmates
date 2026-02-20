"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  collection, query, where, onSnapshot, doc, updateDoc, getDoc 
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import BottomNav from '@/components/BottomNav';
import { Check, X } from 'lucide-react';
import { getRole, UserRole } from '@/utils/roles';

// UI Components from your GodMode library
import { 
  GodModeBackground, 
  OmegaHeader, 
  SignalCard, 
  LoadingSequence 
} from '@/components/GodMode';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [myRooms, setMyRooms] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [view, setView] = useState<'rooms' | 'applications'>('rooms');

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      
      setUser(currentUser);
      
      // 1. IDENTITY SCAN: Bypass the database if it's the Founder email
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      const calculatedRole = getRole(currentUser, userDocSnap.data());
      setRole(calculatedRole);

      // 2. SECURITY CLEARANCE: If not a Mod/Founder, kick them out
      if (!calculatedRole.canManageRooms) {
        alert("Access Denied: Clearance Level Too Low.");
        router.push('/profile');
        return;
      }

      // 3. DATA UPLINK: Fetching live signals from the manifesto path
      const ROOMS_PATH = 'artifacts/deskmates-online/public/data/rooms';
      const roomQuery = query(collection(db, ROOMS_PATH), where("status", "==", "live"));

      const unsubRooms = onSnapshot(roomQuery, (snapshot) => {
        setMyRooms(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false); // Stop the "Syncing" loop here
      });

      // 4. APPROVALS UPLINK: Only for the Founder
      let unsubApps = () => {};
      if (calculatedRole.isFounder) {
          const appQuery = query(collection(db, 'applications'), where('status', '==', 'pending'));
          unsubApps = onSnapshot(appQuery, (snap) => {
              setApplications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          });
      }

      return () => { unsubRooms(); unsubApps(); };
    });

    return () => unsubscribeAuth();
  }, [router]);

  // SURGICAL FIX: Separating document updates to avoid TS2554
  const handleApprove = async (appId: string, applicantId: string) => {
      try {
        await updateDoc(doc(db, 'users', applicantId), { role: 'moderator' });
        await updateDoc(doc(db, 'applications', appId), { status: 'approved' });
        alert("Agent Promoted.");
      } catch (e) { alert("Promotion Error."); }
  };

  const handleReject = async (appId: string) => {
      try {
        await updateDoc(doc(db, 'applications', appId), { status: 'rejected' });
      } catch (e) { alert("Rejection Error."); }
  };

  const handleCloseRoom = async (roomId: string) => {
    try {
      const ROOMS_PATH = 'artifacts/deskmates-online/public/data/rooms';
      await updateDoc(doc(db, ROOMS_PATH, roomId), { status: 'closed' });
    } catch (e) { console.error("Shutdown Error:", e); }
  };

  if (loading) return <LoadingSequence />;

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 relative overflow-hidden font-mono">
      <GodModeBackground />
      <OmegaHeader userName={user?.displayName || "Agent"} />

      {/* TABS */}
      <div className="flex justify-center gap-4 mb-8 relative z-10">
          <button 
            onClick={() => setView('rooms')} 
            className={`text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 border transition-all ${view === 'rooms' ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-black text-yellow-700 border-yellow-900/30'}`}
          >
            War Room
          </button>
          {role?.isFounder && (
            <button 
                onClick={() => setView('applications')} 
                className={`text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 border transition-all ${view === 'applications' ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-black text-yellow-700 border-yellow-900/30'}`}
            >
                Approvals ({applications.length})
            </button>
          )}
      </div>

      {/* CONTENT */}
      <div className="relative z-10 max-w-4xl mx-auto">
        {view === 'rooms' ? (
            <div className="space-y-4">
                {myRooms.length === 0 ? (
                    <div className="text-center py-20 opacity-20 uppercase font-black tracking-widest text-yellow-900 italic">No active signals</div>
                ) : (
                    myRooms.map(room => (
                        <SignalCard key={room.id} room={room} onClose={handleCloseRoom} />
                    ))
                )}
            </div>
        ) : (
            <div className="space-y-4">
                {applications.map(app => (
                    <div key={app.id} className="bg-[#050505] border border-yellow-900/30 p-6 rounded-2xl flex justify-between items-center group">
                        <div>
                            <div className="text-yellow-500 font-bold uppercase tracking-tighter text-lg">{app.displayName}</div>
                            <div className="text-gray-500 text-xs mt-1 italic">"{app.reason}"</div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleApprove(app.id, app.uid)} className="p-4 bg-green-900/10 text-green-500 border border-green-900/50 rounded-xl hover:bg-green-500 hover:text-black transition-all"><Check className="w-5 h-5"/></button>
                            <button onClick={() => handleReject(app.id)} className="p-4 bg-red-900/10 text-red-500 border border-red-900/50 rounded-xl hover:bg-red-500 hover:text-white transition-all"><X className="w-5 h-5"/></button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}