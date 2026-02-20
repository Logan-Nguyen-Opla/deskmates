// utils/roles.ts
export type UserRole = {
  isFounder: boolean;      
  canManageRooms: boolean; 
  rank: string;
};

export const getRole = (user: any, userData: any): UserRole => {
  const email = user?.email?.toLowerCase();
  
  // THE HARDCODED TRUTH
  const isLogan = email === "logan.nguyen.opla@gmail.com";
  
  // DB CHECK: For secondary moderators you approve
  const isApprovedMod = userData?.role === 'admin' || userData?.role === 'moderator';

  return {
    isFounder: isLogan || userData?.isFounder === true,
    // GOD MODE: If you are Logan, you don't need "approval"
    canManageRooms: isLogan || isApprovedMod,
    rank: isLogan ? "FOUNDER" : (userData?.role?.toUpperCase() || "AGENT")
  };
};