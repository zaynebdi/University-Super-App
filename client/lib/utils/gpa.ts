import { GradePoints } from "@/lib/constants";

export interface GradeEntry {
  grade: string;
  creditHours: number;
}

export function calculateGPA(grades: GradeEntry[]): number {
  if (grades.length === 0) return 0;

  let totalPoints = 0;
  let totalCredits = 0;

  for (const { grade, creditHours } of grades) {
    const points = GradePoints[grade] ?? 0;
    totalPoints += points * creditHours;
    totalCredits += creditHours;
  }

  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

export function getGradePoints(grade: string): number {
  return GradePoints[grade] ?? 0;
}