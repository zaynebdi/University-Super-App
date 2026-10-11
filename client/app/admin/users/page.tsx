"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Ban } from "lucide-react";

import {
  api,
  ApiError,
  type UserDTO,
  type CourseDTO,
  type DepartmentDTO,
} from "@/lib/api-client";
import { Designations, DesignationLabels } from "@/lib/constants";
import { useApiResource } from "@/lib/use-api-resource";
import {
  ErrorBox,
  Field,
  Loading,
  Modal,
  ModalActions,
} from "@/components/admin/ui";

export default function AdminUsersPage() {
  const { data, loading, error, reload } = useApiResource<{
    users: UserDTO[];
    departments: DepartmentDTO[];
  }>(async () => {
    const [users, departments] = await Promise.all([
      api.users.list(),
      api.departments.list(),
    ]);
    return { users, departments };
  });

  const [notice, setNotice] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<UserDTO | null>(null);
  const [busy, setBusy] = useState(false);

  const activeDepartments =
    data?.departments.filter((d) => d.isActive !== false) ?? [];

  async function handleDeactivate(user: UserDTO) {
    if (!confirm(`Deactivate ${user.name}?`)) return;
    setBusy(true);
    setNotice(null);
    try {
      await api.users.remove(user.id);
      setNotice(`${user.name} deactivated.`);
      await reload();
    } catch (e) {
      setNotice(e instanceof ApiError ? e.message : "Failed to deactivate user");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-375">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-950">
            Users
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage student, teacher and admin accounts.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          <Plus size={16} /> Add user
        </button>
      </div>

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
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/60">
                  <td className="px-5 py-3 font-medium text-gray-800">
                    {user.name}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{user.email}</td>
                  <td className="px-5 py-3 capitalize text-gray-600">
                    {user.role}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        user.isActive === false
                          ? "bg-red-50 text-red-600"
                          : "bg-emerald-50 text-emerald-600",
                      ].join(" ")}
                    >
                      {user.isActive === false ? "Inactive" : "Active"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditing(user)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => handleDeactivate(user)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-40"
                        title="Deactivate"
                      >
                        <Ban size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data?.users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateUserModal
          departments={activeDepartments}
          onClose={() => setShowCreate(false)}
          onCreated={async (name, rollNo) => {
            setShowCreate(false);
            setNotice(
              rollNo ? `${name} created. Roll number: ${rollNo}` : `${name} created.`
            );
            await reload();
          }}
        />
      )}

      {editing && (
        <EditUserModal
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            setNotice("User updated.");
            await reload();
          }}
        />
      )}
    </div>
  );
}

function CreateUserModal({
  departments,
  onClose,
  onCreated,
}: {
  departments: DepartmentDTO[];
  onClose: () => void;
  onCreated: (name: string, rollNo?: string) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student" as "student" | "teacher",
    departmentId: "",
    semester: 1,
    designation: "",
    courseIds: [] as string[],
  });
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (form.role !== "teacher" || !form.departmentId) {
      setCourses([]);
      return;
    }
    let cancelled = false;
    setCoursesLoading(true);
    api.courses
      .list({ departmentId: form.departmentId })
      .then((cs) => {
        if (!cancelled) setCourses(cs);
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
  }, [form.role, form.departmentId]);

  function toggleCourse(courseId: string) {
    setForm((prev) => ({
      ...prev,
      courseIds: prev.courseIds.includes(courseId)
        ? prev.courseIds.filter((id) => id !== courseId)
        : [...prev.courseIds, courseId],
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const input =
        form.role === "student"
          ? {
              name: form.name,
              email: form.email,
              password: form.password,
              role: "student" as const,
              departmentId: form.departmentId,
              semester: Number(form.semester),
            }
          : {
              name: form.name,
              email: form.email,
              password: form.password,
              role: "teacher" as const,
              departmentId: form.departmentId,
              designation: form.designation || undefined,
              courseIds: form.courseIds.length > 0 ? form.courseIds : undefined,
            };
      const created = await api.auth.register(input);
      onCreated(form.name, created.rollNo);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to create user");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Add user" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Name">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="form-input"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="form-input"
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="form-input"
          />
        </Field>
        <Field label="Role">
          <select
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value as "student" | "teacher",
                courseIds: [],
              })
            }
            className="form-input"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </Field>
        <Field label="Department">
          <select
            required
            value={form.departmentId}
            onChange={(e) =>
              setForm({ ...form, departmentId: e.target.value, courseIds: [] })
            }
            className="form-input"
          >
            <option value="">Select a department…</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} · {d.name}
              </option>
            ))}
          </select>
        </Field>
        {form.role === "student" && (
          <>
            <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
              Roll number is generated automatically based on the department.
            </p>
            <Field label="Semester">
              <input
                type="number"
                required
                min={1}
                max={12}
                value={form.semester}
                onChange={(e) =>
                  setForm({ ...form, semester: Number(e.target.value) })
                }
                className="form-input"
              />
            </Field>
          </>
        )}
        {form.role === "teacher" && (
          <>
            <Field label="Designation">
              <select
                value={form.designation}
                onChange={(e) =>
                  setForm({ ...form, designation: e.target.value })
                }
                className="form-input"
              >
                <option value="">Select a designation…</option>
                {Designations.map((d) => (
                  <option key={d} value={d}>
                    {DesignationLabels[d]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Courses (of the selected department)">
              {coursesLoading ? (
                <p className="text-sm text-gray-400">Loading courses…</p>
              ) : courses.length === 0 ? (
                <p className="text-sm text-gray-400">
                  {form.departmentId
                    ? "No courses in this department yet."
                    : "Select a department to see its courses."}
                </p>
              ) : (
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-3">
                  {courses.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={form.courseIds.includes(c.id)}
                        onChange={() => toggleCourse(c.id)}
                      />
                      {c.code} · {c.title}
                    </label>
                  ))}
                </div>
              )}
            </Field>
          </>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <ModalActions busy={busy} onClose={onClose} submitLabel="Create user" />
      </form>
    </Modal>
  );
}

function EditUserModal({
  user,
  onClose,
  onSaved,
}: {
  user: UserDTO;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone ?? "",
    isActive: user.isActive !== false,
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.users.update(user.id, {
        name: form.name,
        email: form.email,
        role: form.role,
        phone: form.phone,
        isActive: form.isActive,
      });
      onSaved();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to update user");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={`Edit ${user.name}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Name">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="form-input"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="form-input"
          />
        </Field>
        <Field label="Role">
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="form-input"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </Field>
        <Field label="Phone">
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="form-input"
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <ModalActions busy={busy} onClose={onClose} submitLabel="Save changes" />
      </form>
    </Modal>
  );
}