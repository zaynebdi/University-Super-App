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
  MoreHorizontal,
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
  MessageSquare,
} from "lucide-react";
import Card from "@/components/ui/Card";

const stats = [
  {
    label: "Assigned Courses",
    value: "4",
    description: "This semester",
    icon: BookOpen,
  },
  {
    label: "Total Students",
    value: "186",
    description: "Across all courses",
    icon: Users,
  },
  {
    label: "Today's Classes",
    value: "3",
    description: "5 hours of teaching",
    icon: CalendarDays,
  },
  {
    label: "Pending Grading",
    value: "27",
    description: "Submissions awaiting review",
    icon: ClipboardCheck,
  },
];

const schedule = [
  {
    time: "09:00 AM",
    end: "10:00 AM",
    course: "Software Architecture",
    code: "SE-401",
    room: "Lab 3",
    students: 42,
    type: "Lecture",
    status: "Next",
  },
  {
    time: "11:00 AM",
    end: "12:00 PM",
    course: "Web Engineering",
    code: "SE-406",
    room: "Lab 2",
    students: 48,
    type: "Practical",
    status: "Upcoming",
  },
  {
    time: "02:00 PM",
    end: "03:00 PM",
    course: "Software Testing",
    code: "SE-407",
    room: "B-112",
    students: 44,
    type: "Lecture",
    status: "Upcoming",
  },
];

const gradingQueue = [
  {
    id: "SUB-1048",
    assignment: "Microservices Architecture Report",
    course: "SE-401",
    students: 12,
    due: "26 Sep 2026",
    priority: "High",
  },
  {
    id: "SUB-1043",
    assignment: "Next.js Full Stack Application",
    course: "SE-406",
    students: 8,
    due: "28 Sep 2026",
    priority: "Medium",
  },
  {
    id: "SUB-1037",
    assignment: "Test Automation Project",
    course: "SE-407",
    students: 7,
    due: "30 Sep 2026",
    priority: "Medium",
  },
];

const courses = [
  {
    code: "SE-401",
    name: "Software Architecture",
    students: 42,
    attendance: 94,
    performance: 88,
    progress: 82,
  },
  {
    code: "SE-406",
    name: "Web Engineering",
    students: 48,
    attendance: 91,
    performance: 84,
    progress: 76,
  },
  {
    code: "SE-407",
    name: "Software Testing",
    students: 44,
    attendance: 87,
    performance: 79,
    progress: 71,
  },
  {
    code: "SE-408",
    name: "Distributed Systems",
    students: 52,
    attendance: 89,
    performance: 82,
    progress: 68,
  },
];

const activities = [
  {
    text: "12 students submitted Microservices Architecture Report",
    time: "18 min ago",
    icon: FileText,
  },
  {
    text: "Attendance recorded for Web Engineering",
    time: "1 hr ago",
    icon: UserCheck,
  },
  {
    text: "Ahmed Hassan requested assignment feedback",
    time: "2 hrs ago",
    icon: MessageSquare,
  },
  {
    text: "New course resource uploaded to SE-407",
    time: "Yesterday",
    icon: Upload,
  },
];

export default function FacultyDashboardPage() {
  const [showAllActivity, setShowAllActivity] = useState(false);

  return (
    <div className="mx-auto max-w-375">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-600">
            <Sparkles size={13} />
            Faculty Command Center
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-950">
            Good morning, Dr. Ahmed 👋
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Here&apos;s your teaching overview for today. You have{" "}
            <span className="font-semibold text-gray-700">3 classes</span>{" "}
            scheduled and{" "}
            <span className="font-semibold text-gray-700">27 submissions</span>{" "}
            waiting for review.
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
              Your courses are performing strongly this semester.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
              Average student performance is{" "}
              <span className="font-semibold text-white">83%</span>, while
              overall attendance across your courses is{" "}
              <span className="font-semibold text-white">90%</span>.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-white/35">
                  Avg. Performance
                </p>
                <p className="mt-1 text-xl font-bold">83%</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-white/35">
                  Attendance
                </p>
                <p className="mt-1 text-xl font-bold">90%</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-white/35">
                  Course Progress
                </p>
                <p className="mt-1 text-xl font-bold">74%</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white/50">
                  Today&apos;s workload
                </p>
                <p className="mt-1 text-2xl font-bold">5h 00m</p>
              </div>

              <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-500/20 text-indigo-300">
                <Clock3 size={20} />
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[62%] rounded-full bg-indigo-400" />
            </div>

            <div className="mt-2 flex justify-between text-[10px] text-white/35">
              <span>Teaching load</span>
              <span>62%</span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-[9px] text-white/35">Classes</p>
                <p className="mt-1 font-semibold">3</p>
              </div>

              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-[9px] text-white/35">Students</p>
                <p className="mt-1 font-semibold">134</p>
              </div>

              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-[9px] text-white/35">Tasks</p>
                <p className="mt-1 font-semibold">9</p>
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
                Monday, 21 September 2026
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
                      <span>{item.students} students</span>
                      <span>{item.type}</span>
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
              Software Testing has the lowest average performance at{" "}
              <span className="font-semibold text-white">79%</span>. Students
              may benefit from an additional practical session before the next
              assessment.
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

      {/* Lower grid */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        {/* Grading Queue */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 p-6">
            <div>
              <h2 className="font-semibold text-gray-950">Grading Queue</h2>
              <p className="mt-1 text-xs text-gray-400">
                Submissions requiring your attention.
              </p>
            </div>

            <div className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-semibold text-amber-600">
              27 Pending
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {gradingQueue.map((item) => (
              <div key={item.id} className="p-5">
                <div className="flex items-start gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                    <FileText size={17} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {item.assignment}
                      </h3>

                      <span
                        className={[
                          "rounded-full px-2 py-0.5 text-[9px] font-bold",
                          item.priority === "High"
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-600",
                        ].join(" ")}
                      >
                        {item.priority}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-400">
                      <span>{item.course}</span>
                      <span>{item.students} submissions</span>
                      <span>Due {item.due}</span>
                    </div>
                  </div>

                  <button className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                    <MoreHorizontal size={17} />
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{
                        width: `${Math.min(item.students * 7, 100)}%`,
                      }}
                    />
                  </div>

                  <button className="ml-4 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
                    Review
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 p-4">
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100">
              View all submissions
              <ArrowUpRight size={14} />
            </button>
          </div>
        </Card>

        {/* Course Performance */}
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
            {courses.map((course) => (
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

                <div className="mt-4 space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between text-[10px]">
                      <span className="text-gray-400">Performance</span>
                      <span className="font-semibold text-gray-700">
                        {course.performance}%
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${course.performance}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between text-[10px]">
                      <span className="text-gray-400">Attendance</span>
                      <span className="font-semibold text-gray-700">
                        {course.attendance}%
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${course.attendance}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
