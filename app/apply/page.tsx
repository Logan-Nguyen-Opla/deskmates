"use client";

import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Shield, ChevronLeft, Send, GraduationCap, MessageSquare } from 'lucide-react';

export default function ApplyForMod() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ reason: '', school: '', contact: '' });
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
        ...form,
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
      <div className="max-w-md w-full border border-[#27272a] bg-[#121212] p-8 rounded-3xl relative overflow-hidden shadow-2xl">
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

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] uppercase text-[#52525B] font-black tracking-widest flex items-center gap-2"><GraduationCap className="w-3 h-3"/> Academic Institution</label>
                <input required value={form.school} onChange={e => setForm({...form, school: e.target.value})} className="w-full bg-black border border-[#27272a] p-4 rounded-xl text-sm focus:border-[#00FF94] outline-none" placeholder="University / High School..." />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] uppercase text-[#52525B] font-black tracking-widest flex items-center gap-2"><MessageSquare className="w-3 h-3"/> Discord / Contact ID</label>
                <input required value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} className="w-full bg-black border border-[#27272a] p-4 rounded-xl text-sm focus:border-[#00FF94] outline-none" placeholder="Username#0000" />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] uppercase text-[#52525B] font-black tracking-widest block ml-1">Statement of Intent</label>
                <textarea required value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} className="w-full bg-black border border-[#27272a] p-4 rounded-xl text-sm focus:border-[#00FF94] outline-none h-32 resize-none" placeholder="Describe your experience with focus groups..." />
            </div>

            <button disabled={loading} className="w-full bg-[#00FF94] text-black font-black uppercase py-5 rounded-2xl hover:bg-[#00cc76] transition-all tracking-[0.3em] text-xs">
                {loading ? "Transmitting..." : "Submit Application"}
            </button>
        </form>
      </div>
    </div>
  );
}