import { GRADE_POINTS } from "@/lib/constants";

export function gradePoint(grade: string): number {
  return GRADE_POINTS[grade.toUpperCase()] ?? 0;
}

/** Weighted GPA on a 4.0 scale. Returns 0 when there are no graded credits. */
export function calculateGpa(items: { grade: string; creditHours: number }[]): number {
  const totalCredits = items.reduce((sum, item) => sum + item.creditHours, 0);
  if (totalCredits === 0) return 0;

  const totalPoints = items.reduce(
    (sum, item) => sum + gradePoint(item.grade) * item.creditHours,
    0,
  );

  return Math.round((totalPoints / totalCredits) * 100) / 100;
}

/** Attendance percentage rounded to one decimal place. Returns 0 when there are no classes. */
export function attendancePercentage(present: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((present / total) * 1000) / 10;
}
