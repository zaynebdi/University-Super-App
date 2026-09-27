"use client";

import { useMemo, useState } from "react";
import {
  Megaphone,
  Plus,
  Search,
  Pin,
  Eye,
  Pencil,
  Trash2,
  Send,
  Clock3,
  Users,
  CheckCircle2,
  FileText,
  X,
  AlertCircle,
  MoreHorizontal,
} from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  body: string;
  category:
    | "Academic"
    | "Examination"
    | "Events"
    | "Administration"
    | "General";
  priority: "Normal" | "Important" | "Urgent";
  audience: string;
  course?: string;
  status: "Published" | "Scheduled" | "Draft";
  createdAt: string;
  publishAt?: string;
  reads: number;
  totalReach: number;
  pinned: boolean;
};

const initialAnnouncements: Announcement[] = [
  {
    id: "ann-001",
    title: "Software Architecture Project Guidelines",
    body: "The final project guidelines have been updated. Please review the architecture requirements before submitting your project.",
    category: "Academic",
    priority: "Important",
    audience: "SE-401 Students",
    course: "SE-401",
    status: "Published",
    createdAt: "24 Sep 2026",
    publishAt: "24 Sep 2026",
    reads: 36,
    totalReach: 42,
    pinned: true,
  },
  {
    id: "ann-002",
    title: "Midterm Examination Schedule",
    body: "The midterm examination schedule for Fall 2026 has been finalized. Students should check their examination dates and venues.",
    category: "Examination",
    priority: "Urgent",
    audience: "All Students",
    status: "Published",
    createdAt: "22 Sep 2026",
    publishAt: "22 Sep 2026",
    reads: 412,
    totalReach: 520,
    pinned: true,
  },
  {
    id: "ann-003",
    title: "Technology Career Session",
    body: "A career session with industry professionals will be held next week. Students interested in software engineering are encouraged to attend.",
    category: "Events",
    priority: "Normal",
    audience: "Computing Department",
    status: "Scheduled",
    createdAt: "23 Sep 2026",
    publishAt: "26 Sep 2026 · 09:00 AM",
    reads: 0,
    totalReach: 186,
    pinned: false,
  },
  {
    id: "ann-004",
    title: "Assignment Submission Reminder",
    body: "Students who have not submitted their Microservices Architecture Report should submit it before the deadline.",
    category: "Academic",
    priority: "Important",
    audience: "SE-401 Students",
    course: "SE-401",
    status: "Published",
    createdAt: "20 Sep 2026",
    publishAt: "20 Sep 2026",
    reads: 31,
    totalReach: 42,
    pinned: false,
  },
  {
    id: "ann-005",
    title: "Faculty Office Hours Update",
    body: "Office hours have been updated for the Fall 2026 semester. Students can visit during the published hours.",
    category: "Administration",
    priority: "Normal",
    audience: "All Students",
    status: "Draft",
    createdAt: "19 Sep 2026",
    reads: 0,
    totalReach: 520,
    pinned: false,
  },
];

const categories = [
  "All",
  "Academic",
  "Examination",
  "Events",
  "Administration",
  "General",
];

const statuses = ["All", "Published", "Scheduled", "Draft"];

