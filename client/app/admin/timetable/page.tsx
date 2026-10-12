"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import {
  api,
  ApiError,
  type CourseDTO,
  type TimetableEntryDTO,
} from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";
import { ErrorBox, Field, Loading, PageHeader } from "@/components/admin/ui";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

type Data = {
  courses: CourseDTO[];
  entries: TimetableEntryDTO[];
};

export default function AdminTimetablePage() {
  const { data, loading, error, reload } = useApiResource<Data>(async () => {
    const [courses, entries] = await Promise.all([
      api.courses.list(),
      api.timetable.list(),
    ]);
    return { courses, entries };
  });

  const courses = data?.courses ?? [];
  const entries = data?.entries ?? [];

  const [form, setForm] = useState({
    courseId: "",
    day: "Monday",
    startTime: "09:00",
    endTime: "10:00",
    room: "",
  });
  const [notice, setNotice] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  const [editEntry, setEditEntry] = useState<TimetableEntryDTO | null>(null);
  const [editForm, setEditForm] = useState({
    courseId: "",
    day: "Monday",
    startTime: "09:00",
    endTime: "10:00",
    room: "",
  });
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      await api.timetable.create(form);
      setForm({ ...form, room: "" });
      setNotice({ ok: true, message: "Timetable entry created." });
      await reload();
    } catch (e) {
      setNotice({
        ok: false,
        message: e instanceof ApiError ? e.message : "Failed to create entry",
      });
    } finally {
      setBusy(false);
    }
  }

  async function remove(entry: TimetableEntryDTO) {
    if (!confirm("Delete this timetable entry?")) return;
    try {
      await api.timetable.remove(entry.id);
      await reload();
    } catch (e) {
      setNotice({
        ok: false,
        message: e instanceof ApiError ? e.message : "Failed to delete entry",
      });
    }
  }

  function openEdit(entry: TimetableEntryDTO) {
    setEditEntry(entry);
    setEditForm({
      courseId: entry.courseId ?? "",
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      room: entry.room,
    });
    setEditError(null);
  }

  async function saveEdit() {
    if (!editEntry) return;
    setEditBusy(true);
    setEditError(null);
    try {
      await api.timetable.update(editEntry.id, editForm);
      setEditEntry(null);
      await reload();
    } catch (e) {
      setEditError(
        e instanceof ApiError ? e.message : "Failed to update entry"
      );
    } finally {
      setEditBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-375">
      <PageHeader
        title="Timetable"
        description="Manage class slots. Clashes for the room or teacher are rejected."
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-bold text-gray-950">Add class slot</h2>

        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorBox message={error} />
        ) : (
          <form onSubmit={add} className="grid gap-4 md:grid-cols-2">
            <Field label="Course">
              <select
                required
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                className="form-input"
              >
                <option value="">Select course…</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Day">
              <select
                value={form.day}
                onChange={(e) => setForm({ ...form, day: e.target.value })}
                className="form-input"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Start time">
              <input
                type="time"
                required
                value={form.startTime}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
                className="form-input"
              />
            </Field>
            <Field label="End time">
              <input
                type="time"
                required
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="form-input"
              />
            </Field>
            <Field label="Room">
              <input
                required
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                className="form-input"
              />
            </Field>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                <Plus size={16} /> Add slot
              </button>
            </div>
          </form>
        )}

        {notice && (
          <p
            className={[
              "mt-4 text-sm",
              notice.ok ? "text-emerald-600" : "text-red-600",
            ].join(" ")}
          >
            {notice.message}
          </p>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-bold text-gray-950">Scheduled classes</h2>

        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorBox message={error} />
        ) : entries.length === 0 ? (
          <p className="text-sm text-gray-400">No timetable entries yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Course</th>
                  <th className="px-4 py-2.5 font-semibold">Day</th>
                  <th className="px-4 py-2.5 font-semibold">Time</th>
                  <th className="px-4 py-2.5 font-semibold">Room</th>
                  <th className="px-4 py-2.5 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-2.5 font-medium text-gray-800">
                      {entry.course?.code ?? entry.courseId ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{entry.day}</td>
                    <td className="px-4 py-2.5 text-gray-500">
                      {entry.startTime}–{entry.endTime}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{entry.room}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(entry)}
                          className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => remove(entry)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-950">
                Edit class slot
              </h3>
              <button
                onClick={() => setEditEntry(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Course">
                <select
                  value={editForm.courseId}
                  onChange={(e) =>
                    setEditForm({ ...editForm, courseId: e.target.value })
                  }
                  className="form-input"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} · {c.title}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Day">
                <select
                  value={editForm.day}
                  onChange={(e) =>
                    setEditForm({ ...editForm, day: e.target.value })
                  }
                  className="form-input"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Start time">
                <input
                  type="time"
                  value={editForm.startTime}
                  onChange={(e) =>
                    setEditForm({ ...editForm, startTime: e.target.value })
                  }
                  className="form-input"
                />
              </Field>
              <Field label="End time">
                <input
                  type="time"
                  value={editForm.endTime}
                  onChange={(e) =>
                    setEditForm({ ...editForm, endTime: e.target.value })
                  }
                  className="form-input"
                />
              </Field>
              <Field label="Room">
                <input
                  value={editForm.room}
                  onChange={(e) =>
                    setEditForm({ ...editForm, room: e.target.value })
                  }
                  className="form-input"
                />
              </Field>
            </div>

            {editError && (
              <div className="mt-4">
                <ErrorBox message={editError} />
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditEntry(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveEdit()}
                disabled={editBusy}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {editBusy && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
