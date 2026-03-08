// utils/badges.ts

export type BadgeData = { id: string; label: string; color: string; desc: string };

export const calculateBadges = (stats: any, role: string): BadgeData[] => {
  const badges: BadgeData[] = [];
  
  // ROLE-BASED
  if (role === 'founder') badges.push({ id: 'founder', label: 'FOUNDER', color: '#fbbf24', desc: "Project Creator. Omega Clearance." });
  if (role === 'moderator') badges.push({ id: 'admin', label: 'ADMIN', color: '#00FF94', desc: "Verified Platform Operative." });

  // LOYALTY (Launched March 8, 2026)
  const joinDate = stats.createdAt?.toDate() || new Date();
  if (joinDate.toDateString() === new Date("2026-03-08").toDateString()) {
    badges.push({ id: 'veteran', label: '1ST DAY-ER', color: '#8b5cf6', desc: "Synchronized on Launch Day." });
  }

  // ACADEMIC
  const avg = stats.subjects?.length > 0 
    ? stats.subjects.reduce((acc: number, s: any) => {
        const score = parseFloat(s.grade);
        return acc + (isNaN(score) ? 10 : score); // Xuất sắc = 10 fallback
      }, 0) / stats.subjects.length 
    : 0;
  if (avg >= 9.0) badges.push({ id: 'weapon', label: 'ACADEMIC WEAPON', color: '#ef4444', desc: "Neural Transcript Average ≥ 9.0." });

  // FOCUS TIME
  const hours = (stats.totalSeconds || 0) / 3600;
  if (hours >= 1) badges.push({ id: 'init', label: 'INITIATE', color: '#94a3b8', desc: "1+ Hour of Focus." });
  if (hours >= 10) badges.push({ id: 'spec', label: 'SPECIALIST', color: '#fbbf24', desc: "10+ Hours of Focus." });
  if (hours >= 50) badges.push({ id: 'elite', label: 'ELITE', color: '#00FF94', desc: "50+ Hours of Focus." });
  if (hours >= 100) badges.push({ id: 'omega', label: 'OMEGA', color: '#ffffff', desc: "100+ Hours of Focus." });

  return badges;
};