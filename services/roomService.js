import axios from 'axios';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const createDeskmatesRoom = async (title, user) => {
  const WHEREBY_API_KEY = process.env.NEXT_PUBLIC_WHEREBY_API_KEY || process.env.WHEREBY_API_KEY;
  
  // 1. Create the Whereby Meeting via API
  try {
    const response = await axios.post(
      'https://api.whereby.dev/v1/meetings',
      {
        endDate: new Date(Date.now() + 3600000 * 4).toISOString(), // 4 hours from now
        isLocked: true,
        roomMode: "normal"
      },
      {
        headers: {
          Authorization: `Bearer ${WHEREBY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { hostUrl, roomUrl } = response.data;

    // 2. Save Room Data to Firestore
    // Using the path from your Master Plan
    const ROOMS_PATH = 'artifacts/deskmates-online/public/data/rooms';
    
    await addDoc(collection(db, ROOMS_PATH), {
      title: title,
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
    console.error("DETAILED DEPLOYMENT ERROR:", error.response?.data || error.message);
    throw error;
  }
};