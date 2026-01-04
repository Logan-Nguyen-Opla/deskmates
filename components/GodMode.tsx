"use client";

import { ShieldCheck, Cpu, Crosshair, AlertTriangle, Trash2, Radio, Zap } from 'lucide-react';

/**
 * BACKGROUND: The "Cool" Atmosphere
 * Applied to: Admin, Lobby, Room, Profile
 */
export const GodModeBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 bg-[#020202]">
    {/* Deep Space Gold Fog */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[60vh] bg-yellow-600/10 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-0 right-0 w-[80vw] h-[50vh] bg-orange-900/10 rounded-full blur-[100px]" />
    
    {/* Falling Gold Dust */}
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse" />
    
    {/* Subtle Grid */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,215,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,215,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
  </div>
);

/**
 * HEADER: Clean & Infinite
 */
export const OmegaHeader = ({ userName }: { userName: string }) => (
  <div className="relative z-10 mb-12 group">
    {/* Glowing Underline */}
    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
    
    <div className="relative flex justify-between items-end pb-6 px-2">
        <div>
            <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="text-yellow-400 w-5 h-5 animate-bounce" />
                <span className="text-[10px] text-yellow-600 font-bold tracking-[0.4em] uppercase">Pax Deskmates</span>
            </div>
            <h1 className="text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-500 to-yellow-800 drop-shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                GOD MODE
            </h1>
        </div>
        <div className="text-right hidden sm:block">
            <div className="text-[9px] text-yellow-800 uppercase tracking-widest mb-1">Total Focus</div>
            <div className="text-3xl font-bold text-yellow-500 font-mono">
                ∞
            </div>
        </div>
    </div>
  </div>
);

/**
 * CORE: Clean Deployment Frame
 */
export const ReactorCore = ({ children }: { children: React.ReactNode }) => (
  <div className="relative z-10 mb-16 max-w-4xl mx-auto">
    <div className="bg-[#050505]/50 backdrop-blur-sm border border-yellow-500/20 p-8 rounded-2xl relative overflow-hidden shadow-[0_0_50px_rgba(255,200,0,0.05)]">
        
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-yellow-500" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-yellow-500" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-yellow-500" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-yellow-500" />

        <div className="relative">
            <div className="flex items-center gap-4 mb-8 border-b border-yellow-900/20 pb-4">
                <Crosshair className="w-5 h-5 text-yellow-500 animate-[spin_10s_linear_infinite]" />
                <div>
                    <h2 className="font-bold text-sm uppercase text-yellow-500 tracking-[0.2em]">Deploy Signal</h2>
                </div>
            </div>
            {children}
        </div>
    </div>
  </div>
);

/**
 * LIST ITEM: Clean Signal Card
 */
export const SignalCard = ({ room, onClose }: { room: any, onClose: (id: string) => void }) => (
  <div className={`relative bg-[#080808] border-l-2 ${room.status === 'closed' ? 'border-red-900 opacity-50 grayscale' : 'border-yellow-500'} p-6 flex justify-between items-center group overflow-hidden transition-all hover:bg-[#0A0A0A]`}>
      
      {/* Golden Shine on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-out" />

      <div className="relative z-10 flex items-center gap-6">
          <div className="flex flex-col items-center justify-center w-10 h-10 border border-yellow-900/30 rounded bg-black/50">
             <Radio className="w-4 h-4 text-yellow-600" />
          </div>
          <div>
            <div className="font-bold text-lg text-gray-200 group-hover:text-yellow-200 transition-colors uppercase tracking-tight">{room.title}</div>
            <div className="flex items-center gap-3 mt-1">
                <span className={`text-[9px] font-black uppercase tracking-widest ${room.status === 'closed' ? 'text-red-500' : 'text-yellow-600'}`}>
                    {room.status}
                </span>
            </div>
          </div>
      </div>
      
      {room.status !== 'closed' && (
      <button 
          onClick={() => onClose(room.id)}
          className="relative z-10 bg-[#120505] border border-red-900/30 text-red-600 px-4 py-3 rounded hover:bg-red-900 hover:text-white transition-all uppercase text-[10px] font-black tracking-widest"
      >
          TERMINATE
      </button>
      )}
  </div>
);

/**
 * LOADING
 */
export const LoadingSequence = () => (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-8 relative overflow-hidden font-mono">
        <div className="w-24 h-24 border-t-2 border-yellow-500 rounded-full animate-spin shadow-[0_0_30px_#FFD700]" />
        <div className="text-yellow-500 font-black text-xl uppercase tracking-[0.5em] animate-pulse">
            SYNCING...
        </div>
    </div>
);