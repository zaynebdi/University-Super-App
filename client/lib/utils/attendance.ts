export interface AttendanceRecord {
  status: "present" | "absent";
}

export interface AttendanceSummary {
  total: number;
  present: number;
  percentage: number;
  belowThreshold: boolean;
}

export function calculateAttendance(records: AttendanceRecord[]): AttendanceSummary {
  const total = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const percentage = total > 0 ? (present / total) * 100 : 0;

  return {
    total,
    present,
    percentage: Math.round(percentage * 100) / 100,
    belowThreshold: percentage < 75,
  };
}