import React from 'react';

const MeetingRoom = ({ roomData, role, onNuke }) => {
  // Logic: Mods and Godmode get the powerful Host URL
  const isPrivileged = role === 'moderator' || role === 'godmode';
  const finalUrl = isPrivileged ? roomData.hostUrl : roomData.userUrl;

  // These parameters make the UI look clean and integrated
  const params = new URLSearchParams({
    embed: 'true',
    displayNames: 'on',
    background: 'off',
    chat: 'on',
    people: 'on'
  }).toString();

  return (
    <div style={{ width: '100%', height: '85vh', position: 'relative' }}>
      <iframe
        src={`${finalUrl}?${params}`}
        allow="camera; microphone; fullscreen; display-capture"
        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px' }}
      />
      
      {isPrivileged && (
        <button 
          onClick={() => onNuke(roomData.meetingId)}
          style={{ position: 'absolute', top: '10px', right: '10px', background: 'red', color: 'white', border: 'none', padding: '10px', cursor: 'pointer', borderRadius: '5px' }}
        >
          FORCE END SESSION
        </button>
      )}
    </div>
  );
};

export default MeetingRoom;