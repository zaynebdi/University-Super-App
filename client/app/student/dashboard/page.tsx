"use client";

import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Loader2,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import {
  api,
  type AnnouncementDTO,
  type EnrolledCourseDTO,
  type StudentAttendanceSummaryDTO,
  type StudentProfileDTO,
  type StudentResultsDTO,
  type TimetableEntryDTO,
} from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";

type Data = {
  profile: StudentProfileDTO;
  courses: EnrolledCourseDTO[];
  results: StudentResultsDTO;
  attendance: StudentAttendanceSummaryDTO[];
  timetable: TimetableEntryDTO[];
  announcements: AnnouncementDTO[];
};

export default function StudentDashboard() {
  const { data, loading, error } = useApiResource<Data>(async () => {
    const profile = await api.students.me();
    const [courses, results, attendance, timetable, announcements] =
      await Promise.all([
        api.students.courses(profile.id),
        api.results.byStudent(profile.id),
        api.attendance.byStudent(profile.id),
        api.timetable.me(),
        api.announcements.list(),
      ]);
    return { profile, courses, results, attendance, timetable, announcements };
  });

  const courses = data?.courses ?? [];
  const attendance = data?.attendance ?? [];
  const timetable = data?.timetable ?? [];
  const announcements = data?.announcements ?? [];
  const totalCredits = courses.reduce((sum, c) => sum + c.creditHours, 0);
  const overallAttendance = attendance.length
    ? Math.round(
        attendance.reduce((sum, a) => sum + a.percentage, 0) /
          attendance.length
      )
    : 0;
  const attendanceByCourse = new Map(
    attendance.map((a) => [a.courseId, a.percentage])
  );
  const needsAttention = attendance.filter((a) => a.belowThreshold);
  const gpa = data?.results.gpa ?? 0;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const todayName = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });
  const todayClasses = timetable.filter((entry) => entry.day === todayName);

  return (
    <AppShell>
      <div className="mx-auto max-w-375">
        {/* Header */}
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600">
              UniSphere{data ? ` · ${today}` : ""}
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-gray-950">
              Good evening
              {data?.profile.name ? `, ${data.profile.name}` : ""} 👋
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Here&apos;s what&apos;s happening across your academic journey.
            </p>
          </div>

          <button className="inline-flex w-fit items-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-gray-950/10 transition hover:bg-gray-800">
            <Sparkles size={16} />
            Quick Action
          </button>
        </div>

        {/* Hero */}
        <section className="relative mb-5 overflow-hidden rounded-3xl bg-linear-to-br from-[#312e81] via-[#4338ca] to-[#6366f1] p-7 text-white shadow-xl shadow-indigo-900/10">
          <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-violet-300/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-medium backdrop-blur">
                <BrainCircuit size={14} />
                AI INSIGHT · Personalized for you
              </div>

              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Your academic
                <br />
                command center.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-indigo-100">
                You&apos;re enrolled in {courses.length}{" "}
                {courses.length === 1 ? "course" : "courses"} with{" "}
                {overallAttendance}% average attendance this semester.
              </p>
            </div>

            <div className="min-w-52.5 rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-xs text-indigo-200">Semester GPA</p>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  {data ? gpa.toFixed(2) : "—"}
                </span>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white"
                  style={{
                    width: `${data ? Math.min(Math.max((gpa / 4) * 100, 0), 100) : 0}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-[11px] text-indigo-200">Out of 4.00</p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Current GPA"
            value={data ? gpa.toFixed(2) : "—"}
            description="Based on recorded results"
            icon={TrendingUp}
          />

          <StatCard
            label="Attendance"
            value={`${overallAttendance}%`}
            description="Average across your courses"
            icon={ClipboardCheck}
          />

          <StatCard
            label="Enrolled Courses"
            value={String(courses.length)}
            description={`${totalCredits} total credits`}
            icon={BookOpen}
          />

          <StatCard
            label="Scheduled Classes"
            value={String(timetable.length)}
            description="Weekly sessions"
            icon={GraduationCap}
          />
        </div>

        {error && (
          <Card className="mt-5 flex items-center gap-2 p-5 text-sm text-red-600">
            <AlertCircle size={16} /> {error}
          </Card>
        )}

        {loading ? (
          <Card className="mt-5 flex items-center gap-2 p-8 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" /> Loading dashboard…
          </Card>
        ) : (
          <>
            {/* Main grid */}
            <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
              {/* Academic Progress */}
              <Card className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-950">
                      Academic progress
                    </h3>
                    <p className="mt-1 text-xs text-gray-400">
                      Current semester performance
                    </p>
                  </div>

                  <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-50">
                    <ArrowUpRight size={17} />
                  </button>
                </div>

                <div className="space-y-6">
                  {courses.map((course) => {
                    const value = attendanceByCourse.get(course.id) ?? 0;
                    return (
                      <div key={course.id}>
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {course.title}
                            </p>
                            <p className="mt-0.5 text-[10px] text-gray-400">
                              {course.code}
                            </p>
                          </div>

                          <span className="text-xs font-bold text-gray-700">
                            {value}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {courses.length === 0 && (
                    <p className="text-sm text-gray-400">
                      You are not enrolled in any courses yet.
                    </p>
                  )}
                </div>
              </Card>

              {/* Schedule */}
              <Card className="p-6">
                <div className="mb-6">
                  <h3 className="font-bold text-gray-950">
                    Today&apos;s schedule
                  </h3>
                  <p className="mt-1 text-xs text-gray-400">{today}</p>
                </div>

                <div className="space-y-2">
                  {todayClasses.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 rounded-xl border border-transparent bg-gray-50 p-3.5"
                    >
                      <div className="w-11 pt-0.5 text-xs font-bold text-gray-500">
                        {item.startTime}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {item.course?.title ?? "Class"}
                        </p>

                        <p className="mt-1 text-[11px] text-gray-400">
                          {item.room} · {item.startTime}–{item.endTime}
                        </p>
                      </div>
                    </div>
                  ))}

                  {todayClasses.length === 0 && (
                    <p className="text-sm text-gray-400">
                      No classes scheduled today.
                    </p>
                  )}
                </div>
              </Card>
            </div>

            {/* Bottom grid */}
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <Card className="p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                    <BrainCircuit size={19} />
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-950">
                      Recommended for you
                    </h3>
                    <p className="text-xs text-gray-400">
                      Based on your academic activity
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {needsAttention.map((item) => (
                    <Recommendation
                      key={item.courseId}
                      icon={<BookOpen size={17} />}
                      title={item.course.title}
                      description={`Attendance ${item.percentage}% · below requirement`}
                    />
                  ))}

                  {needsAttention.length === 0 && (
                    <p className="text-sm text-gray-400">
                      No courses need attention right now.
                    </p>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CalendarDays size={19} />
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-950">Quick overview</h3>
                    <p className="text-xs text-gray-400">
                      Important university updates
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {announcements.slice(0, 3).map((item) => (
                    <Overview
                      key={item.id}
                      title={item.title}
                      description={`${item.author?.name ?? "University"} · ${new Date(
                        item.createdAt
                      ).toLocaleDateString()}`}
                    />
                  ))}

                  {announcements.length === 0 && (
                    <p className="text-sm text-gray-400">
                      No announcements yet.
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function Recommendation({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3.5 transition hover:border-indigo-100 hover:bg-indigo-50/40">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gray-100 text-gray-600">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="mt-1 text-[11px] leading-4 text-gray-400">
          {description}
        </p>
      </div>

      <ArrowUpRight size={15} className="shrink-0 text-gray-400" />
    </div>
  );
}

function Overview({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-gray-50 p-3.5">
      <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-500" />

      <div>
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="mt-1 text-[11px] text-gray-400">{description}</p>
      </div>
    </div>
  );
}
