"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, Pencil, Ban, CheckCircle2, Search, ChevronLeft, ChevronRight } from "lucide-react";

import {
  api,
  ApiError,
  type UserDTO,
  type CourseDTO,
  type DepartmentDTO,
  type FieldDTO,
  type UserRole,
  type UsersListResult,
} from "@/lib/api-client";
import { AdminDesignations, Designations, DesignationLabels } from "@/lib/constants";
import { useApiResource } from "@/lib/use-api-resource";
import {
  ErrorBox,
  Field,
  Loading,
  Modal,
  ModalActions,
} from "@/components/admin/ui";

type Tab = "student" | "teacher" | "admin";

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const sessionUser = session?.user as
    | { id?: string; role?: string; assignedDepartment?: string | null }
    | undefined;

  const isSuper = sessionUser?.role === "admin" && !sessionUser?.assignedDepartment;
  const lockedDepartment = sessionUser?.assignedDepartment ?? null;

  const { data: departments, error: deptError } = useApiResource<DepartmentDTO[]>(() =>
    api.departments.list()
  );

  const [activeTab, setActiveTab] = useState<Tab>(isSuper ? "student" : "student");
  const [reloadToken, setReloadToken] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<UserDTO | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const activeDepartments =
    departments?.filter((d) => d.isActive !== false) ?? [];

  const reloadAll = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    if (editing) setNotice(null);
  }, [editing]);

  return (
    <div className="mx-auto max-w-375">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-950">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isSuper
              ? "Create and manage student, teacher and admin accounts."
              : "Create and manage the students and teachers of your department."}
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

      {deptError && <ErrorBox message={deptError} />}

      <div className="mb-4 flex gap-1 rounded-xl bg-gray-100 p-1">
        <TabButton active={activeTab === "student"} onClick={() => setActiveTab("student")}>
          Students
        </TabButton>
        <TabButton active={activeTab === "teacher"} onClick={() => setActiveTab("teacher")}>
          Teachers
        </TabButton>
        {isSuper && (
          <TabButton active={activeTab === "admin"} onClick={() => setActiveTab("admin")}>
            Admins
          </TabButton>
        )}
      </div>

      <UsersTable
        key={`${activeTab}-${reloadToken}`}
        role={activeTab}
        departments={activeDepartments}
        lockedDepartment={lockedDepartment}
        showAdminsTab={!!isSuper}
        currentUserId={sessionUser?.id}
        onEdit={(user) => setEditing(user)}
        onNotice={(message) => setNotice(message)}
      />

      {showCreate && (
        <CreateUserModal
          departments={activeDepartments}
          lockedDepartment={lockedDepartment}
          isSuper={!!isSuper}
          onClose={() => setShowCreate(false)}
          onCreated={async (created: { name: string; role: UserRole; rollNo?: string }) => {
            setShowCreate(false);
            setActiveTab(created.role);
            setNotice(
              created.rollNo
                ? `${created.name} created. Roll number: ${created.rollNo}`
                : `${created.name} created.`
            );
            setReloadToken((t) => t + 1);
          }}
        />
      )}

      {editing && (
        <EditUserModal
          user={editing}
          departments={activeDepartments}
          isSuper={!!isSuper}
          currentUserId={sessionUser?.id}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            setNotice("User updated.");
            setReloadToken((t) => t + 1);
          }}
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
        active ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function UsersTable({
  role,
  departments,
  lockedDepartment,
  showAdminsTab,
  currentUserId,
  onEdit,
  onNotice,
}: {
  role: UserRole;
  departments: DepartmentDTO[];
  lockedDepartment: string | null;
  showAdminsTab: boolean;
  currentUserId?: string;
  onEdit: (user: UserDTO) => void;
  onNotice: (message: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<UsersListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const effectiveDepartment = lockedDepartment ?? department;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.users
      .list({
        role,
        search: search || undefined,
        department: effectiveDepartment || undefined,
        isActive: status === "all" || status === "" ? undefined : status === "active",
        page,
        pageSize: PAGE_SIZE,
      })
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setPage(result.page);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof ApiError ? e.message : "Failed to load users");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [role, search, effectiveDepartment, status, page]);

  async function toggleActive(user: UserDTO) {
    const deactivate = user.isActive !== false;
    if (deactivate && !confirm(`Deactivate ${user.name}?`)) return;
    setBusyId(user.id);
    try {
      if (deactivate) {
        await api.users.remove(user.id);
        onNotice(`${user.name} deactivated.`);
      } else {
        await api.users.update(user.id, { isActive: true });
        onNotice(`${user.name} activated.`);
      }
      setData((prev) =>
        prev
          ? {
              ...prev,
              users: prev.users.map((u) =>
                u.id === user.id ? { ...u, isActive: !deactivate } : u
              ),
            }
          : prev
      );
    } catch (e) {
      onNotice(e instanceof ApiError ? e.message : "Failed to update user");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
        <div className="relative min-w-52 flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={role === "student" ? "Search name, email or roll number…" : "Search name or email…"}
            className="form-input pl-9"
          />
        </div>
        {lockedDepartment ? (
          <select disabled value={departments[0]?.id ?? ""} className="form-input w-52">
            <option value={departments[0]?.id ?? ""}>
              {departments[0] ? `${departments[0].code} · ${departments[0].name}` : "Your department"}
            </option>
          </select>
        ) : (
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPage(1);
            }}
            className="form-input w-52"
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} · {d.name}
              </option>
            ))}
          </select>
        )}
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="form-input w-40"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading && !data ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                {role === "student" && <th className="px-5 py-3 font-semibold">Roll No.</th>}
                {role !== "admin" && <th className="px-5 py-3 font-semibold">Department</th>}
                {role === "admin" && <th className="px-5 py-3 font-semibold">Scope</th>}
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/60">
                  <td className="px-5 py-3 font-medium text-gray-800">{user.name}</td>
                  <td className="px-5 py-3 text-gray-500">{user.email}</td>
                  {role === "student" && (
                    <td className="px-5 py-3 font-mono text-xs text-gray-600">
                      {user.rollNo ?? "—"}
                    </td>
                  )}
                  {role !== "admin" && (
                    <td className="px-5 py-3 text-gray-500">{user.department || "Unassigned"}</td>
                  )}
                  {role === "admin" && (
                    <td className="px-5 py-3 text-gray-500">
                      {user.assignedDepartmentId
                        ? departments.find((d) => d.id === user.assignedDepartmentId)?.name ??
                          "Department admin"
                        : "All departments (super admin)"}
                    </td>
                  )}
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
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => onEdit(user)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      {user.id !== currentUserId && (
                        <button
                          disabled={busyId === user.id}
                          onClick={() => toggleActive(user)}
                          className={[
                            "rounded-lg p-2 disabled:opacity-40",
                            user.isActive === false
                              ? "text-emerald-600 hover:bg-emerald-50"
                              : "text-red-500 hover:bg-red-50",
                          ].join(" ")}
                          title={user.isActive === false ? "Activate" : "Deactivate"}
                        >
                          {user.isActive === false ? <CheckCircle2 size={15} /> : <Ban size={15} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {data && data.users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                    No {role}s found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {data && (
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-sm text-gray-500">
          <span>
            {data.total} {data.total === 1 ? "user" : "users"} · Page {data.page} of {data.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={data.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              disabled={data.page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateUserModal({
  departments,
  lockedDepartment,
  isSuper,
  onClose,
  onCreated,
}: {
  departments: DepartmentDTO[];
  lockedDepartment: string | null;
  isSuper: boolean;
  onClose: () => void;
  onCreated: (created: { name: string; role: UserRole; rollNo?: string }) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student" as UserRole,
    departmentId: lockedDepartment ?? "",
    fieldId: "",
    semester: 1,
    designation: "",
    courseIds: [] as string[],
  });
  const [fields, setFields] = useState<FieldDTO[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const lockDepartment = !!lockedDepartment;

  useEffect(() => {
    if (form.role !== "student" || !form.departmentId) {
      setFields([]);
      setForm((prev) => ({ ...prev, fieldId: "" }));
      return;
    }
    let cancelled = false;
    setFieldsLoading(true);
    api.fields
      .list({ departmentId: form.departmentId })
      .then((fs) => {
        if (!cancelled) setFields(fs);
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
  }, [form.role, form.departmentId]);

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
      let input;
      if (form.role === "student") {
        input = {
          name: form.name,
          email: form.email,
          password: form.password,
          role: "student" as const,
          departmentId: form.departmentId,
          fieldId: form.fieldId || undefined,
          semester: Number(form.semester),
        };
      } else if (form.role === "teacher") {
        input = {
          name: form.name,
          email: form.email,
          password: form.password,
          role: "teacher" as const,
          departmentId: form.departmentId,
          designation: form.designation || undefined,
          courseIds: form.courseIds.length > 0 ? form.courseIds : undefined,
        };
      } else {
        input = {
          name: form.name,
          email: form.email,
          password: form.password,
          role: "admin" as const,
          departmentId: form.departmentId || null,
          designation: form.designation || undefined,
        };
      }
      const created = await api.auth.register(input);
      onCreated({ name: form.name, role: created.role as UserRole, rollNo: created.rollNo });
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
                role: e.target.value as UserRole,
                courseIds: [],
                fieldId: "",
                departmentId: lockedDepartment ?? "",
              })
            }
            className="form-input"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            {isSuper && <option value="admin">Admin</option>}
          </select>
        </Field>
        <Field label={form.role === "admin" ? "Department scope" : "Department"}>
          <select
            required={form.role !== "admin"}
            disabled={lockDepartment}
            value={form.departmentId}
            onChange={(e) =>
              setForm({ ...form, departmentId: e.target.value, fieldId: "", courseIds: [] })
            }
            className="form-input"
          >
            {form.role === "admin" && (
              <option value="">All departments (super admin)</option>
            )}
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} · {d.name}
              </option>
            ))}
          </select>
          {lockDepartment && (
            <span className="mt-1 block text-xs text-gray-400">
              Locked to your department.
            </span>
          )}
        </Field>
        {form.role === "student" && (
          <>
            <Field label="Field (of the selected department)">
              {fieldsLoading ? (
                <p className="text-sm text-gray-400">Loading fields…</p>
              ) : fields.length === 0 ? (
                <p className="text-sm text-gray-400">
                  {form.departmentId
                    ? "No fields in this department yet."
                    : "Select a department to see its fields."}
                </p>
              ) : (
                <select
                  value={form.fieldId}
                  onChange={(e) => setForm({ ...form, fieldId: e.target.value })}
                  className="form-input"
                >
                  <option value="">No field selected</option>
                  {fields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.code} · {f.name}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
              Roll number is generated automatically by the server using the
              department code, e.g. CS-2026-001. It is shown after creation.
            </p>
            <Field label="Semester">
              <input
                type="number"
                required
                min={1}
                max={12}
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
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
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
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
        {form.role === "admin" && (
          <Field label="Designation">
            <select
              value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
              className="form-input"
            >
              <option value="">Select a designation…</option>
              {AdminDesignations.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <ModalActions busy={busy} onClose={onClose} submitLabel="Create user" />
      </form>
    </Modal>
  );
}

function EditUserModal({
  user,
  departments,
  isSuper,
  currentUserId,
  onClose,
  onSaved,
}: {
  user: UserDTO;
  departments: DepartmentDTO[];
  isSuper: boolean;
  currentUserId?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    isActive: user.isActive !== false,
    role: user.role as UserRole,
    assignedDepartmentId: user.assignedDepartmentId ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const isAdminRow = user.role === "admin";
      await api.users.update(user.id, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        isActive: form.isActive,
        ...(isSuper && isAdminRow
          ? {
              role: form.role,
              assignedDepartment: form.assignedDepartmentId || null,
            }
          : {}),
      });
      onSaved();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to update user");
    } finally {
      setBusy(false);
    }
  }

  const isSelf = currentUserId === user.id;

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
        <Field label="Phone">
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="form-input"
          />
        </Field>
        {isSuper && user.role === "admin" && (
          <>
            <Field label="Role">
              <select
                value={form.role}
                disabled={isSelf}
                onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                className="form-input"
              >
                <option value="admin">Admin</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </Field>
            <Field label="Department scope">
              <select
                value={form.assignedDepartmentId}
                disabled={isSelf}
                onChange={(e) =>
                  setForm({ ...form, assignedDepartmentId: e.target.value })
                }
                className="form-input"
              >
                <option value="">All departments (super admin)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} · {d.name}
                  </option>
                ))}
              </select>
            </Field>
          </>
        )}
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.isActive}
            disabled={isSelf}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active
        </label>
        {isSelf && <p className="text-xs text-gray-400">You cannot deactivate or demote yourself.</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <ModalActions busy={busy} onClose={onClose} submitLabel="Save changes" />
      </form>
    </Modal>
  );
}