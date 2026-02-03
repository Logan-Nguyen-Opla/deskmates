import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebaseConfig'; // Your Firebase init file
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch live rooms from the path in your Firestore schema 
  useEffect(() => {
    const roomsRef = collection(db, 'artifacts/deskmates-online/public/data/rooms');
    const q = query(roomsRef, where('status', '==', 'live')); // Only show live sessions 

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRooms(roomData);
      setLoading(setLoading(false));
    });

    return () => unsubscribe();
  }, []);

  // 2. The Fix: Open Whereby links instead of Jitsi
  const handleJoin = (room) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return alert("Please log in first!");

    // Check if user is the moderator or in Godmode 
    const isModerator = currentUser.uid === room.moderatorId;
    const isGodmode = currentUser.email === 'your-admin-email@example.com'; // Add your logic here

    // Use hostUrl for privileged users to bypass the moderator wall, userUrl for others
    const finalUrl = (isModerator || isGodmode) ? room.hostUrl : room.userUrl;

    if (finalUrl) {
      window.open(finalUrl, '_blank');
    } else {
      alert("This is an old Jitsi room and cannot be opened. Please create a new room.");
    }
  };

  if (loading) return <div>Loading Deskmates...</div>;

  return (
    <div className="room-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', padding: '20px' }}>
      {rooms.map((room) => (
        <div key={room.id} className="room-card" style={{ border: '1px solid #333', padding: '20px', borderRadius: '12px', background: '#1a1a1a', color: 'white' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>{room.title}</h3> {/* cite: 7 */}
          <p style={{ fontSize: '0.9rem', color: '#aaa' }}>Host: {room.moderator}</p> {/* cite: 7 */}
          
          <div style={{ margin: '15px 0', display: 'flex', gap: '5px' }}>
            {room.tags?.map(tag => (
              <span key={tag} style={{ background: '#333', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{tag}</span>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>👤 {room.participants}/{room.maxParticipants}</span> {/* cite: 7 */}
            <button 
              onClick={() => handleJoin(room)}
              style={{ background: '#007bff', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
            >
              Join Room
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomList;