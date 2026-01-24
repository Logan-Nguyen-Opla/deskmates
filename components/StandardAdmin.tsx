"use client";

import { useState } from 'react';
import { Shield, Trash2, Activity, Users, Radio, Plus, X } from 'lucide-react';

export const StandardAdminUI = ({ 
  rooms, 
  onCloseRoom, 
  onCreateRoom, // <--- NEW PROP
  userName 
}: { 
  rooms: any[], 
  onCloseRoom: (id: string) => void,
  onCreateRoom: (e: React.FormEvent, title: string, tags: string) => void, // <--- NEW TYPE
  userName: string 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    onCreateRoom(e, title, tags);
    setIsCreating(false);
    setTitle('');
    setTags('');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-6 pb-24">
      {/* Header */}
      <header className="flex justify-between items-end mb-8 border-b border-[#27272a] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[#00FF94]">
            <Shield className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Moderator Clearance</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Mission Control</h1>
        </div>
        <div className="text-right">
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="bg-[#00FF94] text-black px-4 py-2 rounded font-bold uppercase text-xs tracking-widest hover:bg-[#00cc76] transition-colors flex items-center gap-2"
          >
            {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isCreating ? "Cancel" : "Deploy New Room"}
          </button>
        </div>
      </header>

      {/* CREATION FORM (Conditionally Rendered) */}
      {isCreating && (
        <div className="mb-8 bg-[#121212] border border-[#00FF94]/30 p-6 rounded-xl animate-in fade-in slide-in-from-top-4">
            <h3 className="font-bold text-[#00FF94] uppercase tracking-widest text-sm mb-4">Initialize New Protocol</h3>
            <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                <div className="flex-1 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#52525B]">Room Name</label>
                    <input 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-black border border-[#27272a] p-3 rounded text-sm focus:border-[#00FF94] outline-none text-white"
                        placeholder="e.g. Late Night Study"
                        required
                    />
                </div>
                <div className="flex-1 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#52525B]">Tags (Optional)</label>
                    <input 
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full bg-black border border-[#27272a] p-3 rounded text-sm focus:border-[#00FF94] outline-none text-white"
                        placeholder="CHILL, MUSIC, CAMERA ON"
                    />
                </div>
                <button className="bg-[#00FF94]/10 border border-[#00FF94] text-[#00FF94] px-6 py-3 rounded font-bold uppercase text-xs hover:bg-[#00FF94] hover:text-black transition-all">
                    Launch
                </button>
            </form>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#121212] border border-[#27272a] p-4 rounded-xl">
          <div className="flex items-center gap-2 text-[#A1A1AA] mb-2">
            <Radio className="w-4 h-4" /> <span className="text-xs uppercase font-bold">Active Signals</span>
          </div>
          <div className="text-2xl font-bold text-white">{rooms.filter(r => r.status === 'active').length}</div>
        </div>
        <div className="bg-[#121212] border border-[#27272a] p-4 rounded-xl">
          <div className="flex items-center gap-2 text-[#A1A1AA] mb-2">
            <Users className="w-4 h-4" /> <span className="text-xs uppercase font-bold">Total Agents</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {rooms.reduce((acc, r) => acc + (r.participants || 0), 0)}
          </div>
        </div>
      </div>

      {/* Room Management Table */}
      <div className="bg-[#121212] border border-[#27272a] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#27272a] flex justify-between items-center">
          <h3 className="font-bold text-sm uppercase tracking-wider text-white">Active Protocols</h3>
          <div className="flex items-center gap-2 px-2 py-1 bg-[#00FF94]/10 rounded text-[#00FF94] text-[10px] font-bold uppercase animate-pulse">
            <Activity className="w-3 h-3" /> Live Feed
          </div>
        </div>

        <div className="divide-y divide-[#27272a]">
          {rooms.length === 0 ? (
            <div className="p-8 text-center text-[#52525B] text-sm uppercase tracking-widest">
              No active rooms detected.
            </div>
          ) : (
            rooms.map((room) => (
              <div key={room.id} className="p-4 flex items-center justify-between hover:bg-[#1A1A1A] transition-colors group">
                <div>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${room.status === 'active' ? 'bg-[#00FF94] shadow-[0_0_8px_#00FF94]' : 'bg-red-500'}`} />
                    <span className="font-bold text-white">{room.title}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-[#A1A1AA]">
                    <span className="font-mono">ID: {room.id.slice(0, 6)}</span>
                    <span>•</span>
                    <span>{room.participants || 0} Online</span>
                  </div>
                </div>

                {room.status === 'active' && (
                  <button
                    onClick={() => onCloseRoom(room.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
                  >
                    <Trash2 className="w-3 h-3" /> Shutdown
                  </button>
                )}
                
                {room.status === 'closed' && (
                   <span className="px-3 py-1 bg-[#27272a] text-[#52525B] text-[10px] font-bold uppercase rounded">
                      Terminated
                   </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};