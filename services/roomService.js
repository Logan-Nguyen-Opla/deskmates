import { db } from '../lib/firebase';
import { WherebyService } from './wherebyService';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// THIS IS THE EXACT PATH FROM YOUR WORD DOC 
const ROOMS_COLLECTION_PATH = 'artifacts/deskmates-online/public/data/rooms';

export const createDeskmatesRoom = async (roomTitle, user) => {
  // 1. Generate the unique Whereby URLs
  const wherebyData = await WherebyService.createMeeting();

  // 2. Prepare the payload based on your Firestore Schema [cite: 7]
  const roomPayload = {
    title: roomTitle,                  // [cite: 7]
    moderator: user.displayName,       // [cite: 7]
    moderatorId: user.uid,             // [cite: 7]
    status: 'live',                    // [cite: 7]
    participants: 1,                   // [cite: 7]
    maxParticipants: 20,               // [cite: 7]
    isHot: false,                      // [cite: 7]
    createdAt: serverTimestamp(),      // [cite: 7]
    // Add these new fields to handle the video [cite: 7]
    meetingId: wherebyData.meetingId,
    userUrl: wherebyData.userUrl,
    hostUrl: wherebyData.hostUrl
  };

  // 3. Save to the path specified in your docs 
  const docRef = await addDoc(collection(db, ROOMS_COLLECTION_PATH), roomPayload);
  return docRef.id;
};