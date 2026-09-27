"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Users,
  ClipboardCheck,
  FileText,
  BarChart3,
  MoreHorizontal,
  Plus,
  ArrowUpRight,
  Clock3,
  MapPin,
  ChevronRight,
  TrendingUp,
  Filter,
} from "lucide-react";
import Card from "@/components/ui/Card";

type FacultyCourse = {
  id: string;
  code: string;
  name: string;
  description: string;
  students: number;
  attendance: number;
  performance: number;
  progress: number;
  credits: number;
  room: string;
  schedule: string;
  semester: string;
  status: "Active" | "Completed";
};

const facultyCourses: FacultyCourse[] = [
  {
    id: "se-401",
    code: "SE-401",
    name: "Software Architecture",
    description:
      "Architectural patterns, distributed application design and scalable software systems.",
    students: 42,
    attendance: 94,
    performance: 88,
    progress: 82,
    credits: 3,
    room: "Lab 3",
    schedule: "Mon · 09:00 AM",
    semester: "Fall 2026",
    status: "Active",
  },
  {
    id: "se-406",
    code: "SE-406",
    name: "Web Engineering",
    description:
      "Modern web application architecture, full-stack development and deployment.",
    students: 48,
    attendance: 91,
    performance: 84,
    progress: 76,
    credits: 3,
    room: "Lab 2",
    schedule: "Tue · 11:00 AM",
    semester: "Fall 2026",
    status: "Active",
  },
  {
    id: "se-407",
    code: "SE-407",
    name: "Software Testing",
    description:
      "Software quality assurance, testing strategies, automation and verification.",
    students: 44,
    attendance: 87,
    performance: 79,
    progress: 71,
    credits: 3,
    room: "B-112",
    schedule: "Wed · 10:00 AM",
    semester: "Fall 2026",
    status: "Active",
  },
  {
    id: "se-408",
    code: "SE-408",
    name: "Distributed Systems",
    description:
      "Distributed computing concepts, communication models and fault-tolerant systems.",
    students: 52,
    attendance: 89,
    performance: 82,
    progress: 68,
    credits: 3,
    room: "A-301",
    schedule: "Fri · 02:00 PM",
    semester: "Fall 2026",
    status: "Active",
  },
];

const filters = ["All", "Active", "Completed"];

