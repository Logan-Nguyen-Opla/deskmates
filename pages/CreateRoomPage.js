// src/pages/CreateRoomPage.js
import { createDeskmatesRoom } from '../services/roomService';

const handleCreateClick = async () => {
  const roomTitle = "My New Study Room"; // Get this from your input field
  const currentUser = { displayName: "YourName", uid: "123" }; // Get this from your Auth

  try {
    // This is the "Hook": It calls the service, creates the Whereby room, 
    // and saves everything to /artifacts/deskmates-online/public/data/rooms[cite: 5, 7].
    const roomId = await createDeskmatesRoom(roomTitle, currentUser);
    
    console.log("Room Created! ID is:", roomId);
    // Redirect user to the new room page or close the modal
  } catch (error) {
    alert("Creation failed. Check console.");
  }
};