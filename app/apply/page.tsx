"use client";

import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Shield, ChevronLeft } from 'lucide-react';

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
      alert("Application sent to High Command.");
      router.push('/profile');
    } catch (error) {
      alert("Transmission failed.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-mono">
      <div className="max-w-md w-full border border-[#27272a] bg-[#121212] p-8 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FF94] to-transparent opacity-50" />
        
        <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-[#00FF94]" />
            <h1 className="text-xl font-bold uppercase tracking-widest">Request Clearance</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="text-xs uppercase text-[#52525B] font-bold block mb-2">Why do you want to moderate?</label>
                <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-black border border-[#27272a] p-4 rounded-lg text-sm focus:border-[#00FF94] outline-none h-32 resize-none transition-colors"
                    placeholder="I want to keep the focus high..."
                    required
                />
            </div>

            <button disabled={loading} className="w-full bg-[#00FF94] text-black font-bold uppercase py-4 rounded hover:bg-[#00cc76] transition-colors tracking-widest text-xs">
                {loading ? "Transmitting..." : "Submit Application"}
            </button>
        </form>

        <button onClick={() => router.back()} className="mt-6 flex items-center gap-2 text-xs text-[#52525B] hover:text-white transition-colors mx-auto">
            <ChevronLeft className="w-3 h-3" /> Cancel
        </button>
      </div>
    </div>
  );
}