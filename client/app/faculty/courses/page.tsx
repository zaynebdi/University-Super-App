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
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Card from "@/components/ui/Card";
import {
  api,
  type CourseDTO,
  type TeacherProfileDTO,
} from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";

type Data = {
  me: TeacherProfileDTO;
  courses: CourseDTO[];
  studentCounts: number[];
};

export default function FacultyCoursesPage() {
  const [search, setSearch] = useState("");
  const { data, loading, error } = useApiResource<Data>(async () => {
    const me = await api.teachers.me();
    const courses = await api.courses.list({ teacherId: me.id });
    const studentCounts = await Promise.all(
      courses.map((course) =>
        api.courses.students(course.id).then((students) => students.length)
      )
    );
    return { me, courses, studentCounts };
  });

  const courses = data?.courses ?? [];
  const studentCounts = data?.studentCounts ?? [];
  const studentsById = new Map(
    courses.map((course, index) => [course.id, studentCounts[index] ?? 0])
  );
  const totalStudents = studentCounts.reduce((sum, count) => sum + count, 0);

  const filteredCourses = useMemo(() => {
    const list = data?.courses ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (course) =>
        course.title.toLowerCase().includes(q) ||
        course.code.toLowerCase().includes(q)
    );
  }, [data, search]);

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
                {courses.length}
              </h2>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpen size={18} />
            </div>
          </div>

          <p className="mt-4 text-[11px] text-gray-400">Current semester</p>
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
              <h2 className="mt-2 text-2xl font-bold text-gray-950">—</h2>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <ClipboardCheck size={18} />
            </div>
          </div>

          <p className="mt-4 text-[11px] text-gray-400">
            Not available
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">
                Avg. Performance
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-950">—</h2>
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
        </div>
      </Card>

      {error && (
        <Card className="mb-5 flex items-center gap-2 border-red-100 p-5 text-sm text-red-600">
          <AlertCircle size={16} /> {error}
        </Card>
      )}

      {loading ? (
        <Card className="mb-5 flex items-center gap-2 p-8 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin" /> Loading courses…
        </Card>
      ) : (
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
                        Semester {course.semester}
                      </span>
                    </div>

                    <h2 className="mt-1 text-lg font-bold text-gray-950">
                      {course.title}
                    </h2>
                  </div>
                </div>

                <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-gray-400">
                <span className="inline-flex items-center gap-1.5">
                  <Users size={13} />
                  {studentsById.get(course.id) ?? 0} students
                </span>

                <span>{course.creditHours} credits</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
              <div className="p-4 text-center">
                <p className="text-[10px] text-gray-400">Attendance</p>
                <p className="mt-1 text-lg font-bold text-gray-900">—</p>
              </div>

              <div className="p-4 text-center">
                <p className="text-[10px] text-gray-400">Performance</p>
                <p className="mt-1 text-lg font-bold text-gray-900">—</p>
              </div>

              <div className="p-4 text-center">
                <p className="text-[10px] text-gray-400">Progress</p>
                <p className="mt-1 text-lg font-bold text-gray-900">—</p>
              </div>
            </div>

            {/* Progress */}
            <div className="p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-medium text-gray-400">
                  Course completion
                </span>

                <span className="text-[10px] font-semibold text-gray-600">
                  —
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full w-0 rounded-full bg-indigo-500" />
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

          {/* Empty state */}
          {filteredCourses.length === 0 && (
            <Card className="py-16 text-center xl:col-span-2">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gray-100 text-gray-400">
                <BookOpen size={20} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-gray-900">
                No courses found
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Try changing your search.
              </p>
            </Card>
          )}
        </div>
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
              You are assigned{" "}
              <span className="font-semibold text-gray-700">
                {courses.length} courses
              </span>{" "}
              with{" "}
              <span className="font-semibold text-gray-700">
                {totalStudents} enrolled students
              </span>
              . Attendance and performance metrics will appear once assessment
              data is available.
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
              Course cards are powered by the faculty course and enrollment
              APIs. Attendance, assignment and grade metrics will connect in a
              later phase.
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
