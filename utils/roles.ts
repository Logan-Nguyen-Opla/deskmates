// utils/roles.ts
export const FOUNDER_EMAILS = ["logan.nguyen.opla@gmail.com"];
export const BASE_MODERATORS = ["logan.namlongnguyen@gmail.com"];

export const getRole = (user: any, userDoc?: any) => {
  if (!user || !user.email) return 'agent';

  // 1. Check Hardcoded Founder
  if (FOUNDER_EMAILS.includes(user.email.toLowerCase())) return 'founder';

  // 2. Check Hardcoded Mods (Your test account)
  if (BASE_MODERATORS.includes(user.email.toLowerCase())) return 'moderator';

  // 3. Check Database Role (The "Approved" Mods)
  if (userDoc && userDoc.role === 'moderator') return 'moderator';

  return 'agent';
};