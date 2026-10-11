"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Megaphone,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Clock3,
  Users,
  CheckCircle2,
  FileText,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { api, ApiError, type AnnouncementDTO } from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";

export default function FacultyAnnouncementsPage() {
  const [page, setPage] = useState(1);
  return <AnnouncementsInner key={page} page={page} setPage={setPage} />;
}

function AnnouncementsInner({
  page,
  setPage,
}: {
  page: number;
  setPage: (p: number) => void;
}) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const { data, loading, error, reload } = useApiResource<AnnouncementDTO[]>(
    () => api.announcements.list(page),
  );

  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<AnnouncementDTO | null>(null);
  const [editing, setEditing] = useState<AnnouncementDTO | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState({ title: "", body: "" });

  const filteredAnnouncements = useMemo(() => {
    const list = data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.body.toLowerCase().includes(q) ||
        (item.author?.name ?? "").toLowerCase().includes(q),
    );
  }, [data, search]);

  const announcements = data ?? [];
  const totalAnnouncements = announcements.length;
  const mine = announcements.filter(
    (item) => item.author?.id === currentUserId,
  ).length;
  const contributors = new Set(
    announcements.map((item) => item.author?.id).filter(Boolean),
  ).size;
  const latest = announcements[0];

  const hasNext = (data?.length ?? 0) === 10;

  const openCreate = () => {
    setForm({ title: "", body: "" });
    setFormError(null);
    setShowCreate(true);
  };

  const openEdit = (announcement: AnnouncementDTO) => {
    setForm({ title: announcement.title, body: announcement.body });
    setFormError(null);
    setEditing(announcement);
  };

  const closeModals = () => {
    setShowCreate(false);
    setEditing(null);
    setFormError(null);
  };

  const submitForm = async () => {
    if (!form.title.trim() || !form.body.trim()) return;

    setBusy(true);
    setFormError(null);
    try {
      if (editing) {
        await api.announcements.update(editing.id, {
          title: form.title,
          body: form.body,
        });
        setNotice("Announcement updated.");
      } else {
        await api.announcements.create({
          title: form.title,
          body: form.body,
        });
        setNotice("Announcement published.");
      }
      closeModals();
      await reload();
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  const deleteAnnouncement = async (announcement: AnnouncementDTO) => {
    if (!confirm(`Delete "${announcement.title}"?`)) return;
    try {
      await api.announcements.remove(announcement.id);
      setNotice("Announcement deleted.");
      if (selectedAnnouncement?.id === announcement.id) {
        setSelectedAnnouncement(null);
      }
      await reload();
    } catch (e) {
      setNotice(e instanceof ApiError ? e.message : "Failed to delete");
    }
  };

  return (
    <div className="mx-auto max-w-375">
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-600">
            <Megaphone size={13} />
            Faculty Announcement Management
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-950">
            Announcements
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Create and manage announcements for your students and department.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
        >
          <Plus size={17} />
          Create Announcement
        </button>
      </div>

      {notice && (
        <div className="mt-5 rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700">
          {notice}
        </div>
      )}

      {/* Stats */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Total Announcements"
          value={String(totalAnnouncements)}
          description="Published across the university"
          icon={Megaphone}
        />

        <Stat
          label="My Announcements"
          value={String(mine)}
          description="Posted by you"
          icon={CheckCircle2}
        />

        <Stat
          label="Contributors"
          value={String(contributors)}
          description="Faculty and administration"
          icon={Users}
        />

        <Stat
          label="Latest Post"
          value={latest ? new Date(latest.createdAt).toLocaleDateString() : "—"}
          description="Most recent announcement"
          icon={Clock3}
        />
      </div>

      {/* Toolbar */}
      <div className="mt-7 rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
        <div className="flex h-11 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 xl:max-w-md">
          <Search size={17} className="text-gray-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Announcement List */}
        <div className="space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
              Loading announcements…
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-red-600">
              {error}
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
              <Megaphone size={30} className="mx-auto text-gray-300" />
              <h3 className="mt-4 font-semibold text-gray-900">
                No announcements found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or create a new announcement.
              </p>
            </div>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                canManage={announcement.author?.id === currentUserId}
                onView={() => setSelectedAnnouncement(announcement)}
                onEdit={() => openEdit(announcement)}
                onDelete={() => deleteAnnouncement(announcement)}
              />
            ))
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={15} /> Previous
            </button>

            <span className="text-sm text-gray-400">Page {page}</span>

            <button
              disabled={!hasNext}
              onClick={() => setPage(page + 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white">
                <AlertCircle size={17} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-indigo-950">
                  Announcement Tips
                </h3>

                <ul className="mt-3 space-y-2 text-[12px] leading-5 text-indigo-900/70">
                  <li>• Keep important messages concise.</li>
                  <li>• Post reminders before deadlines.</li>
                  <li>• You can edit or delete your own posts.</li>
                  <li>• Announcements are visible to everyone.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <FileText size={17} className="text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900">
                Publishing Workflow
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              <WorkflowStep
                number="01"
                title="Draft"
                description="Prepare the announcement."
              />

              <WorkflowStep
                number="02"
                title="Publish"
                description="Send it to the university feed."
              />

              <WorkflowStep
                number="03"
                title="Manage"
                description="Edit or remove your own posts."
              />
            </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {selectedAnnouncement && (
        <Modal
          title="Announcement Details"
          onClose={() => setSelectedAnnouncement(null)}
        >
          <div className="space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge label="Announcement" tone="indigo" />

                {selectedAnnouncement.author?.id === currentUserId && (
                  <Badge label="Yours" tone="emerald" />
                )}
              </div>

              <h2 className="mt-4 text-xl font-bold text-gray-950">
                {selectedAnnouncement.title}
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">
                {selectedAnnouncement.body}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Info
                label="Author"
                value={selectedAnnouncement.author?.name ?? "Unknown"}
              />
              <Info
                label="Created"
                value={new Date(
                  selectedAnnouncement.createdAt,
                ).toLocaleString()}
              />
              <Info
                label="Last Updated"
                value={new Date(
                  selectedAnnouncement.updatedAt,
                ).toLocaleString()}
              />
              <Info
                label="Role"
                value={selectedAnnouncement.author?.role ?? "—"}
              />
            </div>

            {selectedAnnouncement.author?.id === currentUserId && (
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    const announcement = selectedAnnouncement;
                    setSelectedAnnouncement(null);
                    openEdit(announcement);
                  }}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <span className="inline-flex items-center gap-2">
                    <Pencil size={15} />
                    Edit
                  </span>
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Create/Edit Modal */}
      {(showCreate || editing) && (
        <Modal
          title={editing ? "Edit Announcement" : "Create Announcement"}
          onClose={closeModals}
        >
          <AnnouncementForm
            form={form}
            setForm={setForm}
            editing={Boolean(editing)}
            busy={busy}
            error={formError}
            onCancel={closeModals}
            onSubmit={submitForm}
          />
        </Modal>
      )}
    </div>
  );
}

/* ---------------- Components ---------------- */

function Stat({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof Megaphone;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
            {value}
          </p>
        </div>

        <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon size={18} />
        </div>
      </div>

      <p className="mt-4 text-[11px] text-gray-400">{description}</p>
    </div>
  );
}

function AnnouncementCard({
  announcement,
  canManage,
  onView,
  onEdit,
  onDelete,
}: {
  announcement: AnnouncementDTO;
  canManage: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] transition hover:border-gray-300">
      <div className="flex gap-4">
        <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 sm:grid">
          <Megaphone size={19} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge label="Announcement" tone="indigo" />

            {canManage && <Badge label="Yours" tone="emerald" />}
          </div>

          <h3 className="mt-3 text-base font-semibold text-gray-950">
            {announcement.title}
          </h3>

          <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-500">
            {announcement.body}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <Users size={13} />
              {announcement.author?.name ?? "Unknown"}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={13} />
              {new Date(announcement.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {canManage && (
          <div className="hidden items-start gap-1 sm:flex">
            <button
              onClick={onEdit}
              title="Edit"
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
            >
              <Pencil size={15} />
            </button>

            <button
              onClick={onDelete}
              title="Delete"
              className="rounded-lg p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
        <button
          onClick={onView}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          <span className="inline-flex items-center gap-1.5">
            <Eye size={14} />
            View Details
          </span>
        </button>

        {canManage && (
          <button
            onClick={onEdit}
            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            <span className="inline-flex items-center gap-1.5">
              <Pencil size={14} />
              Edit
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function AnnouncementForm({
  form,
  setForm,
  editing,
  busy,
  error,
  onCancel,
  onSubmit,
}: {
  form: {
    title: string;
    body: string;
  };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  editing: boolean;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-xs font-semibold text-gray-700">
          Announcement Title
        </label>

        <input
          value={form.title}
          onChange={(e) =>
            setForm((current) => ({
              ...current,
              title: e.target.value,
            }))
          }
          placeholder="e.g. Midterm Examination Reminder"
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-indigo-400"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold text-gray-700">
          Message
        </label>

        <textarea
          value={form.body}
          onChange={(e) =>
            setForm((current) => ({
              ...current,
              body: e.target.value,
            }))
          }
          rows={6}
          placeholder="Write your announcement..."
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-indigo-400"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
        <button
          onClick={onCancel}
          disabled={busy}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
        >
          Cancel
        </button>

        <button
          onClick={onSubmit}
          disabled={busy || !form.title.trim() || !form.body.trim()}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
        >
          {busy
            ? "Saving…"
            : editing
              ? "Save Changes"
              : "Create Announcement"}
        </button>
      </div>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <h2 className="text-base font-bold text-gray-950">{title}</h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Badge({
  label,
  tone,
}: {
  label: string;
  tone: "indigo" | "emerald" | "rose" | "amber" | "violet" | "gray";
}) {
  const styles = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-600",
    gray: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles[tone]}`}
    >
      {label}
    </span>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

function WorkflowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gray-100 text-[9px] font-bold text-gray-500">
        {number}
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-800">{title}</p>

        <p className="mt-0.5 text-[11px] text-gray-400">{description}</p>
      </div>
    </div>
  );
}
