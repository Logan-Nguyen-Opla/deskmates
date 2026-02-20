import axios from 'axios';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const createDeskmatesRoom = async (title, user) => {
  const API_KEY = process.env.NEXT_PUBLIC_WHEREBY_API_KEY;
  
  if (!API_KEY) throw new Error("Missing Key");

  try {
    const sessionEnd = new Date(Date.now() + 14400000).toISOString(); 

    const response = await axios.post(
      'https://api.whereby.dev/v1/meetings',
      {
        endDate: sessionEnd,
        isLocked: true,
        roomMode: "normal"
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { hostUrl, roomUrl } = response.data;
    // FIX: Using "deskmate" (no 's') as the subdomain
    const finalHost = hostUrl.replace('deskmates.whereby', 'deskmate.whereby');
    const finalUser = roomUrl.replace('deskmates.whereby', 'deskmate.whereby');

    const ROOMS_PATH = 'artifacts/deskmates-online/public/data/rooms';
    
    await addDoc(collection(db, ROOMS_PATH), {
      title: title.toUpperCase(),
      hostUrl: finalHost,
      userUrl: finalUser,
      moderatorId: user.uid,
      moderator: user.displayName || user.email,
      status: 'live',
      participants: 0,
      createdAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("WHEREBY_ERROR:", error.message);
    throw error;
  }
};