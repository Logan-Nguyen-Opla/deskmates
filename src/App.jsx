import React, { useState, useEffect, useRef } from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Link, 
  useParams, 
  useNavigate 
} from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  Video, Music, Flame, Share2, PhoneOff, 
  Clock, Trophy, Zap, ChevronLeft, Settings,
  Users, CheckCircle2, Hash, MessageSquare, ShieldCheck, Send, User
} from 'lucide-react';

// --- Firebase Config ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'deskmates-online';

// --- Global Utilities ---
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// --- Screens & Components (Consolidated from your Repomix File) ---

/**
 * LOBBY SCREEN
 */
function Lobby() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    // Listen for live rooms from Firebase
    const roomsRef = collection(db, 'artifacts', appId, 'public', 'data', 'rooms');
    return onSnapshot(roomsRef, (snapshot) => {
      const liveRooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRooms(liveRooms.length > 0 ? liveRooms : MOCK_ROOMS);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-24">
      <header className="p-6 border-b border-[#27272a] bg-[#121212]/50 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-2xl font-black italic tracking-tighter text-[#00FF94]">DESKMATES</h1>
        <p className="text-xs text-[#A1A1AA] uppercase tracking-widest mt-1">Study Together, Rank Together</p>
      </header>

      <div className="p-4 space-y-4">
        {rooms.map((room) => (
          <Link to={`/room/${room.id}`} key={room.id} className="block">
            <div className="bg-[#121212] border border-[#27272a] rounded-2xl p-5 hover:border-[#00FF94]/50 transition-all">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg">{room.title}</h3>
                {room.isHot && <span className="bg-[#FF5C00]/20 text-[#FF5C00] text-[10px] px-2 py-0.5 rounded font-black uppercase">HOT</span>}
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {room.tags?.map(tag => (
                  <span key={tag} className="text-[10px] bg-[#1E1E1E] text-[#A1A1AA] px-2 py-1 rounded-md uppercase border border-[#27272a]">{tag}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-[#A1A1AA] text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#00FF94] rounded-full animate-pulse" />
                  <span>{room.participants || 0} online</span>
                </div>
                <span className="font-mono">Mod: {room.moderator}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <BottomNav active="lobby" />
    </div>
  );
}

/**
 * ACTIVE SESSION (The Timer Screen)
 */
function ActiveSession() {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const rs = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(rs).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0A1828] to-[#050505] flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-8">
        <div className="text-[#00FF94] text-xs uppercase tracking-[0.3em] font-black border border-[#00FF94]/30 px-4 py-2 rounded-full inline-block">
          Flow State Protocol Active
        </div>
        
        <div className="text-7xl font-mono text-white tracking-tighter tabular-nums">
          {formatTime(seconds)}
        </div>

        <div className="space-y-4 pt-12">
          <button 
            onClick={() => window.open('https://meet.google.com', '_blank')}
            className="w-full bg-gradient-to-r from-[#00FF94] to-[#00D4FF] text-black py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase shadow-xl shadow-[#00FF94]/10"
          >
            <Video className="w-5 h-5" /> Open Google Meet
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-transparent border border-[#27272a] text-[#A1A1AA] py-4 rounded-2xl font-bold uppercase text-xs tracking-widest"
          >
            End & Sync Points
          </button>
        </div>
      </div>
      
      <div className="fixed bottom-12 flex gap-4">
        <div className="p-4 bg-[#121212] border border-[#27272a] rounded-2xl flex items-center gap-3">
           <Flame className="text-[#FF5C00]" />
           <span className="text-xs font-bold text-white uppercase">12m Streak</span>
        </div>
      </div>
    </div>
  );
}

/**
 * PROFILE SCREEN
 */
function Profile() {
  const [user, setUser] = useState(auth.currentUser);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-24">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#A1A1AA]">Intelligence Profile</h2>
        <Settings className="text-[#52525B] w-5 h-5" />
      </div>

      <div className="text-center mb-10">
        <div className="w-24 h-24 bg-gradient-to-br from-[#7000FF] to-[#00FF94] rounded-full mx-auto flex items-center justify-center text-3xl font-black mb-4 shadow-2xl shadow-[#7000FF]/20">
          {user?.uid.slice(0, 2).toUpperCase()}
        </div>
        <h3 className="text-xl font-bold">Deskmate #{user?.uid.slice(0, 4)}</h3>
        <p className="text-xs text-[#52525B] font-mono mt-1">UUID: {user?.uid}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#121212] border border-[#27272a] p-4 rounded-2xl">
          <Clock className="text-[#00FF94] w-5 h-5 mb-2" />
          <div className="text-2xl font-black">127h</div>
          <div className="text-[10px] text-[#A1A1AA] uppercase font-bold">Focus Time</div>
        </div>
        <div className="bg-[#121212] border border-[#27272a] p-4 rounded-2xl">
          <Zap className="text-[#FF5C00] w-5 h-5 mb-2" />
          <div className="text-2xl font-black">450</div>
          <div className="text-[10px] text-[#A1A1AA] uppercase font-bold">Points</div>
        </div>
      </div>

      <BottomNav active="profile" />
    </div>
  );
}

/**
 * SHARED NAVIGATION
 */
function BottomNav({ active }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#121212]/80 backdrop-blur-xl border-t border-[#27272a] flex justify-around py-4 px-6 z-50">
      <Link to="/" className={cn("flex flex-col items-center gap-1", active === 'lobby' ? "text-[#00FF94]" : "text-[#52525B]")}>
        <Hash className="w-5 h-5" />
        <span className="text-[8px] font-black uppercase">Lobby</span>
      </Link>
      <Link to="/leaderboard" className={cn("flex flex-col items-center gap-1", active === 'rank' ? "text-[#00FF94]" : "text-[#52525B]")}>
        <Trophy className="w-5 h-5" />
        <span className="text-[8px] font-black uppercase">Rank</span>
      </Link>
      <Link to="/profile" className={cn("flex flex-col items-center gap-1", active === 'profile' ? "text-[#00FF94]" : "text-[#52525B]")}>
        <User className="w-5 h-5" />
        <span className="text-[8px] font-black uppercase">Me</span>
      </Link>
    </nav>
  );
}

const MOCK_ROOMS = [
  { id: "1", title: "CA TỐI: Giải đề Toán Chuyên", moderator: "Nam Long", tags: ["Focus", "Silent", "Math"], participants: 14, isHot: true },
  { id: "2", title: "IELTS Speaking Part 2", moderator: "Minh Anh", tags: ["English", "IELTS"], participants: 8, isHot: false }
];

// --- Main App Entry ---
export default function App() {
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Firebase Auth failed", err);
      } finally {
        setInitializing(false);
      }
    };
    initAuth();
  }, []);

  if (initializing) {
    return (
      <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-[#00FF94] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#00FF94] font-black tracking-widest text-xs uppercase animate-pulse">Syncing Deskmates Network</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:id" element={<ActiveSession />} />
        <Route path="/session" element={<ActiveSession />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/leaderboard" element={<div className="p-8 text-white">Leaderboard coming soon... <BottomNav active="rank" /></div>} />
      </Routes>
    </BrowserRouter>
  );
}