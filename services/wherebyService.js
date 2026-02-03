import axios from 'axios';

const API_BASE = 'https://api.whereby.dev/v1/meetings';

export const WherebyService = {
  /**
   * Creates a persistent room and returns both host and viewer URLs.
   */
  async createMeeting() {
    try {
      const response = await axios.post(API_BASE, {
        endDate: "2099-12-31T23:59:59Z", // Persistent
        isLocked: false,
        fields: ["hostRoomUrl"] // Essential for Moderator/Godmode access
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.WHEREBY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        meetingId: response.data.meetingId,
        userUrl: response.data.roomUrl,     // For regular participants
        hostUrl: response.data.hostRoomUrl  // For Moderators & Godmode
      };
    } catch (err) {
      console.error("Whereby Room Creation Error:", err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Deletes the meeting from Whereby's servers.
   */
  async deleteMeeting(meetingId) {
    await axios.delete(`${API_BASE}/${meetingId}`, {
      headers: { 'Authorization': `Bearer ${process.env.WHEREBY_API_KEY}` }
    });
  }
};