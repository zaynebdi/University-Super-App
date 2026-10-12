"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  ChevronRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Card from "@/components/ui/Card";
import { api, type CourseStudentDTO } from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";

type StudentRow = CourseStudentDTO & { courseCodes: string[] };

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function FacultyStudentsPage() {
  const { data, loading, error } = useApiResource<StudentRow[]>(async () => {
    const me = await api.teachers.me();
    const courses = await api.courses.list({ teacherId: me.id });
    const rosters = await Promise.all(
      courses.map((course) => api.courses.students(course.id)),
    );

    const byId = new Map<string, StudentRow>();

    courses.forEach((course, index) => {
      rosters[index].forEach((student) => {
        const existing = byId.get(student.id);

        if (existing) {
          if (!existing.courseCodes.includes(course.code)) {
            existing.courseCodes.push(course.code);
          }
          return;
        }

        byId.set(student.id, { ...student, courseCodes: [course.code] });
      });
    });

    return Array.from(byId.values());
  });

  const [search, setSearch] = useState("");

  const filteredStudents = useMemo(() => {
    const list = data ?? [];
    const query = search.trim().toLowerCase();

    if (!query) return list;

    return list.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.rollNo.toLowerCase().includes(query) ||
        student.department.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query),
    );
  }, [data, search]);

  return (
    <div className="mx-auto max-w-375">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-600">
            <Users size={13} />
            Faculty Student Directory
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-950">
            My Students
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Students enrolled across the courses assigned to you.
          </p>
        </div>
      </div>

      {loading ? (
        <Card className="flex items-center gap-2 p-8 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin" /> Loading students…
        </Card>
      ) : error ? (
        <Card className="flex items-center gap-2 p-6 text-sm text-red-600">
          <AlertCircle size={16} /> {error}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="border-b border-gray-100 p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="font-semibold text-gray-950">
                  Enrolled Students
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  {filteredStudents.length} students across your courses.
                </p>
              </div>

              <div className="relative w-full lg:w-80">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search students..."
                  className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 text-xs outline-none focus:border-indigo-300 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-200 text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Student
                  </th>
                  <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Department
                  </th>
                  <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Semester
                  </th>
                  <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Email
                  </th>
                  <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Courses
                  </th>
                  <th />
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="transition hover:bg-gray-50/70"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-[10px] font-bold text-white">
                          {initials(student.name)}
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-900">
                            {student.name}
                          </p>

                          <p className="mt-1 text-[10px] text-gray-400">
                            {student.rollNo}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-gray-600">
                        {student.department}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-gray-600">
                        Semester {student.semester}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500">
                        {student.email}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {student.courseCodes.map((code) => (
                          <span
                            key={code}
                            className="rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-600"
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/faculty/students/${student.id}`}
                        className="inline-block rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <ChevronRight size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="py-14 text-center">
              <Users size={22} className="mx-auto text-gray-300" />
              <p className="mt-3 text-sm font-semibold text-gray-700">
                No students found
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
