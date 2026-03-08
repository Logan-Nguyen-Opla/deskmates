// utils/reputation.ts

export const REPUTATION_RULES = {
  VIOLATIONS: [
    { label: "No-Show (Reservation)", deduction: 10, desc: "Missing a session you signed up for." },
    { label: "Inappropriate Talk", deduction: 25, desc: "Disruptive or offensive communication." },
    { label: "Visual Violation", deduction: 50, desc: "Displaying prohibited content on camera." },
    { label: "Mic/Cam Bypass", deduction: 15, desc: "Attempting to use restricted hardware." },
    { label: "Protocol Abandonment", deduction: 5, desc: "Leaving session repeatedly within 10m." },
  ],
  RECOVERY: "Gain +1 Rep per 30 mins of clean focus (Max 6/day).",
  GATING: [
    { threshold: 95, restriction: "Microphone Access Terminated" },
    { threshold: 90, restriction: "Camera Access Terminated" },
    { threshold: 85, restriction: "0.5x Focus Point Multiplier" },
  ]
};

export const getReputationStatus = (rep: number) => {
  return {
    canMic: rep >= 95,
    canCamera: rep >= 90,
    multiplier: rep < 85 ? 0.5 : 1.0,
    label: rep < 85 ? "RESTRICTED" : (rep < 95 ? "CAUTION" : "OPTIMAL")
  };
};

export const VIETNAMESE_GRADES = ["Xuất sắc", "Giỏi", "Khá", "Trung bình", "Yếu"];
export const ACADEMIC_SUBJECTS = ["Math", "Literature", "English", "ComSci", "Physics", "Chemistry", "Biology"];

export const formatScore = (val: string): string => {
  if (VIETNAMESE_GRADES.includes(val)) return val;
  const num = parseFloat(val.replace(',', '.'));
  return isNaN(num) ? "0.0" : num.toFixed(1);
};