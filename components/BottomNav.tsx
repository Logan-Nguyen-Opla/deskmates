"use client";

import Link from "next/link";
import { Hash, Trophy, User } from "lucide-react";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/5 flex justify-around py-4 px-6 z-50">
      <Link href="/" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/') ? "text-yellow-500" : "text-gray-600"}`}>
        <Hash className="w-5 h-5" />
        <span className="text-[8px] font-black uppercase tracking-widest">Lobby</span>
      </Link>
      <Link href="/leaderboard" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/leaderboard') ? "text-yellow-500" : "text-gray-600"}`}>
        <Trophy className="w-5 h-5" />
        <span className="text-[8px] font-black uppercase tracking-widest">Rank</span>
      </Link>
      <Link href="/profile" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/profile') ? "text-yellow-500" : "text-gray-600"}`}>
        <User className="w-5 h-5" />
        <span className="text-[8px] font-black uppercase tracking-widest">Profile</span>
      </Link>
    </nav>
  );
}