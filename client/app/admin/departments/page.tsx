"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  DownloadCloud,
  ChevronRight,
} from "lucide-react";

import {
  api,
  ApiError,
  type DepartmentDTO,
  type FieldDTO,
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

export default function AdminDepartmentsPage() {
  const { data: session } = useSession();
  const sessionUser = session?.user as
    | { assignedDepartment?: string | null }
    | undefined;
  const isSuper = !!sessionUser && !sessionUser.assignedDepartment;

  const { data: departments, loading, error, reload } = useApiResource<
    { departments: DepartmentDTO[]; fields: FieldDTO[] }
  >(async () => {
    const [depts, fields] = await Promise.all([
      api.departments.list(),
      api.fields.list(),
    ]);
    return { departments: depts, fields };
  });

  const [notice, setNotice] = useState<string | null>(null);
  const [creatingDept, setCreatingDept] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentDTO | null>(null);
  const [creatingField, setCreatingField] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<FieldDTO | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [busy, setBusy] = useState(false);

  const fieldsByDepartment = useMemo(() => {
    const map = new Map<string, FieldDTO[]>();
    for (const field of departments?.fields ?? []) {
      if (!field.departmentId) continue;
      const list = map.get(field.departmentId) ?? [];
      list.push(field);
      map.set(field.departmentId, list);
    }
    return map;
  }, [departments]);

  async function handleDeleteDepartment(department: DepartmentDTO) {
    if (
      !confirm(
        `Delete ${department.name}? This only works when the department has no fields or courses.`
      )
    )
      return;
    setBusy(true);
    setNotice(null);
    try {
      await api.departments.remove(department.id);
      setNotice(`${department.name} deleted.`);
      await reload();
    } catch (e) {
      setNotice(e instanceof ApiError ? e.message : "Failed to delete department");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteField(field: FieldDTO) {
    if (!confirm(`Delete field ${field.name}?`)) return;
    setBusy(true);
    setNotice(null);
    try {
      await api.fields.remove(field.id);
      setNotice(`${field.name} deleted.`);
      await reload();
    } catch (e) {
      setNotice(e instanceof ApiError ? e.message : "Failed to delete field");
    } finally {
      setBusy(false);
    }
  }

  async function handleLoadDefaultData() {
    setSeeding(true);
    setNotice(null);
    try {
      const result = await api.academicData.loadDefault();
      const { created, existed } = result;
      setNotice(
        `Loaded default academic data: ${created.departments} departments, ${created.fields} fields and ${created.courses} courses created (${existed.departments} departments, ${existed.fields} fields and ${existed.courses} courses already existed).`
      );
      await reload();
    } catch (e) {
      setNotice(e instanceof ApiError ? e.message : "Failed to load default data");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="mx-auto max-w-375">
      <PageHeader
        title="Departments"
        description="Departments, fields and the courses inside them. Fields belong to a department and courses belong to a field."
        action={
          isSuper ? (
            <div className="flex gap-2">
              <button
                onClick={handleLoadDefaultData}
                disabled={seeding}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-60"
              >
                {seeding ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <DownloadCloud size={16} />
                )}
                Load default academic data
              </button>
              <button
                onClick={() => setCreatingDept(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                <Plus size={16} /> Add department
              </button>
            </div>
          ) : undefined
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
          {(departments?.departments ?? []).map((department) => {
            const fields = fieldsByDepartment.get(department.id) ?? [];
            return (
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
                    {isSuper && (
                      <>
                        <button
                          onClick={() => setEditingDept(department)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                          title="Edit department"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => handleDeleteDepartment(department)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-40"
                          title="Delete department"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {fields.length === 0 ? (
                    <p className="text-sm text-gray-400">No fields yet.</p>
                  ) : (
                    fields.map((field) => (
                      <div
                        key={field.id}
                        className="rounded-xl border border-gray-100 bg-gray-50/60 p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-indigo-500">
                              {field.code}
                            </span>
                            <span className="text-sm font-semibold text-gray-800">
                              {field.name}
                            </span>
                            <span
                              className={[
                                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                                field.isActive === false
                                  ? "bg-red-50 text-red-600"
                                  : "bg-emerald-50 text-emerald-600",
                              ].join(" ")}
                            >
                              {field.isActive === false ? "Inactive" : "Active"}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setEditingField(field)}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
                              title="Edit field"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              disabled={busy}
                              onClick={() => handleDeleteField(field)}
                              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-40"
                              title="Delete field"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        {field.courses.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {field.courses.map((course) => (
                              <span
                                key={course.id}
                                className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-600 ring-1 ring-gray-200"
                              >
                                <ChevronRight size={10} className="text-gray-300" />
                                {course.code}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  <button
                    onClick={() => setCreatingField(department.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:border-indigo-300 hover:text-indigo-600"
                  >
                    <Plus size={13} /> Add field
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {creatingDept && (
        <DepartmentFormModal
          onClose={() => setCreatingDept(false)}
          onSaved={async () => {
            setCreatingDept(false);
            setNotice("Department created.");
            await reload();
          }}
        />
      )}

      {editingDept && (
        <DepartmentFormModal
          department={editingDept}
          onClose={() => setEditingDept(null)}
          onSaved={async () => {
            setEditingDept(null);
            setNotice("Department updated.");
            await reload();
          }}
        />
      )}

      {creatingField && (
        <FieldFormModal
          departmentId={creatingField}
          departments={departments?.departments ?? []}
          lockedDepartment={
            isSuper ? null : (sessionUser?.assignedDepartment ?? null)
          }
          onClose={() => setCreatingField(null)}
          onSaved={async () => {
            setCreatingField(null);
            setNotice("Field created.");
            await reload();
          }}
        />
      )}

      {editingField && (
        <FieldFormModal
          field={editingField}
          departments={departments?.departments ?? []}
          lockedDepartment={
            isSuper ? null : (sessionUser?.assignedDepartment ?? null)
          }
          onClose={() => setEditingField(null)}
          onSaved={async () => {
            setEditingField(null);
            setNotice("Field updated.");
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
    isActive: department ? department.isActive !== false : true,
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (department) {
        await api.departments.update(department.id, form);
      } else {
        await api.departments.create(form);
      }
      onSaved();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save department");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={department ? "Edit department" : "Add department"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Name">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="form-input"
          />
        </Field>
        <Field label="Code">
          <input
            required
            maxLength={20}
            value={form.code}
            onChange={(e) =>
              setForm({ ...form, code: e.target.value.toUpperCase() })
            }
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
        <ModalActions busy={busy} onClose={onClose} submitLabel={department ? "Save changes" : "Create department"} />
      </form>
    </Modal>
  );
}

function FieldFormModal({
  field,
  departmentId,
  departments,
  lockedDepartment,
  onClose,
  onSaved,
}: {
  field?: FieldDTO;
  departmentId?: string;
  departments: DepartmentDTO[];
  lockedDepartment?: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const initialDepartment = lockedDepartment ?? field?.departmentId ?? departmentId ?? "";
  const departmentLocked = !!lockedDepartment;
  const [form, setForm] = useState({
    name: field?.name ?? "",
    code: field?.code ?? "",
    departmentId: initialDepartment,
    isActive: field ? field.isActive !== false : true,
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const input = {
        name: form.name,
        code: form.code,
        departmentId: form.departmentId,
        isActive: form.isActive,
      };
      if (field) {
        await api.fields.update(field.id, input);
      } else {
        await api.fields.create(input);
      }
      onSaved();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save field");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={field ? "Edit field" : "Add field"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Name">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="form-input"
          />
        </Field>
        <Field label="Code">
          <input
            required
            maxLength={20}
            value={form.code}
            onChange={(e) =>
              setForm({ ...form, code: e.target.value.toUpperCase() })
            }
            className="form-input"
            placeholder="e.g. SE"
          />
        </Field>
        <Field label="Department">
          <select
            required
            disabled={departmentLocked}
            value={form.departmentId}
            onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
            className="form-input"
          >
            <option value="">Select a department…</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} · {d.name}
              </option>
            ))}
          </select>
          {departmentLocked && (
            <span className="mt-1 block text-xs text-gray-400">
              Locked to your department.
            </span>
          )}
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
        <ModalActions busy={busy} onClose={onClose} submitLabel={field ? "Save changes" : "Create field"} />
      </form>
    </Modal>
  );
}