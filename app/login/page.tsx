"use client";

import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'; // Added provider
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Chrome } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      // THE FIX: Force Google to show the account picker
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, googleProvider);
      router.push('/'); 
    } catch (err: any) {
      setError("Access Denied: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-white font-mono">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-[#00FF94] to-yellow-500 opacity-30" />
      
      <div className="z-10 w-full max-w-sm text-center space-y-8">
        <h1 className="text-4xl font-black italic tracking-tighter text-yellow-500">DESKMATES</h1>
        
        <div className="bg-[#121212] border border-[#27272a] p-8 rounded-[3rem] space-y-6 shadow-2xl">
          <div className="space-y-2">
            <h2 className="text-lg font-bold uppercase tracking-widest">Neural ID Link</h2>
            <p className="text-[10px] text-[#A1A1AA] uppercase font-bold tracking-widest">Establish biometric uplink via Google</p>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-yellow-500 transition-all active:scale-95"
          >
            <Chrome className="w-5 h-5" /> Sign in with Google
          </button>
          
          {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{error}</p>}
        </div>
      </div>
    </div>
  );
}