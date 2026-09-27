import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  GraduationCap,
  MessageSquare,
  UserRound,
} from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { courses } from "@/lib/data";

export default async function CourseDetails({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const course = courses.find((item) => item.id === courseId);

  if (!course) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl py-20 text-center">
          <h1 className="text-2xl font-bold">Course not found</h1>

          <Link
            href="/student/courses"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600"
          >
            <ArrowLeft size={15} />
            Back to courses
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-375">
        <Link
          href="/student/courses"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600"
        >
          <ArrowLeft size={16} />
          Back to courses
        </Link>

        {/* Hero */}
        <section className="mb-5 overflow-hidden rounded-3xl bg-linear-to-br from-indigo-700 via-indigo-600 to-violet-600 p-7 text-white shadow-xl shadow-indigo-900/10">
          <div className="flex flex-col justify-between gap-8 lg:flex-row">
            <div>
              <div className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold">
                {course.code}
              </div>

              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {course.name}
              </h1>

              <p className="mt-3 text-sm text-indigo-100">
                {course.instructor}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Tag
                  icon={<BookOpen size={13} />}
                  text={`${course.credits} Credits`}
                />
                <Tag icon={<UserRound size={13} />} text={course.instructor} />
                <Tag icon={<CalendarDays size={13} />} text={course.schedule} />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md lg:min-w-55">
              <p className="text-xs text-indigo-200">Current Grade</p>

              <div className="mt-2 flex items-center gap-3">
                <span className="text-4xl font-bold">{course.grade}</span>

                <span className="text-xs font-semibold text-emerald-300">
                  Excellent
                </span>
              </div>

              <p className="mt-4 text-xs text-indigo-200">
                {course.progress}% course progress
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            icon={<ClipboardCheck size={18} />}
            label="Attendance"
            value={`${course.attendance}%`}
            description="Above requirement"
          />

          <Metric
            icon={<BookOpen size={18} />}
            label="Progress"
            value={`${course.progress}%`}
            description="Course completed"
          />

          <Metric
            icon={<FileText size={18} />}
            label="Assignments"
            value="8 / 10"
            description="2 remaining"
          />

          <Metric
            icon={<Clock3 size={18} />}
            label="Next Class"
            value="09:00"
            description="Monday · Lab 3"
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-950">Course progress</h2>
                <p className="mt-1 text-xs text-gray-400">
                  Your learning journey this semester
                </p>
              </div>

              <GraduationCap size={20} className="text-indigo-500" />
            </div>

            <div className="space-y-6">
              <ProgressItem
                title="Module 01 · Architecture Fundamentals"
                value={100}
              />

              <ProgressItem title="Module 02 · Design Patterns" value={100} />

              <ProgressItem
                title="Module 03 · Distributed Systems"
                value={85}
              />

              <ProgressItem title="Module 04 · Cloud Architecture" value={70} />

              <ProgressItem
                title="Module 05 · Final Architecture Project"
                value={40}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-5">
              <h2 className="font-bold text-gray-950">Upcoming work</h2>
              <p className="mt-1 text-xs text-gray-400">
                Your next course activities
              </p>
            </div>

            <div className="space-y-2">
              <Activity
                title="Distributed Systems Report"
                date="Due Sep 27"
                icon={<FileText size={16} />}
              />

              <Activity
                title="Architecture Quiz"
                date="Sep 29 · 10:00 AM"
                icon={<ClipboardCheck size={16} />}
              />

              <Activity
                title="Final Project Review"
                date="Oct 03 · Lab 3"
                icon={<MessageSquare size={16} />}
              />
            </div>
          </Card>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="font-bold text-gray-950">Course information</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Detail label="Instructor" value={course.instructor} />
              <Detail label="Credits" value={`${course.credits} credits`} />
              <Detail label="Classroom" value={course.room} />
              <Detail label="Schedule" value={course.schedule} />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-bold text-gray-950">Quick actions</h2>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Action title="View assignments" icon={<FileText size={17} />} />
              <Action
                title="View attendance"
                icon={<ClipboardCheck size={17} />}
              />
              <Action title="Course resources" icon={<BookOpen size={17} />} />
              <Action
                title="Message instructor"
                icon={<MessageSquare size={17} />}
              />
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Tag({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] text-indigo-100">
      {icon}
      {text}
    </span>
  );
}

function Metric({
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
          <p className="text-xs text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-950">{value}</p>
          <p className="mt-1 text-[11px] text-gray-400">{description}</p>
        </div>

        <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      </div>
    </Card>
  );
}

function ProgressItem({ title, value }: { title: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex justify-between gap-4">
        <span className="text-xs font-semibold text-gray-700">{title}</span>
        <span className="text-xs font-bold text-gray-500">{value}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-indigo-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function Activity({
  title,
  date,
  icon,
}: {
  title: string;
  date: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3.5">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-white text-indigo-600 shadow-sm">
        {icon}
      </div>

      <div className="flex-1">
        <p className="text-xs font-semibold text-gray-800">{title}</p>
        <p className="mt-1 text-[11px] text-gray-400">{date}</p>
      </div>

      <ArrowUpRight size={15} className="text-gray-400" />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function Action({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <button className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 text-left text-xs font-semibold text-gray-700 transition hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600">
      {icon}
      {title}
    </button>
  );
}
