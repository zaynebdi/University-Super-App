"use client";

import { useState } from "react";
import { Plus, Pencil, Ban } from "lucide-react";

import { api, ApiError, type UserDTO } from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";
import {
  ErrorBox,
  Field,
  Loading,
  Modal,
  ModalActions,
} from "@/components/admin/ui";

export default function AdminUsersPage() {
  const { data, loading, error, reload } = useApiResource<UserDTO[]>(() =>
    api.users.list()
  );

  const [notice, setNotice] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<UserDTO | null>(null);
  const [busy, setBusy] = useState(false);

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
              {data?.map((user) => (
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
              {data?.length === 0 && (
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
          onClose={() => setShowCreate(false)}
          onCreated={async (name) => {
            setShowCreate(false);
            setNotice(`${name} created.`);
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
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (name: string) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student" as "student" | "teacher",
    rollNo: "",
    department: "",
    semester: 1,
    designation: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
              rollNo: form.rollNo,
              department: form.department,
              semester: Number(form.semester),
            }
          : {
              name: form.name,
              email: form.email,
              password: form.password,
              role: "teacher" as const,
              department: form.department,
              designation: form.designation || undefined,
            };
      await api.auth.register(input);
      onCreated(form.name);
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
              setForm({ ...form, role: e.target.value as "student" | "teacher" })
            }
            className="form-input"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </Field>
        {form.role === "student" && (
          <>
            <Field label="Roll number">
              <input
                required
                value={form.rollNo}
                onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
                className="form-input"
              />
            </Field>
            <Field label="Department">
              <input
                required
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
                className="form-input"
              />
            </Field>
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
            <Field label="Department">
              <input
                required
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
                className="form-input"
              />
            </Field>
            <Field label="Designation">
              <input
                value={form.designation}
                onChange={(e) =>
                  setForm({ ...form, designation: e.target.value })
                }
                className="form-input"
              />
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

