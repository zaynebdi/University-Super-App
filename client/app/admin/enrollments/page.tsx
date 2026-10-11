"use client";

import { useEffect, useState } from "react";
import { UserPlus, Check } from "lucide-react";

import {
  api,
  ApiError,
  type CourseDTO,
  type CourseStudentDTO,
  type DepartmentDTO,
  type StudentProfileDTO,
} from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";
import { ErrorBox, Field, Loading, PageHeader } from "@/components/admin/ui";

export default function AdminEnrollmentsPage() {
  const {
    data: departments,
    loading: deptLoading,
    error: deptError,
  } = useApiResource<DepartmentDTO[]>(() => api.departments.list());

  const [departmentId, setDepartmentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const activeDepartments =
    departments?.filter((d) => d.isActive !== false) ?? [];

  useEffect(() => {
    if (!departmentId) {
      setCourses([]);
      setCourseId("");
      return;
    }
    let cancelled = false;
    setCoursesLoading(true);
    api.courses
      .list({ departmentId })
      .then((cs) => {
        if (!cancelled) {
          setCourses(cs);
          setCourseId("");
        }
      })
      .catch(() => {
        if (!cancelled) setCourses([]);
      })
      .finally(() => {
        if (!cancelled) setCoursesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [departmentId]);

  return (
    <div className="mx-auto max-w-375">
      <PageHeader
        title="Enrollments"
        description="Choose a department and a course, then enroll its students."
      />

      {notice && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700">
          {notice}
        </div>
      )}

      {deptLoading ? (
        <Loading />
      ) : deptError ? (
        <ErrorBox message={deptError} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Department">
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="form-input"
              >
                <option value="">Select a department…</option>
                {activeDepartments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} · {d.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Course">
              <select
                value={courseId}
                disabled={!departmentId || coursesLoading}
                onChange={(e) => setCourseId(e.target.value)}
                className="form-input"
              >
                <option value="">
                  {coursesLoading
                    ? "Loading courses…"
                    : departmentId
                      ? "Select a course…"
                      : "Select a department first…"}
                </option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.title}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {courseId ? (
            <StudentsPanel
              key={courseId}
              departmentId={departmentId}
              courseId={courseId}
              onNotify={setNotice}
            />
          ) : (
            <p className="mt-6 text-sm text-gray-400">
              {departmentId
                ? "Select a course to enroll students."
                : "Select a department to continue."}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function StudentsPanel({
  departmentId,
  courseId,
  onNotify,
}: {
  departmentId: string;
  courseId: string;
  onNotify: (msg: string | null) => void;
}) {
  const { data, loading, error, reload } = useApiResource<{
    course: CourseDTO;
    students: StudentProfileDTO[];
    enrolled: CourseStudentDTO[];
  }>(async () => {
    const [course, students, enrolled] = await Promise.all([
      api.courses.get(courseId),
      api.students.list({ departmentId }),
      api.courses.students(courseId),
    ]);
    return { course, students, enrolled };
  });

  const [enrolling, setEnrolling] = useState<string | null>(null);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return null;

  const enrolledIds = new Set(data.enrolled.map((s) => s.id));
  const available = data.students.filter((s) => !enrolledIds.has(s.id));
  const canEnroll = available.length > 0;
  const courseCode = data.course.code;

  async function handleEnroll(student: StudentProfileDTO) {
    setEnrolling(student.id);
    onNotify(null);
    try {
      await api.courses.enroll(courseId, student.id);
      onNotify(`${student.name} enrolled in ${courseCode}.`);
      await reload();
    } catch (e) {
      onNotify(
        e instanceof ApiError ? e.message : "Failed to enroll student"
      );
    } finally {
      setEnrolling(null);
    }
  }

  return (
    <>
      <div className="mt-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-950">
            {data.course.code} · {data.course.title}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            {data.enrolled.length} enrolled · {available.length} available to
            enroll
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
            <tr>
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Roll number</th>
              <th className="px-5 py-3 font-semibold">Semester</th>
              <th className="px-5 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {available.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50/60">
                <td className="px-5 py-3 font-medium text-gray-800">
                  {student.name}
                </td>
                <td className="px-5 py-3 text-gray-500">{student.rollNo}</td>
                <td className="px-5 py-3 text-gray-500">{student.semester}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end">
                    <button
                      disabled={enrolling === student.id}
                      onClick={() => handleEnroll(student)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                    >
                      {enrolling === student.id ? (
                        "Enrolling…"
                      ) : (
                        <>
                          <UserPlus size={13} /> Enroll
                        </>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!canEnroll && (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-8 text-center text-gray-400"
                >
                  All students of this department are already enrolled.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data.enrolled.length > 0 && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            <Check size={14} /> Already enrolled ({data.enrolled.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.enrolled.map((s) => (
              <span
                key={s.id}
                className="rounded-lg bg-emerald-50 px-2 py-1 text-[12px] font-medium text-emerald-700"
                title={s.name}
              >
                {s.rollNo}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}