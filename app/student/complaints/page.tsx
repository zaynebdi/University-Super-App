"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileText,
  Filter,
  HelpCircle,
  MessageSquare,
  Paperclip,
  Plus,
  Search,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";

type Complaint = {
  id: string;
  subject: string;
  category: string;
  description: string;
  date: string;
  status: "Open" | "In Progress" | "Resolved";
  priority: "Low" | "Medium" | "High";
  lastUpdate: string;
};

const initialComplaints: Complaint[] = [
  {
    id: "UNI-2026-1048",
    subject: "Unable to access AI-402 course resources",
    category: "Academic",
    description:
      "The lecture resources for AI-402 are not appearing in the student portal.",
    date: "22 Sep 2026",
    status: "In Progress",
    priority: "Medium",
    lastUpdate: "Updated 1 hour ago",
  },
  {
    id: "UNI-2026-1031",
    subject: "Fee voucher payment status not updated",
    category: "Finance",
    description:
      "My recent semester fee payment was completed but the portal still shows an outstanding balance.",
    date: "19 Sep 2026",
    status: "Open",
    priority: "High",
    lastUpdate: "Submitted 3 days ago",
  },
  {
    id: "UNI-2026-0987",
    subject: "Classroom projector issue",
    category: "Facilities",
    description:
      "The projector in Lab 3 is displaying a very low-quality image during lectures.",
    date: "10 Sep 2026",
    status: "Resolved",
    priority: "Low",
    lastUpdate: "Resolved 6 days ago",
  },
  {
    id: "UNI-2026-0962",
    subject: "Student portal password reset",
    category: "IT Support",
    description:
      "Requested assistance with resetting my university portal password.",
    date: "06 Sep 2026",
    status: "Resolved",
    priority: "Medium",
    lastUpdate: "Resolved 10 days ago",
  },
];

