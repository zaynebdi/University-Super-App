"use client";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import {
  AlertCircle,
  AlertTriangle,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Loader2,
  TrendingUp,
  XCircle,
} from "lucide-react";

import { api, type StudentAttendanceSummaryDTO } from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";
import { MIN_ATTENDANCE_PERCENTAGE } from "@/lib/constants";

function getProgressClass(percentage: number) {
  if (percentage < MIN_ATTENDANCE_PERCENTAGE) {
    return "bg-red-500";
  }

  if (percentage >= 90) {
    return "bg-emerald-500";
  }

  if (percentage >= 85) {
    return "bg-indigo-500";
  }

  return "bg-amber-500";
}

function getStatusClass(belowThreshold: boolean) {
  if (belowThreshold) {
    return "bg-red-50 text-red-600";
  }

  return "bg-emerald-50 text-emerald-600";
}

export default function AttendancePage() {
  const { data, loading, error } = useApiResource<
    StudentAttendanceSummaryDTO[]
  >(async () => {
    const me = await api.students.me();
    return api.attendance.byStudent(me.id);
  });

  const courses = data ?? [];

  const totalAttended = courses.reduce(
    (sum, course) => sum + course.present,
    0,
  );

  const totalClasses = courses.reduce((sum, course) => sum + course.total, 0);

  const overallPercentage = totalClasses
    ? Math.round((totalAttended / totalClasses) * 100)
    : 0;

  const meetsMinimum = overallPercentage >= MIN_ATTENDANCE_PERCENTAGE;

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

                <p
                  className={`mt-2 text-[11px] ${
                    meetsMinimum ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {meetsMinimum
                    ? "Above minimum requirement"
                    : "Below minimum requirement"}
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

                <p className="mt-2 text-3xl font-bold text-gray-950">
                  {MIN_ATTENDANCE_PERCENTAGE}%
                </p>

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

          {loading ? (
            <div className="flex items-center gap-2 px-6 py-8 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" /> Loading attendance…
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 px-6 py-8 text-sm text-red-600">
              <AlertCircle size={16} /> {error}
            </div>
          ) : courses.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-500">
              No attendance records yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-212.5">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Course
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
                  {courses.map((course) => (
                    <tr
                      key={course.courseId}
                      className="transition hover:bg-gray-50"
                    >
                      {/* Course */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-[10px] font-bold text-indigo-600">
                            {course.course.code.split("-")[0]}
                          </div>

                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {course.course.title}
                            </p>

                            <p className="mt-0.5 text-[11px] font-medium text-gray-400">
                              {course.course.code}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Classes */}
                      <td className="px-6 py-5 text-center text-sm font-semibold text-gray-700">
                        {course.present}/{course.total}
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
                            course.belowThreshold,
                          )}`}
                        >
                          {course.belowThreshold ? "Below Minimum" : "Good"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

          <div className="px-6 py-10 text-center text-sm text-gray-400">
            No recent attendance records available.
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
