import axios from 'axios';

export const WherebyService = {
  async createMeeting() {
    try {
      const response = await axios.post('https://api.whereby.dev/v1/meetings', {
        endDate: "2099-12-31T23:59:59Z", // Persistent room
        isLocked: false,
        fields: ["hostRoomUrl"] // Essential for Mod/Godmode bypass
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.WHEREBY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      return {
        meetingId: response.data.meetingId,
        userUrl: response.data.roomUrl,      // For regular participants
        hostUrl: response.data.hostRoomUrl  // For Moderators & Godmode
      };
    } catch (err) {
      console.error("Whereby API Error:", err.response?.data || err.message);
      throw err;
    }
  }
};