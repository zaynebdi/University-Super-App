"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";

import {
  api,
  ApiError,
  type CourseDTO,
  type CourseStudentDTO,
} from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";
import { ErrorBox, Field, Loading, PageHeader } from "@/components/admin/ui";

export default function AdminEnrollmentsPage() {
  const {
    data: courses,
    loading,
    error,
  } = useApiResource<CourseDTO[]>(() => api.courses.list());
  const [selected, setSelected] = useState("");

  return (
    <div className="mx-auto max-w-375">
      <PageHeader
        title="Enrollments"
        description="Enroll students into courses and review enrolled students."
      />

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} />
      ) : (
        <>
          <div className="max-w-md">
            <Field label="Course">
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="form-input"
              >
                <option value="">Select a course…</option>
                {courses?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.title}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {selected ? (
            <EnrollmentPanel key={selected} courseId={selected} />
          ) : (
            <p className="mt-6 text-sm text-gray-400">
              Select a course to enroll students.
            </p>
          )}

          {courses?.length === 0 && (
            <p className="mt-4 text-sm text-gray-400">
              No courses yet. Add one on the{" "}
              <Link
                href="/admin/courses"
                className="font-medium text-indigo-600 hover:underline"
              >
                Courses
              </Link>{" "}
              page.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function EnrollmentPanel({ courseId }: { courseId: string }) {
  const { data, loading, error, reload } = useApiResource<CourseStudentDTO[]>(
    () => api.courses.students(courseId)
  );
  const [studentId, setStudentId] = useState("");
  const [notice, setNotice] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  async function enroll(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      await api.courses.enroll(courseId, studentId.trim());
      setStudentId("");
      setNotice({ ok: true, message: "Student enrolled successfully." });
      await reload();
    } catch (e) {
      setNotice({
        ok: false,
        message: e instanceof ApiError ? e.message : "Failed to enroll student",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="font-bold text-gray-950">Enroll a student</h2>
      <p className="mt-1 text-xs text-gray-400">
        Enter the student profile ID (Student ObjectId).
      </p>

      <form onSubmit={enroll} className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-64 flex-1">
          <Field label="Student ID">
            <input
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="24-character student id"
              className="form-input"
            />
          </Field>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="mb-0.5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          <UserPlus size={15} /> Enroll
        </button>
      </form>

      {notice && (
        <p
          className={[
            "mt-3 text-sm",
            notice.ok ? "text-emerald-600" : "text-red-600",
          ].join(" ")}
        >
          {notice.message}
        </p>
      )}

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-bold text-gray-900">
          Enrolled students
        </h3>
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorBox message={error} />
        ) : data && data.length > 0 ? (
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
                {data.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-2.5 text-gray-500">{s.rollNo}</td>
                    <td className="px-4 py-2.5 font-medium text-gray-800">
                      {s.name}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">
                      {s.department}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{s.semester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            No students enrolled in this course yet.
          </p>
        )}
      </div>
    </div>
  );
}
