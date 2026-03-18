"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export default function RoomPage() {
  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState<any>(null);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // Safely extract and type the roomId
  const rawId = params?.id;
  const roomId = (Array.isArray(rawId) ? rawId[0] : rawId) as string | undefined;
  const sessionId = searchParams.get('sessionId');

  useEffect(() => {
    // Check for roomId existence to prevent doc() errors
    if (!roomId) {
      console.error("Room ID is missing.");
      router.push('/');
      return;
    }

    let unsubRoom: (() => void) | null = null;

    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // Initialize room data listener
        unsubRoom = onSnapshot(
          doc(db, 'rooms', roomId), // Fixed: roomId is now verified
          (snap) => {
            if (!snap.exists()) {
              alert("Room not found.");
              router.push('/');
            } else {
              setRoomData(snap.data());
              setLoading(false); // SUCCESS: Release spinner
            }
          },
          (error) => {
            console.error("Firebase Error:", error);
            setLoading(false); // ERROR: Release spinner even on failure
            router.push('/');
          }
        );
      } catch (err) {
        console.error("Initialization Error:", err);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubRoom) unsubRoom();
    };
  }, [roomId, router]);

  if (loading || !roomData) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center font-mono">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mb-4" />
        <p className="text-yellow-500 uppercase tracking-widest">Synchronizing Channel...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white p-10">
      <h1 className="text-2xl font-bold uppercase">{roomData.title}</h1>
      {/* Additional UI and Video Iframe Logic here */}
    </div>
  );
}