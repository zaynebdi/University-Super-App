import {
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";

const courses = [
  {
    name: "Software Architecture",
    code: "SE-401",
    progress: 88,
  },
  {
    name: "Artificial Intelligence",
    code: "AI-402",
    progress: 76,
  },
  {
    name: "Cyber Security",
    code: "CS-405",
    progress: 91,
  },
  {
    name: "Web Engineering",
    code: "SE-406",
    progress: 84,
  },
];

const schedule = [
  {
    time: "09:00",
    title: "Software Architecture",
    room: "Lab 3",
    duration: "90 min",
  },
  {
    time: "11:00",
    title: "Artificial Intelligence",
    room: "Room A-204",
    duration: "90 min",
    active: true,
  },
  {
    time: "14:00",
    title: "FYP Project Meeting",
    room: "Innovation Hub",
    duration: "60 min",
  },
];

export default function StudentDashboard() {
  return (
    <AppShell>
      <div className="mx-auto max-w-375">
        {/* Header */}
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600">
              UniSphere · Tuesday, September 23
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-gray-950">
              Good evening, Abdullah 👋
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
                You&apos;re on track this semester. Your strongest momentum is
                in Software Architecture and Web Engineering.
              </p>
            </div>

            <div className="min-w-52.5 rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-xs text-indigo-200">Semester GPA</p>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold">3.72</span>
                <span className="text-xs font-semibold text-emerald-300">
                  ↑ 0.18
                </span>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[86%] rounded-full bg-white" />
              </div>

              <p className="mt-2 text-[11px] text-indigo-200">
                Top 12% of your program
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Current GPA"
            value="3.72"
            description="+0.18 compared with last semester"
            icon={TrendingUp}
          />

          <StatCard
            label="Attendance"
            value="91%"
            description="Above the required 80%"
            icon={ClipboardCheck}
          />

          <StatCard
            label="Assignments"
            value="8 / 10"
            description="2 assignments due this week"
            icon={FileText}
          />

          <StatCard
            label="Credits Earned"
            value="96 / 132"
            description="36 credits remaining"
            icon={GraduationCap}
          />
        </div>

        {/* Main grid */}
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
          {/* Academic Progress */}
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-950">Academic progress</h3>
                <p className="mt-1 text-xs text-gray-400">
                  Current semester performance
                </p>
              </div>

              <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-50">
                <ArrowUpRight size={17} />
              </button>
            </div>

            <div className="space-y-6">
              {courses.map((course) => (
                <div key={course.code}>
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {course.name}
                      </p>
                      <p className="mt-0.5 text-[10px] text-gray-400">
                        {course.code}
                      </p>
                    </div>

                    <span className="text-xs font-bold text-gray-700">
                      {course.progress}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Schedule */}
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="font-bold text-gray-950">Today&apos;s schedule</h3>
              <p className="mt-1 text-xs text-gray-400">
                Tuesday · September 23
              </p>
            </div>

            <div className="space-y-2">
              {schedule.map((item) => (
                <div
                  key={item.time}
                  className={[
                    "flex gap-4 rounded-xl border p-3.5",
                    item.active
                      ? "border-indigo-100 bg-indigo-50"
                      : "border-transparent bg-gray-50",
                  ].join(" ")}
                >
                  <div className="w-11 pt-0.5 text-xs font-bold text-gray-500">
                    {item.time}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {item.title}
                    </p>

                    <p className="mt-1 text-[11px] text-gray-400">
                      {item.room} · {item.duration}
                    </p>
                  </div>

                  {item.active && (
                    <span className="self-center rounded-full bg-indigo-600 px-2 py-1 text-[9px] font-bold text-white">
                      NOW
                    </span>
                  )}
                </div>
              ))}
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
                <h3 className="font-bold text-gray-950">Recommended for you</h3>
                <p className="text-xs text-gray-400">
                  Based on your academic activity
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Recommendation
                icon={<BookOpen size={17} />}
                title="Review Distributed Systems"
                description="AI predicts this topic will help your next assessment."
              />

              <Recommendation
                icon={<FileText size={17} />}
                title="Complete Neural Network Lab"
                description="Due in 6 days · estimated 75 minutes."
              />
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
              <Overview
                title="Mid-Term schedule published"
                description="Academic Office · 2 hours ago"
              />

              <Overview
                title="FYP proposal submission"
                description="Department Office · Tomorrow"
              />

              <Overview
                title="Career fair registration open"
                description="Career Development Center · 2 days ago"
              />
            </div>
          </Card>
        </div>
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
