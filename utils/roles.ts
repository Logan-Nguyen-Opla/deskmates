// utils/roles.ts
export type UserRole = {
  isFounder: boolean;      // Displays the aesthetic/background
  canManageRooms: boolean; // Allows creating/deleting rooms
  rank: string;
};

export const getRole = (user: any, userData: any): UserRole => {
  const email = user?.email?.toLowerCase();
  
  // Visual Founder Status (Aesthetic Only)
  const isLogan = email === "logan.nguyen.opla@gmail.com";
  
  return {
    isFounder: isLogan || userData?.isFounder === true,
    // Permissions must be explicitly granted in your database
    canManageRooms: userData?.role === 'admin' || userData?.role === 'moderator',
    rank: isLogan ? "FOUNDER" : (userData?.role?.toUpperCase() || "AGENT")
  };
};