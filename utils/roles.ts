// utils/roles.ts
export type UserRole = {
  isFounder: boolean;
  canManageRooms: boolean;
  rank: string;
};

export const getRole = (user: any, userData: any): UserRole => {
  const email = user?.email?.toLowerCase();
  const isLogan = email === "logan.nguyen.opla@gmail.com";
  
  return {
    isFounder: isLogan || userData?.isFounder === true,
    // GOD MODE: Logan has power regardless of DB role
    canManageRooms: isLogan || userData?.role === 'admin' || userData?.role === 'moderator',
    rank: isLogan ? "FOUNDER" : (userData?.role?.toUpperCase() || "AGENT")
  };
};