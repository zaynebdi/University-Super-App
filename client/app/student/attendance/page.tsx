"use client";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import {
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

const attendanceData = [
  {
    code: "SE-401",
    name: "Software Architecture",
    instructor: "Dr. Ahmed Khan",
    attended: 17,
    total: 18,
    percentage: 94,
    status: "Good",
  },
  {
    code: "AI-402",
    name: "Artificial Intelligence",
    instructor: "Dr. Sara Malik",
    attended: 16,
    total: 18,
    percentage: 89,
    status: "Good",
  },
  {
    code: "CS-405",
    name: "Cyber Security",
    instructor: "Prof. Hassan Raza",
    attended: 17,
    total: 18,
    percentage: 94,
    status: "Good",
  },
  {
    code: "SE-406",
    name: "Web Engineering",
    instructor: "Dr. Ali Hassan",
    attended: 16,
    total: 18,
    percentage: 89,
    status: "Good",
  },
  {
    code: "SE-407",
    name: "Software Testing",
    instructor: "Dr. Usman Tariq",
    attended: 15,
    total: 18,
    percentage: 83,
    status: "Warning",
  },
  {
    code: "DS-408",
    name: "Distributed Systems",
    instructor: "Dr. Hamza Ahmed",
    attended: 15,
    total: 18,
    percentage: 83,
    status: "Warning",
  },
];

const recentRecords = [
  {
    date: "24 Sep 2026",
    day: "Thursday",
    course: "SE-401",
    name: "Software Architecture",
    status: "Present",
  },
  {
    date: "24 Sep 2026",
    day: "Thursday",
    course: "AI-402",
    name: "Artificial Intelligence",
    status: "Present",
  },
  {
    date: "23 Sep 2026",
    day: "Wednesday",
    course: "CS-405",
    name: "Cyber Security",
    status: "Present",
  },
  {
    date: "23 Sep 2026",
    day: "Wednesday",
    course: "SE-407",
    name: "Software Testing",
    status: "Absent",
  },
  {
    date: "22 Sep 2026",
    day: "Tuesday",
    course: "SE-406",
    name: "Web Engineering",
    status: "Late",
  },
  {
    date: "22 Sep 2026",
    day: "Tuesday",
    course: "DS-408",
    name: "Distributed Systems",
    status: "Present",
  },
];

function getProgressClass(percentage: number) {
  if (percentage >= 90) {
    return "bg-emerald-500";
  }

  if (percentage >= 85) {
    return "bg-indigo-500";
  }

  return "bg-amber-500";
}

function getStatusClass(status: string) {
  if (status === "Good") {
    return "bg-emerald-50 text-emerald-600";
  }

  return "bg-amber-50 text-amber-600";
}

export default function AttendancePage() {
  const totalAttended = attendanceData.reduce(
    (sum, course) => sum + course.attended,
    0,
  );

  const totalClasses = attendanceData.reduce(
    (sum, course) => sum + course.total,
    0,
  );

  const overallPercentage = Math.round((totalAttended / totalClasses) * 100);

  return (
    <AppShell>
      <div className="mx-auto max-w-375">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600">
            <CalendarCheck2 size={15} />
            Academic Performance
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-950">
            Attendance
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Monitor your attendance across all enrolled courses.
          </p>
        </div>

        {/* Summary cards */}
        <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Overall */}
          <Card className="relative overflow-hidden p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Overall Attendance
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                  {overallPercentage}%
                </p>

                <p className="mt-2 text-[11px] text-emerald-600">
                  Above minimum requirement
                </p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <TrendingUp size={18} />
              </div>
            </div>
          </Card>

          {/* Present */}
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Classes Attended
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-950">
                  {totalAttended}
                </p>

                <p className="mt-2 text-[11px] text-gray-400">
                  Out of {totalClasses} classes
                </p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={18} />
              </div>
            </div>
          </Card>

          {/* Absent */}
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Classes Missed
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-950">
                  {totalClasses - totalAttended}
                </p>

                <p className="mt-2 text-[11px] text-gray-400">
                  Across all courses
                </p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-500">
                <XCircle size={18} />
              </div>
            </div>
          </Card>

          {/* Requirement */}
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Required Minimum
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-950">75%</p>

                <p className="mt-2 text-[11px] text-gray-400">
                  University attendance policy
                </p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
                <AlertTriangle size={18} />
              </div>
            </div>
          </Card>
        </div>

        {/* Course attendance */}
        <Card className="mb-7 overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-base font-bold text-gray-950">
              Course Attendance
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Current semester attendance breakdown
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-212.5">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Course
                  </th>

                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Instructor
                  </th>

                  <th className="px-6 py-4 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Classes
                  </th>

                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Attendance
                  </th>

                  <th className="px-6 py-4 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {attendanceData.map((course) => (
                  <tr key={course.code} className="transition hover:bg-gray-50">
                    {/* Course */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-[10px] font-bold text-indigo-600">
                          {course.code.split("-")[0]}
                        </div>

                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {course.name}
                          </p>

                          <p className="mt-0.5 text-[11px] font-medium text-gray-400">
                            {course.code}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Instructor */}
                    <td className="px-6 py-5 text-xs text-gray-500">
                      {course.instructor}
                    </td>

                    {/* Classes */}
                    <td className="px-6 py-5 text-center text-sm font-semibold text-gray-700">
                      {course.attended}/{course.total}
                    </td>

                    {/* Progress */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-2 min-w-32.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={`h-full rounded-full ${getProgressClass(
                              course.percentage,
                            )}`}
                            style={{
                              width: `${course.percentage}%`,
                            }}
                          />
                        </div>

                        <span className="w-10 text-right text-xs font-bold text-gray-700">
                          {course.percentage}%
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5 text-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-semibold ${getStatusClass(
                          course.status,
                        )}`}
                      >
                        {course.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent attendance */}
        <Card className="overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <Clock3 size={18} />
              </div>

              <div>
                <h2 className="text-base font-bold text-gray-950">
                  Recent Attendance
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Your latest attendance records
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {recentRecords.map((record, index) => (
              <div
                key={`${record.date}-${record.course}-${index}`}
                className="flex flex-col gap-3 px-6 py-4 transition hover:bg-gray-50 sm:flex-row sm:items-center"
              >
                {/* Date */}
                <div className="w-37.5">
                  <p className="text-xs font-semibold text-gray-800">
                    {record.date}
                  </p>

                  <p className="mt-0.5 text-[10px] text-gray-400">
                    {record.day}
                  </p>
                </div>

                {/* Course */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-600">
                      {record.course}
                    </span>

                    <span className="text-sm font-semibold text-gray-800">
                      {record.name}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div>
                  {record.status === "Present" && (
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-600">
                      <CheckCircle2 size={12} />
                      Present
                    </span>
                  )}

                  {record.status === "Absent" && (
                    <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-semibold text-red-500">
                      <XCircle size={12} />
                      Absent
                    </span>
                  )}

                  {record.status === "Late" && (
                    <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-semibold text-amber-600">
                      <Clock3 size={12} />
                      Late
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
