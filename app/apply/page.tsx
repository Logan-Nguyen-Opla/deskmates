"use client";

import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Shield, ChevronLeft, Send } from 'lucide-react';

export default function ApplyForMod() {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return router.push('/login');
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'applications'), {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        reason,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      alert("Transmission sent to High Command.");
      router.push('/profile');
    } catch (error) {
      alert("Transmission failed. Uplink unstable.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-mono">
      {/* GLOWING CONTAINER */}
      <div className="max-w-md w-full border border-[#27272a] bg-[#121212] p-8 rounded-3xl relative overflow-hidden shadow-2xl shadow-green-500/5">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FF94] to-transparent opacity-50" />
        
        <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-[#00FF94]/10 rounded-lg">
                <Shield className="w-6 h-6 text-[#00FF94]" />
            </div>
            <div>
                <h1 className="text-xl font-bold uppercase tracking-widest text-white">Clearance Request</h1>
                <p className="text-[9px] text-[#52525B] font-bold uppercase tracking-[0.2em]">Moderator Authorization Protocol</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
                <label className="text-[10px] uppercase text-[#52525B] font-black tracking-widest block ml-1">Statement of Intent</label>
                <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-black border border-[#27272a] p-5 rounded-2xl text-sm focus:border-[#00FF94] outline-none h-40 resize-none transition-all placeholder:text-gray-800 text-gray-200"
                    placeholder="Describe why you should be granted moderator privileges..."
                    required
                />
            </div>

            <button 
                disabled={loading} 
                className="group relative w-full bg-[#00FF94] text-black font-black uppercase py-5 rounded-2xl hover:bg-[#00cc76] transition-all tracking-[0.3em] text-xs flex items-center justify-center gap-3 overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {loading ? "Transmitting..." : (
                    <>
                        Submit Application <Send className="w-3 h-3" />
                    </>
                )}
            </button>
        </form>

        <button 
            onClick={() => router.back()} 
            className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#52525B] hover:text-white transition-colors mx-auto"
        >
            <ChevronLeft className="w-3 h-3" /> Cancel Transmission
        </button>
      </div>

      <p className="mt-8 text-[9px] text-[#1a1a1a] font-black uppercase tracking-[0.5em]">
          End of Line • Secure Portal V1.0
      </p>
    </div>
  );
}