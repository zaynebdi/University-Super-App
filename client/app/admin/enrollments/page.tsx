"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { UserPlus, Check, Users } from "lucide-react";

import {
  api,
  ApiError,
  type CourseDTO,
  type CourseStudentDTO,
  type DepartmentDTO,
  type FieldDTO,
  type StudentProfileDTO,
} from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";
import { ErrorBox, Field, Loading, PageHeader } from "@/components/admin/ui";

type Mode = "field" | "course";

export default function AdminEnrollmentsPage() {
  const { data: session } = useSession();
  const sessionUser = session?.user as
    | { assignedDepartment?: string | null }
    | undefined;
  const lockedDepartment = sessionUser?.assignedDepartment ?? null;

  const {
    data: departments,
    loading: deptLoading,
    error: deptError,
  } = useApiResource<DepartmentDTO[]>(() => api.departments.list());

  const [mode, setMode] = useState<Mode>("field");
  const [notice, setNotice] = useState<string | null>(null);

  const activeDepartments =
    departments?.filter((d) => d.isActive !== false) ?? [];

  return (
    <div className="mx-auto max-w-375">
      <PageHeader
        title="Enrollments"
        description="Enroll a field's students in all of its courses, or enroll one course at a time."
      />

      {notice && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700">
          {notice}
        </div>
      )}

      <div className="mb-4 flex gap-1 rounded-xl bg-gray-100 p-1">
        <button
          onClick={() => setMode("field")}
          className={[
            "flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
            mode === "field"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          ].join(" ")}
        >
          Enroll by field
        </button>
        <button
          onClick={() => setMode("course")}
          className={[
            "flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
            mode === "course"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          ].join(" ")}
        >
          Enroll in one course
        </button>
      </div>

      {deptLoading ? (
        <Loading />
      ) : deptError ? (
        <ErrorBox message={deptError} />
      ) : mode === "field" ? (
        <FieldEnrollmentPanel
          departments={activeDepartments}
          lockedDepartment={lockedDepartment}
          onNotify={setNotice}
        />
      ) : (
        <CourseEnrollmentPanel
          departments={activeDepartments}
          lockedDepartment={lockedDepartment}
          onNotify={setNotice}
        />
      )}
    </div>
  );
}

function FieldEnrollmentPanel({
  departments,
  lockedDepartment,
  onNotify,
}: {
  departments: DepartmentDTO[];
  lockedDepartment?: string | null;
  onNotify: (msg: string | null) => void;
}) {
  const [departmentId, setDepartmentId] = useState(lockedDepartment ?? "");
  const [fieldId, setFieldId] = useState("");
  const [fields, setFields] = useState<FieldDTO[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [students, setStudents] = useState<StudentProfileDTO[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [enrolling, setEnrolling] = useState(false);

  const visibleDepartments = lockedDepartment
    ? departments.filter((d) => d.id === lockedDepartment)
    : departments;

  useEffect(() => {
    if (!departmentId) {
      setFields([]);
      setFieldId("");
      return;
    }
    let cancelled = false;
    setFieldsLoading(true);
    api.fields
      .list({ departmentId })
      .then((fs) => {
        if (!cancelled) {
          setFields(fs);
          setFieldId("");
          setSelected(new Set());
        }
      })
      .catch(() => {
        if (!cancelled) setFields([]);
      })
      .finally(() => {
        if (!cancelled) setFieldsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [departmentId]);

  useEffect(() => {
    if (!fieldId) {
      setStudents([]);
      setSelected(new Set());
      return;
    }
    let cancelled = false;
    setStudentsLoading(true);
    api.students
      .list({ departmentId, fieldId })
      .then((result) => {
        if (!cancelled) {
          setStudents(result);
          setSelected(new Set());
        }
      })
      .catch(() => {
        if (!cancelled) setStudents([]);
      })
      .finally(() => {
        if (!cancelled) setStudentsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fieldId, departmentId]);

  function toggleStudent(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === students.length
        ? new Set()
        : new Set(students.map((s) => s.id))
    );
  }

  async function handleEnroll() {
    if (selected.size === 0 || !fieldId) return;
    setEnrolling(true);
    onNotify(null);
    try {
      const result = await api.fields.enroll(fieldId, [...selected]);
      onNotify(
        `Enrolled in ${result.enrolled} course${result.enrolled === 1 ? "" : "s"}, ${result.alreadyEnrolled} already enrolled.`
      );
      setSelected(new Set());
    } catch (e) {
      onNotify(e instanceof ApiError ? e.message : "Failed to enroll students");
    } finally {
      setEnrolling(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Department">
          <select
            disabled={!!lockedDepartment}
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="form-input"
          >
            <option value="">Select a department…</option>
            {visibleDepartments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} · {d.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Field">
          <select
            value={fieldId}
            disabled={!departmentId || fieldsLoading}
            onChange={(e) => setFieldId(e.target.value)}
            className="form-input"
          >
            <option value="">
              {fieldsLoading
                ? "Loading fields…"
                : departmentId
                  ? "Select a field…"
                  : "Select a department first…"}
            </option>
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.code} · {f.name} ({f.courseCount} courses)
              </option>
            ))}
          </select>
        </Field>
      </div>

      {fieldId ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-gray-950">
                Students of the selected field
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Selected {selected.size} of {students.length} · enrolling in all
                active courses of this field for the student&apos;s semester
              </p>
            </div>
            <button
              disabled={selected.size === 0 || enrolling}
              onClick={handleEnroll}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              <UserPlus size={15} />
              {enrolling ? "Enrolling…" : `Enroll ${selected.size || ""}`.trim()}
            </button>
          </div>

          {studentsLoading ? (
            <Loading />
          ) : students.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-400">
              No students found for this field.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-5 py-3">
                    <input
                      type="checkbox"
                      checked={
                        students.length > 0 && selected.size === students.length
                      }
                      onChange={toggleAll}
                      aria-label="Select all"
                    />
                  </th>
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Roll number</th>
                  <th className="px-5 py-3 font-semibold">Semester</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(student.id)}
                        onChange={() => toggleStudent(student.id)}
                        aria-label={`Select ${student.name}`}
                      />
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-800">
                      {student.name}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{student.rollNo}</td>
                    <td className="px-5 py-3 text-gray-500">{student.semester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-400">
          {departmentId
            ? "Select a field to see its students."
            : "Select a department to continue."}
        </p>
      )}
    </div>
  );
}

function CourseEnrollmentPanel({
  departments,
  lockedDepartment,
  onNotify,
}: {
  departments: DepartmentDTO[];
  lockedDepartment?: string | null;
  onNotify: (msg: string | null) => void;
}) {
  const [departmentId, setDepartmentId] = useState(lockedDepartment ?? "");
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const visibleDepartments = lockedDepartment
    ? departments.filter((d) => d.id === lockedDepartment)
    : departments;

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
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Department">
          <select
            disabled={!!lockedDepartment}
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="form-input"
          >
            <option value="">Select a department…</option>
            {visibleDepartments.map((d) => (
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
        <SingleCourseStudentsPanel
          key={courseId}
          departmentId={departmentId}
          courseId={courseId}
          onNotify={onNotify}
        />
      ) : (
        <p className="text-sm text-gray-400">
          {departmentId
            ? "Select a course to enroll students."
            : "Select a department to continue."}
        </p>
      )}
    </div>
  );
}

function SingleCourseStudentsPanel({
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
      onNotify(e instanceof ApiError ? e.message : "Failed to enroll student");
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
                <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
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