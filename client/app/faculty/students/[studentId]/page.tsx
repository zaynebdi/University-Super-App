"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  BookOpen,
  GraduationCap,
  Loader2,
  Mail,
  UserRound,
} from "lucide-react";

import Card from "@/components/ui/Card";
import { api, type CourseStudentDTO } from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";

type StudentCourse = {
  id: string;
  code: string;
  title: string;
  creditHours: number;
  semester: number;
};

type Data = {
  student: CourseStudentDTO;
  courses: StudentCourse[];
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function FacultyStudentDetailsPage() {
  const params = useParams<{ studentId: string }>();
  const studentId = params.studentId;

  const { data, loading, error } = useApiResource<Data | null>(async () => {
    const me = await api.teachers.me();
    const courses = await api.courses.list({ teacherId: me.id });
    const rosters = await Promise.all(
      courses.map((course) => api.courses.students(course.id)),
    );

    let student: CourseStudentDTO | null = null;
    const enrolled: StudentCourse[] = [];

    courses.forEach((course, index) => {
      const match = rosters[index].find((item) => item.id === studentId);
      if (!match) return;

      if (!student) student = match;

      enrolled.push({
        id: course.id,
        code: course.code,
        title: course.title,
        creditHours: course.creditHours,
        semester: course.semester,
      });
    });

    if (!student) return null;

    return { student, courses: enrolled };
  });

  const courses = data?.courses ?? [];

  const totalCredits = courses.reduce(
    (sum, course) => sum + course.creditHours,
    0,
  );

  return (
    <div className="mx-auto max-w-375 space-y-7">
      <Link
        href="/faculty/students"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-indigo-600"
      >
        <ArrowLeft size={16} />
        Back to Students
      </Link>

      {loading ? (
        <Card className="flex items-center gap-2 p-8 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin" /> Loading student…
        </Card>
      ) : error ? (
        <Card className="flex items-center gap-2 p-6 text-sm text-red-600">
          <AlertCircle size={16} /> {error}
        </Card>
      ) : !data ? (
        <Card className="flex flex-col items-center gap-2 p-12 text-center text-sm text-gray-500">
          <UserRound size={22} className="text-gray-300" />
          <p className="mt-2 font-semibold text-gray-700">Student not found</p>
          <p className="text-xs text-gray-400">
            This student is not enrolled in any of your courses.
          </p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="bg-linear-to-br from-indigo-600 to-violet-700 p-8 text-white">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-white/15 text-2xl font-bold">
                  {initials(data.student.name ?? "")}
                </div>

                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-100">
                    <UserRound size={12} />
                    Student
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                    {data.student.name}
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/70">
                    <span>{data.student.rollNo}</span>
                    <span className="hidden h-1 w-1 rounded-full bg-white/40 sm:block" />
                    <span>{data.student.department}</span>
                    <span className="hidden h-1 w-1 rounded-full bg-white/40 sm:block" />
                    <span>Semester {data.student.semester}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Card className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500">Your Courses</p>
                  <p className="mt-2 text-2xl font-bold text-gray-950">
                    {data.courses.length}
                  </p>
                  <p className="mt-3 text-[11px] text-gray-400">
                    Shared with you
                  </p>
                </div>

                <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <BookOpen size={18} />
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500">Credit Hours</p>
                  <p className="mt-2 text-2xl font-bold text-gray-950">
                    {totalCredits}
                  </p>
                  <p className="mt-3 text-[11px] text-gray-400">
                    Across your courses
                  </p>
                </div>

                <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
                  <GraduationCap size={18} />
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="mt-2 truncate text-sm font-semibold text-gray-950">
                    {data.student.email ?? "—"}
                  </p>
                  <p className="mt-3 flex items-center gap-1 text-[11px] text-gray-400">
                    <Mail size={12} />
                    Contact
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-gray-100 p-5">
              <h2 className="text-base font-bold text-gray-950">
                Enrolled In Your Courses
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Courses you teach that this student is enrolled in
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {data.courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-5 transition hover:bg-gray-50/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-[10px] font-bold text-indigo-600">
                      {course.code.split("-")[0]}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {course.title}
                      </p>
                      <p className="mt-1 text-[11px] text-gray-400">
                        {course.code} · Semester {course.semester}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-gray-600">
                    {course.creditHours} cr
                  </span>
                </div>
              ))}

              {data.courses.length === 0 && (
                <div className="px-5 py-12 text-center text-sm text-gray-500">
                  No shared courses.
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