const categories = [
  "Academic",
  "Finance",
  "IT Support",
  "Hostel / Facilities",
  "Transport",
  "Other",
];

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState(initialComplaints);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Academic");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState("");

  const stats = useMemo(() => {
    return {
      open: complaints.filter((item) => item.status === "Open").length,
      progress: complaints.filter((item) => item.status === "In Progress")
        .length,
      resolved: complaints.filter((item) => item.status === "Resolved").length,
    };
  }, [complaints]);

  const filteredComplaints = complaints.filter((item) => {
    const matchesSearch =
      item.subject.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  function submitComplaint() {
    if (!subject.trim() || !description.trim()) return;

    const newComplaint: Complaint = {
      id: `UNI-2026-${Math.floor(1100 + Math.random() * 800)}`,
      subject,
      category,
      description,
      date: "24 Sep 2026",
      status: "Open",
      priority: priority as Complaint["priority"],
      lastUpdate: "Submitted just now",
    };

    setComplaints((current) => [newComplaint, ...current]);

    setSubject("");
    setDescription("");
    setAttachment("");
    setPriority("Medium");
    setCategory("Academic");
    setShowForm(false);
  }

  function statusStyles(status: Complaint["status"]) {
    if (status === "Resolved") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (status === "In Progress") {
      return "bg-indigo-50 text-indigo-700";
    }

    return "bg-amber-50 text-amber-700";
  }

  function priorityStyles(priority: Complaint["priority"]) {
    if (priority === "High") {
      return "text-rose-600";
    }

    if (priority === "Medium") {
      return "text-amber-600";
    }

    return "text-emerald-600";
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-375 space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-indigo-600">
              <ShieldCheck size={14} />
              Student Support Center
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-950">
              Help & Support
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Submit requests, track complaints, and communicate with university
              departments.
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
          >
            <Plus size={17} />
            New Request
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Open Requests
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-950">
                  {stats.open}
                </p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
                <AlertCircle size={18} />
              </div>
            </div>

            <p className="mt-3 text-[11px] text-gray-400">
              Waiting for department response
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">In Progress</p>
                <p className="mt-2 text-2xl font-bold text-gray-950">
                  {stats.progress}
                </p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <Clock3 size={18} />
              </div>
            </div>

            <p className="mt-3 text-[11px] text-gray-400">
              Currently being handled
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Resolved</p>
                <p className="mt-2 text-2xl font-bold text-gray-950">
                  {stats.resolved}
                </p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={18} />
              </div>
            </div>

            <p className="mt-3 text-[11px] text-gray-400">
              Successfully completed
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Avg. Response
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-950">4.2h</p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
                <MessageSquare size={18} />
              </div>
            </div>

            <p className="mt-3 text-[11px] text-gray-400">
              Average first response time
            </p>
          </Card>
        </div>

        {/* Support banner */}
        <div className="overflow-hidden rounded-2xl bg-linear-to-r from-indigo-600 via-indigo-600 to-violet-600 p-6 text-white shadow-xl shadow-indigo-100">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="flex gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/15">
                <HelpCircle size={22} />
              </div>

              <div>
                <h2 className="text-lg font-bold">Need help with something?</h2>

                <p className="mt-1 max-w-2xl text-sm text-indigo-100">
                  Create a support request and your university department will
                  review it. You can track every update directly from UniSphere.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
            >
              Create Request
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        {/* Requests */}
        <Card className="overflow-hidden">
          <div className="border-b border-gray-100 p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-base font-bold text-gray-950">
                  My Support Requests
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Track the status of your submitted requests.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3">
                  <Search size={16} className="text-gray-400" />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search requests..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400 sm:w-55"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter size={15} className="text-gray-400" />

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 outline-none"
                  >
                    <option>All</option>
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 outline-none"
                  >
                    <option>All</option>
                    {categories.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className="p-5 transition hover:bg-gray-50/70"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                      <FileText size={18} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-bold text-gray-950">
                          {complaint.subject}
                        </h3>

                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusStyles(
                            complaint.status,
                          )}`}
                        >
                          {complaint.status}
                        </span>
                      </div>

                      <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                        {complaint.description}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-gray-400">
                        <span>{complaint.id}</span>
                        <span>{complaint.category}</span>
                        <span>Submitted {complaint.date}</span>
                        <span className={priorityStyles(complaint.priority)}>
                          {complaint.priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 lg:pl-5">
                    <span className="text-[11px] text-gray-400">
                      {complaint.lastUpdate}
                    </span>

                    <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600">
                      View
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredComplaints.length === 0 && (
              <div className="px-5 py-16 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gray-100 text-gray-400">
                  <Search size={20} />
                </div>

                <h3 className="mt-4 text-sm font-bold text-gray-900">
                  No requests found
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                  Try changing your search or filters.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* How it works */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-base font-bold text-gray-950">
              How support works
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              A simple process from request to resolution.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
                01
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Submit request
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Explain your issue and select the relevant university
                  department.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-sm font-bold text-violet-600">
                02
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Department reviews
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Your request is assigned and the responsible team can respond.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-600">
                03
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Track resolution
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Receive updates and track the request until it is resolved.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* New Request Modal */}
      {showForm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-gray-950">
                  Create Support Request
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Provide details so the right department can help you.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-700">
                  Subject
                </label>

                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Unable to access course resources"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-700">
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                  >
                    {categories.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-700">
                    Priority
                  </label>

                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-700">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Describe your issue in detail..."
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-700">
                  Attachment
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4 transition hover:border-indigo-300 hover:bg-indigo-50/40">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-white text-gray-500 shadow-sm">
                    <Paperclip size={17} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-700">
                      {attachment || "Attach supporting file"}
                    </p>

                    <p className="mt-0.5 text-[10px] text-gray-400">
                      PDF, PNG, JPG or DOCX
                    </p>
                  </div>

                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      setAttachment(e.target.files?.[0]?.name || "")
                    }
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  onClick={submitComplaint}
                  disabled={!subject.trim() || !description.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send size={16} />
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