export default function FacultyAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  const [showCreate, setShowCreate] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);

  const [form, setForm] = useState({
    title: "",
    body: "",
    category: "Academic",
    audience: "All Students",
    course: "",
    priority: "Normal",
    publishMode: "now",
    publishAt: "",
    pinned: false,
  });

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((announcement) => {
      const matchesSearch =
        announcement.title.toLowerCase().includes(search.toLowerCase()) ||
        announcement.body.toLowerCase().includes(search.toLowerCase()) ||
        announcement.audience.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || announcement.category === category;

      const matchesStatus = status === "All" || announcement.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [announcements, search, category, status]);

  const totalAnnouncements = announcements.length;
  const published = announcements.filter(
    (item) => item.status === "Published",
  ).length;
  const scheduled = announcements.filter(
    (item) => item.status === "Scheduled",
  ).length;

  const totalReads = announcements.reduce((sum, item) => sum + item.reads, 0);

  const resetForm = () => {
    setForm({
      title: "",
      body: "",
      category: "Academic",
      audience: "All Students",
      course: "",
      priority: "Normal",
      publishMode: "now",
      publishAt: "",
      pinned: false,
    });
  };

  const createAnnouncement = () => {
    if (!form.title.trim() || !form.body.trim()) return;

    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      title: form.title,
      body: form.body,
      category: form.category as Announcement["category"],
      priority: form.priority as Announcement["priority"],
      audience: form.audience,
      course: form.course || undefined,
      status: form.publishMode === "schedule" ? "Scheduled" : "Published",
      createdAt: "24 Sep 2026",
      publishAt:
        form.publishMode === "schedule"
          ? form.publishAt || "Scheduled"
          : "24 Sep 2026",
      reads: 0,
      totalReach:
        form.audience === "All Students"
          ? 520
          : form.audience === "Computing Department"
            ? 186
            : 42,
      pinned: form.pinned,
    };

    setAnnouncements((current) => [newAnnouncement, ...current]);

    resetForm();
    setShowCreate(false);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((current) => current.filter((item) => item.id !== id));

    if (selectedAnnouncement?.id === id) {
      setSelectedAnnouncement(null);
    }
  };

  const togglePin = (id: string) => {
    setAnnouncements((current) =>
      current.map((item) =>
        item.id === id ? { ...item, pinned: !item.pinned } : item,
      ),
    );
  };

  const publishAnnouncement = (id: string) => {
    setAnnouncements((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Published",
              publishAt: "24 Sep 2026",
            }
          : item,
      ),
    );
  };

  const openEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);

    setForm({
      title: announcement.title,
      body: announcement.body,
      category: announcement.category,
      audience: announcement.audience,
      course: announcement.course || "",
      priority: announcement.priority,
      publishMode: announcement.status === "Scheduled" ? "schedule" : "now",
      publishAt: "",
      pinned: announcement.pinned,
    });
  };

  const saveEdit = () => {
    if (!editingAnnouncement) return;

    setAnnouncements((current) =>
      current.map((item) =>
        item.id === editingAnnouncement.id
          ? {
              ...item,
              title: form.title,
              body: form.body,
              category: form.category as Announcement["category"],
              audience: form.audience,
              course: form.course || undefined,
              priority: form.priority as Announcement["priority"],
              pinned: form.pinned,
            }
          : item,
      ),
    );

    setEditingAnnouncement(null);
    resetForm();
  };

  const closeModals = () => {
    setShowCreate(false);
    setEditingAnnouncement(null);
    resetForm();
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
            Create, publish, schedule and manage announcements for your students
            and department.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
        >
          <Plus size={17} />
          Create Announcement
        </button>
      </div>

      {/* Stats */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Total Announcements"
          value={String(totalAnnouncements)}
          description="Across your faculty workspace"
          icon={Megaphone}
        />

        <Stat
          label="Published"
          value={String(published)}
          description="Currently visible to students"
          icon={CheckCircle2}
        />

        <Stat
          label="Scheduled"
          value={String(scheduled)}
          description="Waiting for publication"
          icon={Clock3}
        />

        <Stat
          label="Total Reads"
          value={String(totalReads)}
          description="Student announcement views"
          icon={Eye}
        />
      </div>

      {/* Toolbar */}
      <div className="mt-7 rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
        <div className="flex flex-col gap-3 xl:flex-row">
          <div className="flex h-11 flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3">
            <Search size={17} className="text-gray-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search announcements..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-600 outline-none focus:border-indigo-400"
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-600 outline-none focus:border-indigo-400"
          >
            {statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Announcement List */}
        <div className="space-y-4">
          {filteredAnnouncements.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
              <Megaphone size={30} className="mx-auto text-gray-300" />
              <h3 className="mt-4 font-semibold text-gray-900">
                No announcements found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onView={() => setSelectedAnnouncement(announcement)}
                onEdit={() => openEdit(announcement)}
                onDelete={() => deleteAnnouncement(announcement.id)}
                onPin={() => togglePin(announcement.id)}
                onPublish={() => publishAnnouncement(announcement.id)}
              />
            ))
          )}
        </div>

        {/* Right Panel */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <Users size={18} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Audience Reach
                </h3>
                <p className="text-[11px] text-gray-400">
                  Manage who receives announcements
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <AudienceRow label="All Students" value="520" width="100%" />

              <AudienceRow
                label="Computing Department"
                value="186"
                width="72%"
              />

              <AudienceRow label="Course Students" value="42" width="38%" />
            </div>
          </div>

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
                  <li>• Use urgent priority only when necessary.</li>
                  <li>• Pin announcements students must see.</li>
                  <li>• Schedule reminders before deadlines.</li>
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
                description="Send immediately or schedule."
              />

              <WorkflowStep
                number="03"
                title="Track"
                description="Monitor student reach and reads."
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
                <Badge label={selectedAnnouncement.category} tone="indigo" />

                <Badge
                  label={selectedAnnouncement.priority}
                  tone={
                    selectedAnnouncement.priority === "Urgent"
                      ? "rose"
                      : selectedAnnouncement.priority === "Important"
                        ? "amber"
                        : "gray"
                  }
                />

                <Badge label={selectedAnnouncement.status} tone="emerald" />
              </div>

              <h2 className="mt-4 text-xl font-bold text-gray-950">
                {selectedAnnouncement.title}
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">
                {selectedAnnouncement.body}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Audience" value={selectedAnnouncement.audience} />
              <Info label="Created" value={selectedAnnouncement.createdAt} />
              <Info
                label="Published"
                value={selectedAnnouncement.publishAt || "Not published"}
              />
              <Info
                label="Reach"
                value={`${selectedAnnouncement.reads}/${selectedAnnouncement.totalReach} reads`}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedAnnouncement(null);
                  openEdit(selectedAnnouncement);
                }}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span className="inline-flex items-center gap-2">
                  <Pencil size={15} />
                  Edit
                </span>
              </button>

              {selectedAnnouncement.status !== "Published" && (
                <button
                  onClick={() => {
                    publishAnnouncement(selectedAnnouncement.id);
                    setSelectedAnnouncement(null);
                  }}
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <span className="inline-flex items-center gap-2">
                    <Send size={15} />
                    Publish
                  </span>
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Create/Edit Modal */}
      {(showCreate || editingAnnouncement) && (
        <Modal
          title={
            editingAnnouncement ? "Edit Announcement" : "Create Announcement"
          }
          onClose={closeModals}
        >
          <AnnouncementForm
            form={form}
            setForm={setForm}
            editing={Boolean(editingAnnouncement)}
            onCancel={closeModals}
            onSubmit={editingAnnouncement ? saveEdit : createAnnouncement}
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
  onView,
  onEdit,
  onDelete,
  onPin,
  onPublish,
}: {
  announcement: Announcement;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
  onPublish: () => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] transition hover:border-gray-300">
      <div className="flex gap-4">
        <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 sm:grid">
          <Megaphone size={19} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {announcement.pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-600">
                <Pin size={10} />
                Pinned
              </span>
            )}

            <Badge label={announcement.category} tone="indigo" />

            <Badge
              label={announcement.priority}
              tone={
                announcement.priority === "Urgent"
                  ? "rose"
                  : announcement.priority === "Important"
                    ? "amber"
                    : "gray"
              }
            />

            <Badge
              label={announcement.status}
              tone={
                announcement.status === "Published"
                  ? "emerald"
                  : announcement.status === "Scheduled"
                    ? "violet"
                    : "gray"
              }
            />
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
              {announcement.audience}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={13} />
              {announcement.publishAt || announcement.createdAt}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Eye size={13} />
              {announcement.reads}/{announcement.totalReach} reads
            </span>
          </div>
        </div>

        <div className="hidden items-start gap-1 sm:flex">
          <button
            onClick={onPin}
            title={announcement.pinned ? "Unpin" : "Pin"}
            className={[
              "rounded-lg p-2 transition",
              announcement.pinned
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-400 hover:bg-gray-50 hover:text-gray-700",
            ].join(" ")}
          >
            <Pin size={15} />
          </button>

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

        {announcement.status !== "Published" && (
          <button
            onClick={onPublish}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            <span className="inline-flex items-center gap-1.5">
              <Send size={14} />
              Publish
            </span>
          </button>
        )}

        <button
          onClick={onEdit}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          <span className="inline-flex items-center gap-1.5">
            <Pencil size={14} />
            Edit
          </span>
        </button>
      </div>
    </div>
  );
}

