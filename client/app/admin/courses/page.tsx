"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Users } from "lucide-react";

import {
  api,
  ApiError,
  type CourseDTO,
  type TeacherProfileDTO,
  type DepartmentDTO,
} from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";
import {
  ErrorBox,
  Field,
  Loading,
  Modal,
  ModalActions,
  PageHeader,
} from "@/components/admin/ui";

export default function AdminCoursesPage() {
  const { data, loading, error, reload } = useApiResource<{
    courses: CourseDTO[];
    teachers: TeacherProfileDTO[];
    departments: DepartmentDTO[];
  }>(async () => {
    const [courses, teachers, departments] = await Promise.all([
      api.courses.list(),
      api.teachers.list(),
      api.departments.list(),
    ]);
    return { courses, teachers, departments };
  });

  const [notice, setNotice] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<CourseDTO | null>(null);

  const activeDepartments =
    data?.departments.filter((d) => d.isActive !== false) ?? [];

  async function handleDelete(course: CourseDTO) {
    if (
      !confirm(
        `Delete ${course.code}? This also removes its enrollments, timetable, attendance and results.`
      )
    )
      return;
    setNotice(null);
    try {
      await api.courses.remove(course.id);
      setNotice(`${course.code} deleted.`);
      await reload();
    } catch (e) {
      setNotice(e instanceof ApiError ? e.message : "Failed to delete course");
    }
  }

  return (
    <div className="mx-auto max-w-375">
      <PageHeader
        title="Courses"
        description="Create courses, assign teachers, departments and manage enrollments."
        action={
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <Plus size={16} /> Add course
          </button>
        }
      />

      {notice && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700">
          {notice}
        </div>
      )}

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data?.courses.map((course) => (
            <div
              key={course.id}
              className="rounded-2xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-indigo-600">
                      {course.code}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
                      {course.department?.name ?? "Unassigned"}
                    </span>
                  </div>
                  <h2 className="mt-1 text-lg font-bold text-gray-950">
                    {course.title}
                  </h2>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-500">
                {course.teacher?.name ?? "No teacher assigned"}
              </p>
              <p className="mt-1 text-[11px] text-gray-400">
                {course.creditHours} credit hours
              </p>

              <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
                <Link
                  href={`/admin/courses/${course.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  <Users size={14} /> Students
                </Link>
                <button
                  onClick={() => setEditing(course)}
                  className="ml-auto rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                  title="Edit"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(course)}
                  className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
          {data?.courses.length === 0 && (
            <p className="text-sm text-gray-400">No courses yet.</p>
          )}
        </div>
      )}

      {creating && (
        <CourseFormModal
          teachers={data?.teachers ?? []}
          departments={activeDepartments}
          onClose={() => setCreating(false)}
          onSaved={async () => {
            setCreating(false);
            setNotice("Course created.");
            await reload();
          }}
        />
      )}

      {editing && (
        <CourseFormModal
          teachers={data?.teachers ?? []}
          departments={activeDepartments}
          course={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            setNotice("Course updated.");
            await reload();
          }}
        />
      )}
    </div>
  );
}

function CourseFormModal({
  teachers,
  departments,
  course,
  onClose,
  onSaved,
}: {
  teachers: TeacherProfileDTO[];
  departments: DepartmentDTO[];
  course?: CourseDTO;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    code: course?.code ?? "",
    title: course?.title ?? "",
    teacherId: course?.teacher?.id ?? "",
    departmentId: course?.department?.id ?? "",
    semester: course?.semester ?? 1,
    creditHours: course?.creditHours ?? 3,
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = {
        code: form.code,
        title: form.title,
        teacherId: form.teacherId || null,
        departmentId: form.departmentId || null,
        semester: Number(form.semester),
        creditHours: Number(form.creditHours),
      };
      if (course) {
        await api.courses.update(course.id, payload);
      } else {
        await api.courses.create(payload);
      }
      onSaved();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save course");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={course ? "Edit course" : "Add course"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Course code">
          <input
            required
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="form-input"
          />
        </Field>
        <Field label="Title">
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="form-input"
          />
        </Field>
        <Field label="Department">
          <select
            value={form.departmentId}
            onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
            className="form-input"
          >
            <option value="">Unassigned</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} · {d.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Teacher">
          <select
            value={form.teacherId}
            onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
            className="form-input"
          >
            <option value="">Unassigned</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.department || "Unassigned"})
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Semester">
            <input
              type="number"
              min={1}
              max={12}
              required
              value={form.semester}
              onChange={(e) =>
                setForm({ ...form, semester: Number(e.target.value) })
              }
              className="form-input"
            />
          </Field>
          <Field label="Credit hours">
            <input
              type="number"
              min={1}
              max={6}
              required
              value={form.creditHours}
              onChange={(e) =>
                setForm({ ...form, creditHours: Number(e.target.value) })
              }
              className="form-input"
            />
          </Field>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <ModalActions
          busy={busy}
          onClose={onClose}
          submitLabel={course ? "Save changes" : "Create course"}
        />
      </form>
    </Modal>
  );
}