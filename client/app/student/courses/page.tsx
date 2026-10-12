"use client";

import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock3,
  GraduationCap,
  Loader2,
  Search,
  UserRound,
} from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import {
  api,
  type EnrolledCourseDTO,
  type StudentResultsDTO,
  type StudentAttendanceSummaryDTO,
  type TimetableEntryDTO,
} from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";

type Data = {
  courses: EnrolledCourseDTO[];
  results: StudentResultsDTO;
  attendance: StudentAttendanceSummaryDTO[];
  timetable: TimetableEntryDTO[];
};

export default function CoursesPage() {
  const { data, loading, error } = useApiResource<Data>(async () => {
    const me = await api.students.me();
    const [courses, results, attendance, timetable] = await Promise.all([
      api.students.courses(me.id),
      api.results.byStudent(me.id),
      api.attendance.byStudent(me.id),
      api.timetable.me(),
    ]);
    return { courses, results, attendance, timetable };
  });

  const courses = data?.courses ?? [];
  const gradeByCourse = new Map(
    (data?.results.results ?? []).map((r) => [r.courseId, r.grade])
  );
  const attendanceByCourse = new Map(
    (data?.attendance ?? []).map((a) => [a.courseId, a.percentage])
  );
  const timetableByCourse = new Map<string, TimetableEntryDTO>();
  (data?.timetable ?? []).forEach((entry) => {
    if (entry.courseId && !timetableByCourse.has(entry.courseId)) {
      timetableByCourse.set(entry.courseId, entry);
    }
  });

  const totalCredits = courses.reduce((sum, c) => sum + c.creditHours, 0);
  const overallAttendance = data?.attendance.length
    ? Math.round(
        data.attendance.reduce((s, a) => s + a.percentage, 0) /
          data.attendance.length
      )
    : 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-375">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600">
              Academics
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-gray-950">
              My Courses
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage your current semester courses and academic progress.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-500">
            <GraduationCap size={16} className="text-indigo-500" />
            Fall 2026
          </div>
        </div>

        {error && (
          <Card className="mb-5 border-red-100 p-5 text-sm text-red-600">
            {error}
          </Card>
        )}

        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Overview
            icon={<BookOpen size={18} />}
            label="Enrolled Courses"
            value={String(courses.length)}
            description={`${totalCredits} total credits`}
          />
          <Overview
            icon={<GraduationCap size={18} />}
            label="Cumulative GPA"
            value={data ? data.results.gpa.toFixed(2) : "—"}
            description="Based on recorded results"
          />
          <Overview
            icon={<CalendarDays size={18} />}
            label="Attendance"
            value={`${overallAttendance}%`}
            description="Across all courses"
          />
          <Overview
            icon={<Clock3 size={18} />}
            label="Scheduled Classes"
            value={String(data?.timetable.length ?? 0)}
            description="Weekly sessions"
          />
        </div>

        <Card className="mb-5 p-3">
          <div className="flex items-center gap-3 px-2">
            <Search size={18} className="text-gray-400" />
            <input
              placeholder="Search courses by name or code..."
              className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-gray-400"
            />
          </div>
        </Card>

        {loading ? (
          <Card className="flex items-center gap-2 p-8 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" /> Loading courses…
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => {
              const slot = timetableByCourse.get(course.id);
              const attendance = attendanceByCourse.get(course.id);
              const grade = gradeByCourse.get(course.id);
              return (
                <Link
                  key={course.id}
                  href={`/student/courses/${course.id}`}
                  className="group"
                >
                  <Card className="h-full overflow-hidden transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/40">
                    <div className="h-1.5 bg-indigo-500" />
                    <div className="p-5">
                      <div className="mb-5 flex items-start justify-between">
                        <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                          <BookOpen size={20} />
                        </div>
                        {grade && (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                            {grade}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-500">
                        {course.code}
                      </p>
                      <h2 className="mt-1 text-lg font-bold tracking-tight text-gray-950">
                        {course.title}
                      </h2>

                      <div className="mt-4 space-y-2.5">
                        <Info
                          icon={<UserRound size={14} />}
                          text={course.teacher?.name ?? "Unassigned"}
                        />
                        <Info
                          icon={<CalendarDays size={14} />}
                          text={
                            slot
                              ? `${slot.day} · ${slot.startTime}`
                              : "No scheduled slot"
                          }
                        />
                        <Info
                          icon={<BookOpen size={14} />}
                          text={`${course.creditHours} credits${
                            slot?.room ? ` · ${slot.room}` : ""
                          }`}
                        />
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                        <span className="text-xs font-medium text-gray-400">
                          {attendance === undefined
                            ? "No attendance yet"
                            : `Attendance ${attendance}%`}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 transition group-hover:gap-2">
                          View course
                          <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}

            {courses.length === 0 && (
              <Card className="p-8 text-center text-sm text-gray-500 md:col-span-2 xl:col-span-3">
                You are not enrolled in any courses yet.
              </Card>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Overview({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
            {value}
          </p>
          <p className="mt-1 text-[11px] text-gray-400">{description}</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      </div>
    </Card>
  );
}

function Info({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className="text-gray-400">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