function AnnouncementForm({
  form,
  setForm,
  editing,
  onCancel,
  onSubmit,
}: {
  form: {
    title: string;
    body: string;
    category: string;
    audience: string;
    course: string;
    priority: string;
    publishMode: string;
    publishAt: string;
    pinned: boolean;
  };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  editing: boolean;
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
          rows={5}
          placeholder="Write your announcement..."
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-indigo-400"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <select
            value={form.category}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                category: e.target.value,
              }))
            }
            className="form-select"
          >
            {categories.slice(1).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>

        <Field label="Priority">
          <select
            value={form.priority}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                priority: e.target.value,
              }))
            }
            className="form-select"
          >
            <option>Normal</option>
            <option>Important</option>
            <option>Urgent</option>
          </select>
        </Field>

        <Field label="Audience">
          <select
            value={form.audience}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                audience: e.target.value,
              }))
            }
            className="form-select"
          >
            <option>All Students</option>
            <option>Computing Department</option>
            <option>Course Students</option>
            <option>Selected Users</option>
          </select>
        </Field>

        <Field label="Course">
          <select
            value={form.course}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                course: e.target.value,
              }))
            }
            className="form-select"
          >
            <option value="">No specific course</option>
            <option value="SE-401">SE-401 · Software Architecture</option>
            <option value="AI-402">AI-402 · Artificial Intelligence</option>
            <option value="CS-405">CS-405 · Cyber Security</option>
            <option value="SE-406">SE-406 · Web Engineering</option>
          </select>
        </Field>
      </div>

      {!editing && (
        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-700">
            Publishing
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  publishMode: "now",
                }))
              }
              className={[
                "rounded-xl border p-3 text-left transition",
                form.publishMode === "now"
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:bg-gray-50",
              ].join(" ")}
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Send size={15} />
                Publish Now
              </div>
              <p className="mt-1 text-[11px] text-gray-500">
                Make it available immediately.
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  publishMode: "schedule",
                }))
              }
              className={[
                "rounded-xl border p-3 text-left transition",
                form.publishMode === "schedule"
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:bg-gray-50",
              ].join(" ")}
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Clock3 size={15} />
                Schedule
              </div>
              <p className="mt-1 text-[11px] text-gray-500">
                Publish at a specific date and time.
              </p>
            </button>
          </div>
        </div>
      )}

      {!editing && form.publishMode === "schedule" && (
        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-700">
            Schedule Date & Time
          </label>

          <input
            type="datetime-local"
            value={form.publishAt}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                publishAt: e.target.value,
              }))
            }
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-indigo-400"
          />
        </div>
      )}

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-3">
        <input
          type="checkbox"
          checked={form.pinned}
          onChange={(e) =>
            setForm((current) => ({
              ...current,
              pinned: e.target.checked,
            }))
          }
          className="h-4 w-4 accent-indigo-600"
        />

        <div>
          <div className="text-sm font-semibold text-gray-900">
            Pin announcement
          </div>
          <div className="text-[11px] text-gray-500">
            Keep this announcement highlighted for students.
          </div>
        </div>
      </label>

      <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
        <button
          onClick={onCancel}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          onClick={onSubmit}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          {editing ? "Save Changes" : "Create Announcement"}
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-gray-700">
        {label}
      </label>
      {children}
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

function AudienceRow({
  label,
  value,
  width,
}: {
  label: string;
  value: string;
  width: string;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-[11px]">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold text-gray-800">{value}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-indigo-500" style={{ width }} />
      </div>
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
