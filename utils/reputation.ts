// utils/reputation.ts

export type ReputationStatus = {
  canMic: boolean;
  canCamera: boolean;
  multiplier: number;
  label: string;
};

export const getReputationStatus = (rep: number): ReputationStatus => {
  if (rep < 85) return { canMic: false, canCamera: false, multiplier: 0.5, label: "RESTRICTED" };
  if (rep < 90) return { canMic: false, canCamera: false, multiplier: 1.0, label: "CAUTION" };
  if (rep < 95) return { canMic: false, canCamera: false, multiplier: 1.0, label: "STABLE" };
  return { canMic: true, canCamera: true, multiplier: 1.0, label: "OPTIMAL" };
};

export const VIETNAMESE_GRADES = ["Xuất sắc", "Giỏi", "Khá", "Trung bình", "Yếu"];
export const ACADEMIC_SUBJECTS = ["Math", "Literature", "English", "ComSci", "Physics", "Chemistry", "Biology"];

export const formatScore = (val: string): string => {
  if (VIETNAMESE_GRADES.includes(val)) return val;
  const num = parseFloat(val.replace(',', '.'));
  return isNaN(num) ? "0.0" : num.toFixed(1);
};