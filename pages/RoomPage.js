// src/pages/RoomPage.js
import React, { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import MeetingRoom from '../components/MeetingRoom';

const RoomPage = ({ roomId, currentUserId }) => {
  const [roomData, setRoomData] = useState(null);

  useEffect(() => {
    // Fetch the room data from the path in your schema [cite: 5, 6]
    const fetchRoom = async () => {
      const docRef = doc(db, 'artifacts/deskmates-online/public/data/rooms', roomId);
      const snap = await getDoc(docRef);
      if (snap.exists()) setRoomData(snap.data());
    };
    fetchRoom();
  }, [roomId]);

  if (!roomData) return <div>Loading...</div>;

  // This is the "Hook": Pass the hostUrl/userUrl logic to the iframe component
  // Use 'moderator' if the current user created it, otherwise 'user'
  const role = currentUserId === roomData.moderatorId ? 'moderator' : 'user';

  return (
    <div className="room-container">
      <h1>{roomData.title}</h1>
      <MeetingRoom 
        room={roomData} 
        role={role} 
        onEndSession={() => console.log("Nuking...")} 
      />
    </div>
  );
};