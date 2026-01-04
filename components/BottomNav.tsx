// components/BottomNav.tsx
"use client"; // Required for client-side interactivity

import Link from "next/link";
import { Hash, Trophy, User } from "lucide-react";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#121212]/80 backdrop-blur-xl border-t border-[#27272a] flex justify-around py-4 px-6 z-50">
      <Link href="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? "text-[#00FF94]" : "text-[#52525B]"}`}>
        <Hash className="w-5 h-5" />
        <span className="text-[8px] font-black uppercase">Lobby</span>
      </Link>
      <Link href="/leaderboard" className={`flex flex-col items-center gap-1 ${isActive('/leaderboard') ? "text-[#00FF94]" : "text-[#52525B]"}`}>
        <Trophy className="w-5 h-5" />
        <span className="text-[8px] font-black uppercase">Rank</span>
      </Link>
      <Link href="/profile" className={`flex flex-col items-center gap-1 ${isActive('/profile') ? "text-[#00FF94]" : "text-[#52525B]"}`}>
        <User className="w-5 h-5" />
        <span className="text-[8px] font-black uppercase">Me</span>
      </Link>
    </nav>
  );
}