export default function FacultyCoursesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredCourses = useMemo(() => {
    return facultyCourses.filter((course) => {
      const matchesSearch =
        course.name.toLowerCase().includes(search.toLowerCase()) ||
        course.code.toLowerCase().includes(search.toLowerCase());

      const matchesFilter = filter === "All" || course.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const totalStudents = facultyCourses.reduce(
    (sum, course) => sum + course.students,
    0,
  );

  const averageAttendance = Math.round(
    facultyCourses.reduce((sum, course) => sum + course.attendance, 0) /
      facultyCourses.length,
  );

  const averagePerformance = Math.round(
    facultyCourses.reduce((sum, course) => sum + course.performance, 0) /
      facultyCourses.length,
  );

  return (
    <div className="mx-auto max-w-375">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-600">
            <BookOpen size={13} />
            Faculty Academic Workspace
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-950">
            My Courses
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Manage your courses, monitor student performance and access teaching
            tools from one workspace.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700">
          <Plus size={17} />
          Create Course
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">
                Assigned Courses
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-950">
                {facultyCourses.length}
              </h2>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpen size={18} />
            </div>
          </div>

          <p className="mt-4 text-[11px] text-gray-400">Fall 2026 semester</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">
                Total Students
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-950">
                {totalStudents}
              </h2>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Users size={18} />
            </div>
          </div>

          <p className="mt-4 text-[11px] text-gray-400">
            Across all assigned courses
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">
                Average Attendance
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-950">
                {averageAttendance}%
              </h2>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <ClipboardCheck size={18} />
            </div>
          </div>

          <p className="mt-4 text-[11px] text-emerald-600">
            <TrendingUp size={11} className="mr-1 inline" />
            Healthy overall attendance
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">
                Avg. Performance
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-950">
                {averagePerformance}%
              </h2>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <BarChart3 size={18} />
            </div>
          </div>

          <p className="mt-4 text-[11px] text-gray-400">
            Student assessment performance
          </p>
        </Card>
      </div>

      {/* Controls */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1 lg:max-w-md">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <div className="mr-1 hidden items-center gap-2 text-xs font-medium text-gray-400 sm:flex">
              <Filter size={14} />
              Filter
            </div>

            {filters.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={[
                  "whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold transition",
                  filter === item
                    ? "bg-indigo-600 text-white"
                    : "border border-gray-200 bg-white text-gray-500 hover:bg-gray-50",
                ].join(" ")}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Course Grid */}
      <div className="grid gap-5 xl:grid-cols-2">
        {filteredCourses.map((course) => (
          <Card
            key={course.id}
            className="overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {/* Course top */}
            <div className="border-b border-gray-100 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
                    <BookOpen size={20} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold tracking-wider text-indigo-600">
                        {course.code}
                      </span>

                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-600">
                        {course.status}
                      </span>
                    </div>

                    <h2 className="mt-1 text-lg font-bold text-gray-950">
                      {course.name}
                    </h2>

                    <p className="mt-2 text-xs leading-5 text-gray-400">
                      {course.description}
                    </p>
                  </div>
                </div>

                <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-gray-400">
                <span className="inline-flex items-center gap-1.5">
                  <Users size={13} />
                  {course.students} students
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <Clock3 size={13} />
                  {course.schedule}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={13} />
                  {course.room}
                </span>

                <span>{course.credits} credits</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
              <div className="p-4 text-center">
                <p className="text-[10px] text-gray-400">Attendance</p>
                <p className="mt-1 text-lg font-bold text-gray-900">
                  {course.attendance}%
                </p>
              </div>

              <div className="p-4 text-center">
                <p className="text-[10px] text-gray-400">Performance</p>
                <p className="mt-1 text-lg font-bold text-gray-900">
                  {course.performance}%
                </p>
              </div>

              <div className="p-4 text-center">
                <p className="text-[10px] text-gray-400">Progress</p>
                <p className="mt-1 text-lg font-bold text-gray-900">
                  {course.progress}%
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-medium text-gray-400">
                  Course completion
                </span>

                <span className="text-[10px] font-semibold text-gray-600">
                  {course.progress}%
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{ width: `${course.progress}%` }}
                />
              </div>

              {/* Actions */}
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Link
                  href={`/faculty/courses/${course.id}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2.5 text-[10px] font-semibold text-white transition hover:bg-indigo-700"
                >
                  Open
                  <ArrowUpRight size={12} />
                </Link>

                <button className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2.5 text-[10px] font-semibold text-gray-600 hover:bg-gray-50">
                  <UserCheckIcon />
                  Attendance
                </button>

                <button className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2.5 text-[10px] font-semibold text-gray-600 hover:bg-gray-50">
                  <FileText size={12} />
                  Assignments
                </button>

                <button className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2.5 text-[10px] font-semibold text-gray-600 hover:bg-gray-50">
                  <BarChart3 size={12} />
                  Results
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredCourses.length === 0 && (
        <Card className="py-16 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gray-100 text-gray-400">
            <BookOpen size={20} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-gray-900">
            No courses found
          </h3>

          <p className="mt-1 text-xs text-gray-400">
            Try changing your search or filter.
          </p>
        </Card>
      )}

      {/* Academic summary */}
      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 size={17} className="text-indigo-600" />

              <h2 className="font-semibold text-gray-950">Teaching Overview</h2>
            </div>

            <p className="mt-2 max-w-2xl text-xs leading-5 text-gray-400">
              Your assigned courses currently have an average attendance of{" "}
              <span className="font-semibold text-gray-700">
                {averageAttendance}%
              </span>{" "}
              and average student performance of{" "}
              <span className="font-semibold text-gray-700">
                {averagePerformance}%
              </span>
              .
            </p>
          </div>

          <button className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
            View Analytics
            <ChevronRight size={14} />
          </button>
        </div>
      </Card>

      {/* Backend note */}
      <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-100 text-indigo-600">
            <BookOpen size={16} />
          </div>

          <div>
            <p className="text-sm font-semibold text-indigo-950">
              Backend-ready course architecture
            </p>

            <p className="mt-1 text-xs leading-5 text-indigo-700/70">
              Course cards and metrics are currently powered by mock data. Later
              they will connect to faculty course, enrollment, attendance,
              assignment and grade APIs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserCheckIcon() {
  return <Users size={12} />;
}
