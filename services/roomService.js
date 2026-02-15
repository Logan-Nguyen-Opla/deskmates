import axios from 'axios';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const createDeskmatesRoom = async (title, user) => {
  // MUST use NEXT_PUBLIC_ for client-side deployment
  const API_KEY = process.env.NEXT_PUBLIC_WHEREBY_API_KEY;
  
  if (!API_KEY) {
    console.error("CRITICAL: WHEREBY_API_KEY is missing from environment.");
    throw new Error("Configuration Error");
  }

  try {
    const sessionEnd = new Date(Date.now() + 14400000).toISOString(); // 4 hours from now

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
    const ROOMS_PATH = 'artifacts/deskmates-online/public/data/rooms';
    
    await addDoc(collection(db, ROOMS_PATH), {
      title: title.toUpperCase(),
      hostUrl: hostUrl,
      userUrl: roomUrl,
      moderatorId: user.uid,
      moderator: user.displayName || user.email,
      status: 'live',
      participants: 0,
      createdAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("WHEREBY_ERROR_LOG:", error.response?.data || error.message);
    throw error;
  }
};