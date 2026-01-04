"use client";

import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Chrome } from 'lucide-react'; // Simulating Google Icon

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/'); // Teleport to Lobby on success
    } catch (err: any) {
      setError("Access Denied: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7000FF] via-[#00FF94] to-[#00D4FF]" />
      
      <div className="z-10 w-full max-w-sm text-center space-y-8">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-[#00FF94] mb-2">DESKMATES</h1>
          <p className="text-xs text-[#52525B] uppercase tracking-[0.3em]">Neural Link Interface</p>
        </div>

        <div className="bg-[#121212] border border-[#27272a] p-8 rounded-3xl shadow-2xl shadow-[#00FF94]/5 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-bold">Identity Verification</h2>
            <p className="text-xs text-[#A1A1AA]">Connect your Google Neural ID to proceed.</p>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-xl font-bold hover:bg-[#e4e4e4] transition-all hover:scale-[1.02]"
          >
            <Chrome className="w-5 h-5" /> {/* Using Chrome icon as proxy for Google */}
            Sign in with Google
          </button>
          
          {error && <p className="text-red-500 text-xs mt-4 border border-red-500/20 p-2 rounded bg-red-500/10">{error}</p>}
        </div>

        <p className="text-[10px] text-[#27272a] uppercase">Secure Connection • V1.0.0</p>
      </div>
    </div>
  );
}