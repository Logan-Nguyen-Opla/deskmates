"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  collection, addDoc, serverTimestamp, 
  query, where, onSnapshot, doc, updateDoc, getDoc 
} from 'firebase/firestore';
import { WherebyService } from '@/services/wherebyService';
import { db, auth } from '@/lib/firebase';
import BottomNav from '@/components/BottomNav';
import { Check, X, Zap } from 'lucide-react';
import { getRole } from '@/utils/roles';

// UI Components
import { 
  GodModeBackground, 
  OmegaHeader, 
  ReactorCore, 
  SignalCard, 
  LoadingSequence 
} from '@/components/GodMode';
import { StandardAdminUI } from '@/components/StandardAdmin'; // <--- THIS WAS MISSING

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState('agent');
  const [loading, setLoading] = useState(true);
  
  const [myRooms, setMyRooms] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [view, setView] = useState<'rooms' | 'applications'>('rooms');
  
  const [title, setTitle] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [tags, setTags] = useState('');

  // 1. INITIALIZATION & AUTH
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);

      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      const calculatedRole = getRole(currentUser, userDocSnap.data());
      
      setRole(calculatedRole);

      if (calculatedRole === 'agent') {
        alert("Access Denied: Clearance Level Too Low.");
        router.push('/profile');
        return;
      }

      const roomQuery = query(
          collection(db, 'rooms'), 
          where("status", "==", "active"),
          where("moderatorId", "==", currentUser.uid) 
      );

      const unsubRooms = onSnapshot(roomQuery, (snapshot) => {
        setMyRooms(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      let unsubApps = () => {};
      if (calculatedRole === 'founder') {
          const appQuery = query(collection(db, 'applications'), where('status', '==', 'pending'));
          unsubApps = onSnapshot(appQuery, (snap) => {
              setApplications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          });
      }

      setLoading(false);
      return () => { unsubRooms(); unsubApps(); };
    });

    return () => unsubscribeAuth();
  }, [router]);

  // 2. ACTIONS
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    try {
      const wherebyData = await WherebyService.createMeeting();

      await addDoc(collection(db, 'rooms'), {
        title,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        moderator: auth.currentUser.displayName || "Moderator",
        moderatorId: auth.currentUser.uid,
        participants: 0,
        status: 'active',
        createdAt: serverTimestamp(),
        // THE FIX: Storing Whereby instead of Jitsi
        userUrl: wherebyData.userUrl,
        hostUrl: wherebyData.hostUrl,
        meetingId: wherebyData.meetingId
      });
      
      setTitle('');
      setTags('');
      alert("Whereby Room Deployed Successfully.");
    } catch (error) {
      alert("System Error: Could not deploy room.");
    }
  };

  const handleCloseRoom = async (roomId: string) => {
    const message = role === 'founder'
        ? "EXECUTE SOLAR FLARE? (Terminates Protocol)" 
        : "Are you sure you want to close this room?";
    
    if (!confirm(message)) return;
    try {
      await updateDoc(doc(db, 'rooms', roomId), { status: 'closed' });
    } catch (error) { console.error(error); }
  };

  const handleApprove = async (appId: string, applicantId: string) => {
      if (!confirm("Promote this Agent to Moderator?")) return;
      try {
        await updateDoc(doc(db, 'users', applicantId), { role: 'moderator' });
        await updateDoc(doc(db, 'applications', appId), { status: 'approved' });
        alert("Promotion Successful.");
      } catch (e) { alert("Error promoting agent."); }
  };

  const handleReject = async (appId: string) => {
      if (!confirm("Reject application?")) return;
      await updateDoc(doc(db, 'applications', appId), { status: 'rejected' });
  };

  if (loading) return <LoadingSequence />;

  // VIEW: MODERATOR
  if (role === 'moderator') {
    return (
      <>
        <StandardAdminUI 
            rooms={myRooms} 
            onCloseRoom={handleCloseRoom}
            // 👇 THIS IS THE NEW PART THAT CONNECTS THE LOGIC
            onCreateRoom={(e, newTitle, newTags) => {
                // We manually trigger the create event with the data from the child component
                setTitle(newTitle);
                setTags(newTags);
                // We need to wrap it in a synthetic event or just call logic directly
                // To keep it simple, let's just reuse the logic but adaptable:
                const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                
                // We need to set state first, then call. 
                // ACTUALLY, React state updates are async, so calling handleCreateRoom immediately 
                // with empty state won't work.
                
                // Let's call the DB directly here for Mods to avoid state sync issues:
                addDoc(collection(db, 'rooms'), {
                    title: newTitle,
                    meetLink: 'jitsi-embedded',
                    tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
                    moderator: user.displayName || "Moderator",
                    moderatorId: user.uid,
                    participants: 0,
                    status: 'active',
                    createdAt: serverTimestamp(),
                    isHot: false // Mods don't get "HOT" status automatically
                }).then(() => alert("Room Deployed Successfully."));
            }}
            userName={user?.displayName || "Moderator"} 
        />
        <BottomNav />
      </>
    );
  }

  // VIEW: FOUNDER
  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 relative overflow-hidden font-mono selection:bg-yellow-500 selection:text-black">
      <GodModeBackground />
      <OmegaHeader userName="Founder" />

      <div className="flex justify-center gap-4 mb-8 relative z-10">
          <button onClick={() => setView('rooms')} className={`text-xs font-black uppercase tracking-[0.2em] px-6 py-3 border transition-all ${view === 'rooms' ? 'bg-yellow-500 text-black border-yellow-500 shadow-[0_0_20px_rgba(255,215,0,0.3)]' : 'bg-black text-yellow-700 border-yellow-900/30 hover:text-yellow-500'}`}>War Room</button>
          <button onClick={() => setView('applications')} className={`text-xs font-black uppercase tracking-[0.2em] px-6 py-3 border transition-all ${view === 'applications' ? 'bg-yellow-500 text-black border-yellow-500 shadow-[0_0_20px_rgba(255,215,0,0.3)]' : 'bg-black text-yellow-700 border-yellow-900/30 hover:text-yellow-500'}`}>
            Approvals {applications.length > 0 && <span className="ml-2 bg-red-600 text-white px-1.5 py-0.5 rounded-full text-[9px]">{applications.length}</span>}
          </button>
      </div>

      {view === 'rooms' ? (
          <>
            <ReactorCore>
                <form onSubmit={handleCreateRoom} className="space-y-8">
                    <div className="space-y-2 group">
                        <label className="text-[10px] uppercase font-bold text-yellow-800 tracking-widest">Protocol Name</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#050505]/50 border border-yellow-900/30 p-5 text-base focus:border-yellow-400 outline-none text-yellow-100 font-bold rounded-lg" placeholder="OMEGA SESSION" required />
                    </div>
                    <div className="space-y-2 group">
                        <label className="text-[10px] uppercase font-bold text-yellow-800 tracking-widest">Tags</label>
                        <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full bg-[#050505]/50 border border-yellow-900/30 p-5 text-base focus:border-yellow-400 outline-none text-yellow-100 rounded-lg" placeholder="FOCUS, DEEP WORK" />
                    </div>
                    <button type="submit" className="w-full bg-yellow-500 text-black font-black uppercase tracking-[0.3em] text-sm py-6 hover:scale-[1.01] transition-transform shadow-[0_0_40px_rgba(255,215,0,0.3)] rounded-lg mt-4 flex justify-center gap-2 items-center">
                        <Zap className="w-5 h-5 fill-black" /> DEPLOY
                    </button>
                </form>
            </ReactorCore>

            <div className="relative z-10 max-w-4xl mx-auto mt-12">
                <div className="space-y-4">
                    {myRooms.map(room => (
                    <SignalCard key={room.id} room={room} onClose={handleCloseRoom} />
                    ))}
                </div>
            </div>
          </>
      ) : (
          <div className="max-w-4xl mx-auto space-y-4 relative z-10">
              {applications.map(app => (
                  <div key={app.id} className="bg-[#050505] border border-yellow-900/30 p-6 rounded-xl flex justify-between items-center group hover:border-yellow-500/50 transition-colors">
                      <div>
                          <div className="text-yellow-500 font-bold text-lg">{app.displayName}</div>
                          <div className="text-yellow-800 text-xs uppercase tracking-widest mb-3">{app.email}</div>
                          <div className="text-gray-400 text-sm italic bg-[#111] p-3 rounded border border-[#222]">"{app.reason}"</div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                          <button onClick={() => handleApprove(app.id, app.uid)} className="p-3 bg-green-900/10 text-green-500 border border-green-900/50 hover:bg-green-500 hover:text-black transition-all rounded"><Check className="w-5 h-5"/></button>
                          <button onClick={() => handleReject(app.id)} className="p-3 bg-red-900/10 text-red-500 border border-red-900/50 hover:bg-red-500 hover:text-white transition-all rounded"><X className="w-5 h-5"/></button>
                      </div>
                  </div>
              ))}
          </div>
      )}
      <BottomNav />
    </div>
  );
}