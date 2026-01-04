// app/admin/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  collection, addDoc, serverTimestamp, 
  query, where, onSnapshot, doc, updateDoc 
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Zap } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

// Import the Titan Visuals
import { 
  GodModeBackground, 
  OmegaHeader, 
  ReactorCore, 
  SignalCard, 
  LoadingSequence 
} from '@/components/GodMode';

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [tags, setTags] = useState('');
  const [myRooms, setMyRooms] = useState<any[]>([]);

  // 1. AUTH LOGIC (Trust Mode)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200); // Artificial delay for cool loading effect
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
      } else {
        setCurrentUser(user);
        // Load Rooms
        const q = query(collection(db, 'rooms'), where("moderatorId", "==", user.uid));
        const unsubscribeRooms = onSnapshot(q, (snapshot) => {
          const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMyRooms(rooms);
        });
        return () => unsubscribeRooms();
      }
    });
    return () => { unsubscribeAuth(); clearTimeout(timer); }
  }, [router]);

  // 2. CREATE ROOM
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, 'rooms'), {
        title,
        meetLink, 
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        moderator: "★ " + (auth.currentUser.displayName || "Founder"),
        moderatorId: auth.currentUser.uid,
        participants: 0,
        status: 'active',
        createdAt: serverTimestamp(),
        isHot: true
      });
      setTitle('');
      setMeetLink('');
      setTags('');
    } catch (error) {
      alert("System Error: Could not deploy room.");
    }
  };

  // 3. CLOSE ROOM
  const handleCloseRoom = async (roomId: string) => {
    if (!confirm("EXECUTE SOLAR FLARE?")) return;
    try {
      await updateDoc(doc(db, 'rooms', roomId), { status: 'closed' });
    } catch (error) { console.error(error); }
  };

  if (loading) return <LoadingSequence />;

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 relative overflow-hidden font-mono selection:bg-yellow-500 selection:text-black">
      
      <GodModeBackground />
      <OmegaHeader userName={currentUser?.displayName || "Founder"} />

      <ReactorCore>
        <form onSubmit={handleCreateRoom} className="space-y-8">
            <div className="space-y-2 group">
                <label className="text-[10px] uppercase font-bold text-yellow-800 group-focus-within:text-yellow-500 transition-colors tracking-widest">Protocol Name</label>
                <input 
                    type="text" 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-[#050505] border border-yellow-900/30 p-5 text-base focus:border-yellow-400 focus:shadow-[0_0_30px_rgba(255,215,0,0.1)] outline-none text-yellow-100 placeholder:text-yellow-900/30 transition-all font-bold rounded-lg"
                    placeholder="e.g. OMEGA STUDY SESSION"
                    required 
                />
            </div>
            
            <div className="space-y-2 group">
                <label className="text-[10px] uppercase font-bold text-yellow-800 group-focus-within:text-yellow-500 transition-colors tracking-widest">Uplink URL</label>
                <input 
                    type="url" 
                    value={meetLink}
                    onChange={e => setMeetLink(e.target.value)}
                    className="w-full bg-[#050505] border border-yellow-900/30 p-5 text-base focus:border-yellow-400 focus:shadow-[0_0_30px_rgba(255,215,0,0.1)] outline-none text-yellow-100 placeholder:text-yellow-900/30 transition-all font-mono rounded-lg"
                    placeholder="https://meet.google.com/..."
                    required 
                />
            </div>
            
            <div className="space-y-2 group">
                <label className="text-[10px] uppercase font-bold text-yellow-800 group-focus-within:text-yellow-500 transition-colors tracking-widest">Signal Tags</label>
                <input 
                    type="text" 
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    className="w-full bg-[#050505] border border-yellow-900/30 p-5 text-base focus:border-yellow-400 focus:shadow-[0_0_30px_rgba(255,215,0,0.1)] outline-none text-yellow-100 placeholder:text-yellow-900/30 transition-all rounded-lg"
                    placeholder="FOCUS, SILENT, HARDCORE"
                />
            </div>

            <button type="submit" className="w-full bg-yellow-500 text-black font-black uppercase tracking-[0.3em] text-sm py-6 relative overflow-hidden group hover:scale-[1.01] transition-transform shadow-[0_0_40px_rgba(255,215,0,0.3)] rounded-lg mt-4">
                <div className="absolute inset-0 bg-white/40 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center justify-center gap-3">
                    <Zap className="w-5 h-5 fill-black" /> INITIATE SEQUENCE
                </span>
            </button>
        </form>
      </ReactorCore>

      <div className="relative z-10 max-w-4xl mx-auto">
        <h2 className="font-bold text-xs uppercase text-yellow-800 tracking-[0.3em] mb-8 border-b border-yellow-900/30 pb-4">
            Active Transmissions ({myRooms.length})
        </h2>
        <div className="space-y-4">
            {myRooms.map(room => (
              <SignalCard 
                key={room.id} 
                room={room} 
                onClose={handleCloseRoom} 
              />
            ))}
            {myRooms.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed border-yellow-900/20 text-yellow-900/40 text-sm font-mono uppercase tracking-widest rounded-xl">
                    // SILENCE DETECTED IN SECTOR //
                </div>
            )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}