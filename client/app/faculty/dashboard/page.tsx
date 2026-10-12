"use client";

import { useState } from "react";
import {
  Users,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Clock3,
  ArrowUpRight,
  Plus,
  Upload,
  Megaphone,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  BarChart3,
  UserCheck,
} from "lucide-react";
import Card from "@/components/ui/Card";
import {
  api,
  type AnnouncementDTO,
  type CourseDTO,
  type TeacherProfileDTO,
  type TimetableEntryDTO,
} from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";

type DashboardData = {
  me: TeacherProfileDTO;
  courses: CourseDTO[];
  studentCounts: number[];
  timetable: TimetableEntryDTO[];
  announcements: AnnouncementDTO[];
};

export default function FacultyDashboardPage() {
  const [showAllActivity, setShowAllActivity] = useState(false);
  const { data, error } = useApiResource<DashboardData>(async () => {
    const me = await api.teachers.me();
    const [courses, timetable, announcements] = await Promise.all([
      api.courses.list({ teacherId: me.id }),
      api.timetable.me(),
      api.announcements.list(),
    ]);
    const studentCounts = await Promise.all(
      courses.map((course) =>
        api.courses.students(course.id).then((students) => students.length)
      )
    );
    return { me, courses, studentCounts, timetable, announcements };
  });

  const courses = data?.courses ?? [];
  const studentCounts = data?.studentCounts ?? [];
  const totalStudents = studentCounts.reduce((sum, count) => sum + count, 0);
  const timetable = data?.timetable ?? [];
  const announcements = data?.announcements ?? [];

  const stats = [
    {
      label: "Assigned Courses",
      value: String(courses.length),
      description: "This semester",
      icon: BookOpen,
    },
    {
      label: "Total Students",
      value: String(totalStudents),
      description: "Across all courses",
      icon: Users,
    },
    {
      label: "Scheduled Classes",
      value: String(timetable.length),
      description: "Weekly sessions",
      icon: CalendarDays,
    },
    {
      label: "Pending Grading",
      value: "—",
      description: "Not available",
      icon: ClipboardCheck,
    },
  ];

  const schedule = timetable.map((entry, index) => ({
    time: entry.startTime,
    end: entry.endTime,
    course: entry.course?.title ?? "—",
    code: entry.course?.code ?? "—",
    room: entry.room,
    status: index === 0 ? "Next" : "Upcoming",
  }));

  const coursesOverview = courses.map((course, index) => ({
    code: course.code,
    name: course.title,
    students: studentCounts[index] ?? 0,
  }));

  const activities = announcements.map((item) => ({
    text: item.title,
    time: new Date(item.createdAt).toLocaleDateString(),
    icon: Megaphone,
  }));

  return (
    <div className="mx-auto max-w-375">
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-600">
            <Sparkles size={13} />
            Faculty Command Center
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-950">
            Good morning{data?.me.name ? `, ${data.me.name}` : ""} 👋
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Here&apos;s your teaching overview. You have{" "}
            <span className="font-semibold text-gray-700">
              {timetable.length} scheduled classes
            </span>{" "}
            this week.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50">
            <Upload size={15} />
            Upload Resource
          </button>

          <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700">
            <Plus size={15} />
            Create Assignment
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-linear-to-brrom-gray-950 via-gray-900 to-indigo-950 p-6 text-white shadow-xl lg:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_380px] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold text-indigo-200">
              <BarChart3 size={13} />
              Teaching Performance
            </div>

            <h2 className="max-w-xl text-2xl font-bold tracking-tight lg:text-3xl">
              Your teaching overview for this semester.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
              You are assigned to{" "}
              <span className="font-semibold text-white">
                {courses.length} courses
              </span>{" "}
              with{" "}
              <span className="font-semibold text-white">
                {totalStudents} enrolled students
              </span>
              .
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-white/35">
                  Avg. Performance
                </p>
                <p className="mt-1 text-xl font-bold">—</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-white/35">
                  Attendance
                </p>
                <p className="mt-1 text-xl font-bold">—</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-white/35">
                  Course Progress
                </p>
                <p className="mt-1 text-xl font-bold">—</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white/50">
                  Today&apos;s workload
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {timetable.length} classes
                </p>
              </div>

              <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-500/20 text-indigo-300">
                <Clock3 size={20} />
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-0 rounded-full bg-indigo-400" />
            </div>

            <div className="mt-2 flex justify-between text-[10px] text-white/35">
              <span>Teaching load</span>
              <span>—</span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-[9px] text-white/35">Classes</p>
                <p className="mt-1 font-semibold">{timetable.length}</p>
              </div>

              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-[9px] text-white/35">Students</p>
                <p className="mt-1 font-semibold">{totalStudents}</p>
              </div>

              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-[9px] text-white/35">Tasks</p>
                <p className="mt-1 font-semibold">—</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    {stat.label}
                  </p>

                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
                    {stat.value}
                  </h3>
                </div>

                <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon size={18} />
                </div>
              </div>

              <p className="mt-4 text-[11px] text-gray-400">
                {stat.description}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        {/* Today's Schedule */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 p-6">
            <div>
              <h2 className="font-semibold text-gray-950">
                Today&apos;s Schedule
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <button className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              Full timetable
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {schedule.map((item, index) => (
              <div
                key={item.code}
                className={[
                  "p-5 transition hover:bg-gray-50/70",
                  index === 0 ? "bg-indigo-50/30" : "",
                ].join(" ")}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="w-24 shrink-0">
                    <p className="text-sm font-bold text-gray-900">
                      {item.time}
                    </p>
                    <p className="mt-1 text-[10px] text-gray-400">{item.end}</p>
                  </div>

                  <div className="hidden h-12 w-px bg-gray-200 md:block" />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {item.course}
                      </h3>

                      {item.status === "Next" && (
                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-bold text-indigo-600">
                          NEXT
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400">
                      <span>{item.code}</span>
                      <span>{item.room}</span>
                    </div>
                  </div>

                  <button className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] font-semibold text-gray-600 hover:bg-gray-50">
                    <UserCheck size={14} />
                    Attendance
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Insight */}
        <Card className="overflow-hidden">
          <div className="bg-linear-to-br from-indigo-600 to-violet-700 p-6 text-white">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10">
                <Sparkles size={17} />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-100/70">
                  AI Faculty Insight
                </p>
                <h2 className="mt-0.5 font-semibold">Teaching Assistant</h2>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-white/80">
              Performance insights will appear here once assessment data is
              available for your courses.
            </p>

            <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50">
              View course insights
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="p-5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Quick Actions
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="flex items-center gap-2 rounded-xl border border-gray-200 p-3 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50">
                <UserCheck size={15} className="text-indigo-500" />
                Attendance
              </button>

              <button className="flex items-center gap-2 rounded-xl border border-gray-200 p-3 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50">
                <GraduationCap size={15} className="text-indigo-500" />
                Enter Grades
              </button>

              <button className="flex items-center gap-2 rounded-xl border border-gray-200 p-3 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50">
                <FileText size={15} className="text-indigo-500" />
                Assignment
              </button>

              <button className="flex items-center gap-2 rounded-xl border border-gray-200 p-3 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50">
                <Megaphone size={15} className="text-indigo-500" />
                Announcement
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Course Performance */}
      <div className="mt-6 grid gap-6">
        <Card className="overflow-hidden">
          <div className="border-b border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-950">
                  Course Performance
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  Current semester overview.
                </p>
              </div>

              <TrendingUp size={18} className="text-emerald-500" />
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {coursesOverview.map((course) => (
              <div key={course.code} className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold text-indigo-600">
                      {course.code}
                    </p>

                    <h3 className="mt-1 text-sm font-semibold text-gray-900">
                      {course.name}
                    </h3>
                  </div>

                  <span className="text-xs font-semibold text-gray-500">
                    {course.students} students
                  </span>
                </div>
              </div>
            ))}

            {coursesOverview.length === 0 && (
              <div className="p-5 text-center text-xs text-gray-400">
                No courses assigned yet.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Activity */}
      <Card className="mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <div>
            <h2 className="font-semibold text-gray-950">
              Recent Student Activity
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Latest activity across your courses.
            </p>
          </div>

          <button
            onClick={() => setShowAllActivity(!showAllActivity)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            {showAllActivity ? "Show less" : "View all"}
          </button>
        </div>

        <div className="grid gap-0 md:grid-cols-2 xl:grid-cols-4">
          {activities
            .slice(0, showAllActivity ? activities.length : 4)
            .map((activity) => {
              const Icon = activity.icon;

              return (
                <div
                  key={activity.text}
                  className="border-b border-gray-100 p-5 last:border-b-0 md:border-r md:last:border-r-0"
                >
                  <div className="flex gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gray-100 text-gray-500">
                      <Icon size={15} />
                    </div>

                    <div>
                      <p className="text-xs font-medium leading-5 text-gray-700">
                        {activity.text}
                      </p>

                      <p className="mt-2 text-[10px] text-gray-400">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </Card>

      {/* Footer status */}
      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={16} />
          </div>

          <div>
            <p className="text-xs font-semibold text-emerald-900">
              Faculty workspace is up to date
            </p>
            <p className="mt-0.5 text-[10px] text-emerald-700/70">
              Last synchronized today at 08:42 AM.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          All systems operational
        </div>
      </div>
    </div>
  );
}
