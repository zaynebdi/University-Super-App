"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

import { api, ApiError, type AnnouncementDTO } from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";
import {
  ErrorBox,
  Field,
  Loading,
  Modal,
  ModalActions,
  PageHeader,
} from "@/components/admin/ui";

export default function AdminAnnouncementsPage() {
  const [page, setPage] = useState(1);
  return (
    <AnnouncementsInner key={page} page={page} setPage={setPage} />
  );
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
    () => api.announcements.list(page)
  );

  const [editing, setEditing] = useState<AnnouncementDTO | null>(null);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function remove(a: AnnouncementDTO) {
    if (!confirm(`Delete "${a.title}"?`)) return;
    try {
      await api.announcements.remove(a.id);
      setNotice("Announcement deleted.");
      await reload();
    } catch (e) {
      setNotice(e instanceof ApiError ? e.message : "Failed to delete");
    }
  }

  const hasNext = (data?.length ?? 0) === 10;

  return (
    <div className="mx-auto max-w-375">
      <PageHeader
        title="Announcements"
        description="Publish and manage announcements. You can delete any post; you can edit your own."
        action={
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <Plus size={16} /> New announcement
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
        <div className="space-y-3">
          {data?.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-950">{a.title}</h3>
                  <p className="mt-1 text-[11px] text-gray-400">
                    {a.author?.name ?? "Unknown"} ·{" "}
                    {new Date(a.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600">
                    {a.body}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {a.author?.id === currentUserId && (
                    <button
                      onClick={() => setEditing(a)}
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => remove(a)}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {data?.length === 0 && (
            <p className="text-sm text-gray-400">No announcements yet.</p>
          )}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        >
          <ChevronLeft size={15} /> Previous
        </button>
        <span className="text-sm text-gray-400">Page {page}</span>
        <button
          disabled={!hasNext}
          onClick={() => setPage(page + 1)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        >
          Next <ChevronRight size={15} />
        </button>
      </div>

      {creating && (
        <AnnouncementForm
          onClose={() => setCreating(false)}
          onSaved={async () => {
            setCreating(false);
            setNotice("Announcement published.");
            await reload();
          }}
        />
      )}

      {editing && (
        <AnnouncementForm
          announcement={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            setNotice("Announcement updated.");
            await reload();
          }}
        />
      )}
    </div>
  );
}

function AnnouncementForm({
  announcement,
  onClose,
  onSaved,
}: {
  announcement?: AnnouncementDTO;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(announcement?.title ?? "");
  const [body, setBody] = useState(announcement?.body ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (announcement) {
        await api.announcements.update(announcement.id, { title, body });
      } else {
        await api.announcements.create({ title, body });
      }
      onSaved();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title={announcement ? "Edit announcement" : "New announcement"}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Title">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
          />
        </Field>
        <Field label="Body">
          <textarea
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="form-input"
            style={{ height: "auto", padding: "12px" }}
          />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <ModalActions
          busy={busy}
          onClose={onClose}
          submitLabel={announcement ? "Save changes" : "Publish"}
        />
      </form>
    </Modal>
  );
}
