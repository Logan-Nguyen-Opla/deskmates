import React from 'react';

const MeetingRoom = ({ room, role, onEndSession }) => {
  // If the user is a Moderator or in Godmode, give them the hostUrl [cite: 1, 7]
  // This prevents the "Waiting for Moderator" screen you saw earlier.
  const isPrivileged = role === 'moderator' || role === 'godmode';
  const finalLink = isPrivileged ? room.hostUrl : room.userUrl;

  const uiParams = new URLSearchParams({
    embed: 'true',
    displayNames: 'on',
    background: 'off',
    chat: 'on'
  }).toString();

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <iframe
        src={`${finalLink}?${uiParams}`}
        allow="camera; microphone; fullscreen; display-capture"
        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px' }}
        title={room.title}
      />
      
      {isPrivileged && (
        <button 
          onClick={() => onEndSession(room)}
          style={{
            position: 'absolute', bottom: '20px', right: '20px',
            backgroundColor: '#ff4444', color: 'white', padding: '10px 20px',
            borderRadius: '8px', border: 'none', cursor: 'pointer', zIndex: 10
          }}
        >
          END SESSION
        </button>
      )}
    </div>
  );
};

export default MeetingRoom;