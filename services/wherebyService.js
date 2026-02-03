import axios from 'axios';

export const WherebyService = {
  async createMeeting() {
    try {
      const response = await axios.post('https://api.whereby.dev/v1/meetings', {
        endDate: "2099-12-31T23:59:59Z",
        isLocked: false,
        fields: ["hostRoomUrl"] 
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.WHEREBY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      return {
        meetingId: response.data.meetingId,
        userUrl: response.data.roomUrl,
        hostUrl: response.data.hostRoomUrl
      };
    } catch (err) {
      console.error("Whereby API Error:", err);
      throw err;
    }
  }
};