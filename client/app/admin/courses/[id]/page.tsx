"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

import { api, type CourseStudentDTO, type CourseDTO } from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";
import { ErrorBox, Loading } from "@/components/admin/ui";

export default function AdminCourseDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data, loading, error } = useApiResource<{
    course: CourseDTO;
    students: CourseStudentDTO[];
  }>(async () => {
    const [course, students] = await Promise.all([
      api.courses.get(id),
      api.courses.students(id),
    ]);
    return { course, students };
  });

  return (
    <div className="mx-auto max-w-375">
      <Link
        href="/admin/courses"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft size={15} /> Back to courses
      </Link>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} />
      ) : data ? (
        <>
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-indigo-600">
                  {data.course.code}
                </div>
                <h1 className="mt-1 text-2xl font-bold text-gray-950">
                  {data.course.title}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {data.course.teacher?.name ?? "No teacher assigned"} ·{" "}
                  {data.course.department?.name ?? "Unassigned"} ·{" "}
                  {data.course.creditHours} credit hours
                </p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                Semester {data.course.semester}
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <Users size={17} className="text-gray-400" />
              <h2 className="font-bold text-gray-950">
                Enrolled students ({data.students.length})
              </h2>
            </div>

            {data.students.length === 0 ? (
              <p className="text-sm text-gray-400">
                No students enrolled yet. Use the{" "}
                <Link
                  href="/admin/enrollments"
                  className="font-medium text-indigo-600 hover:underline"
                >
                  Enrollments
                </Link>{" "}
                page to add students.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Roll No</th>
                      <th className="px-4 py-2.5 font-semibold">Name</th>
                      <th className="px-4 py-2.5 font-semibold">Department</th>
                      <th className="px-4 py-2.5 font-semibold">Semester</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.students.map((s) => (
                      <tr key={s.id}>
                        <td className="px-4 py-2.5 text-gray-500">{s.rollNo}</td>
                        <td className="px-4 py-2.5 font-medium text-gray-800">
                          {s.name}
                        </td>
                        <td className="px-4 py-2.5 text-gray-500">
                          {s.department}
                        </td>
                        <td className="px-4 py-2.5 text-gray-500">
                          {s.semester}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
