"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock3,
  GraduationCap,
  Search,
  UserRound,
} from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { courses } from "@/lib/data";

export default function CoursesPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-375">
        {/* Header */}
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

        {/* Overview */}
        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Overview
            icon={<BookOpen size={18} />}
            label="Enrolled Courses"
            value="6"
            description="18 total credits"
          />

          <Overview
            icon={<GraduationCap size={18} />}
            label="Semester GPA"
            value="3.72"
            description="+0.18 this semester"
          />

          <Overview
            icon={<CalendarDays size={18} />}
            label="Attendance"
            value="91%"
            description="Across all courses"
          />

          <Overview
            icon={<Clock3 size={18} />}
            label="Weekly Hours"
            value="17.5"
            description="Scheduled learning"
          />
        </div>

        {/* Search */}
        <Card className="mb-5 p-3">
          <div className="flex items-center gap-3 px-2">
            <Search size={18} className="text-gray-400" />

            <input
              placeholder="Search courses by name or code..."
              className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-gray-400"
            />
          </div>
        </Card>

        {/* Course cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
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

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                      {course.grade}
                    </span>
                  </div>

                  <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-500">
                    {course.code}
                  </p>

                  <h2 className="mt-1 text-lg font-bold tracking-tight text-gray-950">
                    {course.name}
                  </h2>

                  <div className="mt-4 space-y-2.5">
                    <Info
                      icon={<UserRound size={14} />}
                      text={course.instructor}
                    />

                    <Info
                      icon={<CalendarDays size={14} />}
                      text={course.schedule}
                    />

                    <Info
                      icon={<BookOpen size={14} />}
                      text={`${course.credits} Credits · ${course.room}`}
                    />
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 flex justify-between text-[11px]">
                      <span className="text-gray-400">Course progress</span>
                      <span className="font-bold text-gray-700">
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

                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-xs font-medium text-gray-400">
                      Attendance {course.attendance}%
                    </span>

                    <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 transition group-hover:gap-2">
                      View course
                      <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
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
