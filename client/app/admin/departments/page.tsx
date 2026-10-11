"use client";

import { useState } from "react";
import { Plus, Pencil, PauseCircle } from "lucide-react";

import { api, ApiError, type DepartmentDTO } from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";
import {
  ErrorBox,
  Field,
  Loading,
  Modal,
  ModalActions,
  PageHeader,
} from "@/components/admin/ui";

export default function AdminDepartmentsPage() {
  const { data, loading, error, reload } = useApiResource<DepartmentDTO[]>(() =>
    api.departments.list()
  );

  const [notice, setNotice] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<DepartmentDTO | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleDeactivate(department: DepartmentDTO) {
    if (!confirm(`Deactivate ${department.name}?`)) return;
    setBusy(true);
    setNotice(null);
    try {
      await api.departments.remove(department.id);
      setNotice(`${department.name} deactivated.`);
      await reload();
    } catch (e) {
      setNotice(
        e instanceof ApiError ? e.message : "Failed to deactivate department"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-375">
      <PageHeader
        title="Departments"
        description="Create departments, set department codes and review the courses inside them."
        action={
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <Plus size={16} /> Add department
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
          {data?.map((department) => (
            <div
              key={department.id}
              className="rounded-2xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-indigo-600">
                      {department.code}
                    </span>
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        department.isActive === false
                          ? "bg-red-50 text-red-600"
                          : "bg-emerald-50 text-emerald-600",
                      ].join(" ")}
                    >
                      {department.isActive === false ? "Inactive" : "Active"}
                    </span>
                  </div>
                  <h2 className="mt-1 text-lg font-bold text-gray-950">
                    {department.name}
                  </h2>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditing(department)}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    disabled={busy || department.isActive === false}
                    onClick={() => handleDeactivate(department)}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-40"
                    title="Deactivate"
                  >
                    <PauseCircle size={15} />
                  </button>
                </div>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Courses ({department.courseCount})
                </div>
                {department.courses.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-400">
                    No courses in this department.
                  </p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {department.courses.map((c) => (
                      <span
                        key={c.id}
                        className="rounded-lg bg-gray-100 px-2 py-1 text-[12px] font-medium text-gray-600"
                        title={c.title}
                      >
                        {c.code}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {data?.length === 0 && (
            <p className="text-sm text-gray-400">
              No departments yet. Create one to assign courses and users.
            </p>
          )}
        </div>
      )}

      {creating && (
        <DepartmentFormModal
          onClose={() => setCreating(false)}
          onSaved={async () => {
            setCreating(false);
            setNotice("Department created.");
            await reload();
          }}
        />
      )}

      {editing && (
        <DepartmentFormModal
          department={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            setNotice("Department updated.");
            await reload();
          }}
        />
      )}
    </div>
  );
}

function DepartmentFormModal({
  department,
  onClose,
  onSaved,
}: {
  department?: DepartmentDTO;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: department?.name ?? "",
    code: department?.code ?? "",
    isActive: department?.isActive ?? true,
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        code: form.code,
        isActive: form.isActive,
      };
      if (department) {
        await api.departments.update(department.id, payload);
      } else {
        await api.departments.create(payload);
      }
      onSaved();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save department");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title={department ? "Edit department" : "Add department"}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Name">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="form-input"
            placeholder="e.g. Computer Science"
          />
        </Field>
        <Field label="Code">
          <input
            required
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="form-input"
            placeholder="e.g. CS"
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
        <ModalActions
          busy={busy}
          onClose={onClose}
          submitLabel={department ? "Save changes" : "Create department"}
        />
      </form>
    </Modal>
  );
}