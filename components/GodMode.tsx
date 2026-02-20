"use client";

import { 
  ShieldCheck, 
  Cpu, 
  Crosshair, 
  Trash2, 
  Radio, 
  Zap, 
  Activity 
} from 'lucide-react'; // Fixed: Added Radio & Activity imports

/**
 * BACKGROUND: The Universal "Cool" Aesthetic
 * Restored: Gold Dust + Scanning Beam for the Founder
 */
export const GodModeBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 bg-[#020202]">
    {/* Deep Space Gold Fog */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[60vh] bg-yellow-600/10 rounded-full blur-[120px] animate-pulse" />
    
    {/* Founder Scanning Beam */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-500/5 to-transparent h-20 w-full top-[-100px] animate-[scan_4s_linear_infinite]" />
    
    {/* Subtle Grid Overlay */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,215,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,215,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
    
    <style jsx global>{`
      @keyframes scan {
        0% { transform: translateY(-10vh); }
        100% { transform: translateY(100vh); }
      }
    `}</style>
  </div>
);

/**
 * OMEGA HEADER: High-Clearance Identity
 */
export const OmegaHeader = ({ userName }: { userName: string }) => (
  <div className="relative z-10 mb-12 flex justify-between items-end border-b border-yellow-500/20 pb-6">
    <div>
        <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="text-yellow-500 w-5 h-5 animate-pulse" />
            <span className="text-[10px] text-yellow-700 font-bold tracking-[0.4em] uppercase">Deskmates Laboratory</span>
        </div>
        <h1 className="text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-500 to-yellow-800 drop-shadow-[0_0_15px_rgba(255,215,0,0.2)]">
            {userName}
        </h1>
    </div>
    <div className="text-right hidden sm:block">
        <Activity className="text-yellow-900 w-8 h-8 ml-auto mb-2 animate-pulse" />
        <div className="text-[9px] text-yellow-800 uppercase tracking-widest">Neural Link: Active</div>
    </div>
  </div>
);

/**
 * REACTOR CORE: Deployment Frame
 */
export const ReactorCore = ({ children }: { children: React.ReactNode }) => (
  <div className="relative z-10 mb-16 max-w-4xl mx-auto">
    <div className="bg-[#050505]/50 backdrop-blur-sm border border-yellow-500/20 p-8 rounded-2xl relative overflow-hidden shadow-[0_0_50px_rgba(255,200,0,0.05)]">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-yellow-500" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-yellow-500" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-yellow-500" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-yellow-500" />
        <div className="relative">
            <div className="flex items-center gap-4 mb-8 border-b border-yellow-900/20 pb-4">
                <Crosshair className="w-5 h-5 text-yellow-500 animate-[spin_10s_linear_infinite]" />
                <h2 className="font-bold text-sm uppercase text-yellow-500 tracking-[0.2em]">Deploy Signal</h2>
            </div>
            {children}
        </div>
    </div>
  </div>
);

/**
 * SIGNAL CARD: Active Protocol Management
 */
export const SignalCard = ({ room, onClose }: { room: any, onClose: (id: string) => void }) => (
  <div className={`relative bg-[#080808] border-l-2 ${room.status === 'closed' ? 'border-red-900 opacity-50 grayscale' : 'border-yellow-500'} p-6 flex justify-between items-center group overflow-hidden transition-all hover:bg-[#0A0A0A]`}>
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-out" />
      <div className="relative z-10 flex items-center gap-6">
          <div className="flex flex-col items-center justify-center w-10 h-10 border border-yellow-900/30 rounded bg-black/50">
             <Radio className="w-4 h-4 text-yellow-600" /> {/* Fixed: Error 2552 resolved */}
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
 * LOADING SEQUENCE: Initializing Link
 */
export const LoadingSequence = () => (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-8 relative overflow-hidden font-mono">
        <div className="w-24 h-24 border-t-2 border-yellow-500 rounded-full animate-spin shadow-[0_0_30px_#FFD700]" />
        <div className="text-yellow-500 font-black text-xl uppercase tracking-[0.5em] animate-pulse">
            SYNCING...
        </div>
    </div>
);