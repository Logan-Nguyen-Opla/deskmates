// Add this import at the top
import { WherebyService } from '@/services/wherebyService';

// Replace the handleCreateRoom function inside AdminDashboard:
const handleCreateRoom = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user) return;
  try {
    // 1. Create Whereby Room first
    const wherebyData = await WherebyService.createMeeting();

    // 2. Save to Firestore
    await addDoc(collection(db, 'rooms'), {
      title,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      moderator: role === 'founder' ? "★ FOUNDER" : (user.displayName || "Moderator"),
      moderatorId: user.uid,
      participants: 0,
      status: 'active',
      createdAt: serverTimestamp(),
      isHot: role === 'founder',
      // NEW WHEREBY FIELDS
      userUrl: wherebyData.userUrl,
      hostUrl: wherebyData.hostUrl,
      meetingId: wherebyData.meetingId
    });
    
    setTitle('');
    setTags('');
    alert("Whereby Protocol Initiated.");
  } catch (error) {
    alert("System Error: Could not deploy Whereby room.");
  }
};