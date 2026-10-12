"use client";

import { useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Loader2,
  Mail,
  Pencil,
  Phone,
  UserRound,
  X,
} from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { api, ApiError, type StudentProfileDTO } from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";

const inputClass =
  "h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-indigo-400";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function StudentProfilePage() {
  const { data, loading, error, reload } = useApiResource<StudentProfileDTO>(() =>
    api.students.me()
  );

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ phone: "", photo: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function openEdit() {
    if (!data) return;
    setEditForm({ phone: data.phone ?? "", photo: data.photo ?? "" });
    setSaveError(null);
    setEditOpen(true);
  }

  async function save() {
    if (!data) return;
    setSaving(true);
    setSaveError(null);

    const payload: { phone: string; photo?: string } = {
      phone: editForm.phone.trim(),
    };
    if (editForm.photo.trim()) payload.photo = editForm.photo.trim();

    try {
      await api.users.update(data.userId, payload);
      setEditOpen(false);
      await reload();
    } catch (e) {
      setSaveError(
        e instanceof ApiError ? e.message : "Failed to save profile"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-375">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600">
              Account
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-gray-950">
              My Profile
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              View your student identity and keep your contact details up to
              date.
            </p>
          </div>

          {data && (
            <button
              onClick={openEdit}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
            >
              <Pencil size={16} />
              Edit Profile
            </button>
          )}
        </div>

        {loading && (
          <Card className="flex items-center gap-2 p-6 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" /> Loading profile…
          </Card>
        )}

        {error && (
          <Card className="flex items-center gap-2 border-red-100 p-6 text-sm text-red-600">
            <AlertCircle size={16} /> {error}
          </Card>
        )}

        {data && (
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="bg-linear-to-r from-gray-950 via-gray-900 to-indigo-950 p-6 text-white lg:p-7">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    {data.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={data.photo}
                        alt={data.name}
                        className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-xl"
                      />
                    ) : (
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-lg font-bold shadow-xl">
                        {initials(data.name)}
                      </div>
                    )}

                    <div>
                      <h2 className="text-lg font-bold">{data.name}</h2>
                      <p className="mt-1 text-sm text-white/55">
                        {data.rollNo} · {data.department}
                      </p>

                      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                        <BadgeCheck size={12} />
                        Verified Student
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-3">
                      <p className="text-[10px] uppercase tracking-wider text-white/35">
                        Semester
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {data.semester}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-3">
                      <p className="text-[10px] uppercase tracking-wider text-white/35">
                        Member Since
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {formatDate(data.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailRow icon={<Mail size={17} />} label="Email" value={data.email} />
              <DetailRow
                icon={<Phone size={17} />}
                label="Phone"
                value={data.phone || "Not provided"}
              />
              <DetailRow
                icon={<BookOpen size={17} />}
                label="Department"
                value={data.department}
              />
              <DetailRow
                icon={<UserRound size={17} />}
                label="Roll number"
                value={data.rollNo}
              />
              <DetailRow
                icon={<CalendarDays size={17} />}
                label="Semester"
                value={String(data.semester)}
              />
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                  <BadgeCheck size={17} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Profile visibility
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-600">
                    Your academic record is visible only to authorized university
                    users according to your account permissions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {editOpen && data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
                <p className="mt-1 text-xs text-gray-400">
                  Update your contact details.
                </p>
              </div>

              <button
                onClick={() => setEditOpen(false)}
                className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <form
              className="space-y-4 p-6"
              onSubmit={(e) => {
                e.preventDefault();
                void save();
              }}
            >
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Full name
                </span>
                <input className={inputClass} value={data.name} readOnly />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Phone number
                </span>
                <input
                  className={inputClass}
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  placeholder="+92 300 0000000"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Profile photo URL
                </span>
                <input
                  className={inputClass}
                  value={editForm.photo}
                  onChange={(e) =>
                    setEditForm({ ...editForm, photo: e.target.value })
                  }
                  placeholder="https://…"
                />
              </label>

              {saveError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  <AlertCircle size={15} /> {saveError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="flex items-center gap-3 p-5">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="truncate text-sm font-semibold text-gray-800">{value}</p>
      </div>
    </Card>
  );
}
