export const USER_ROLES = ["student", "teacher", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];

export const ATTENDANCE_STATUSES = ["present", "absent"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const ATTENDANCE_MIN_PERCENT = 75;

export const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  F: 0.0,
};

export const GRADES = Object.keys(GRADE_POINTS);

const GRADE_THRESHOLDS: { min: number; grade: string }[] = [
  { min: 90, grade: "A+" },
  { min: 85, grade: "A" },
  { min: 80, grade: "A-" },
  { min: 75, grade: "B+" },
  { min: 71, grade: "B" },
  { min: 68, grade: "B-" },
  { min: 64, grade: "C+" },
  { min: 60, grade: "C" },
  { min: 57, grade: "C-" },
  { min: 53, grade: "D+" },
  { min: 50, grade: "D" },
];

export function gradeFromMarks(marks: number): string {
  return GRADE_THRESHOLDS.find((t) => marks >= t.min)?.grade ?? "F";
}
