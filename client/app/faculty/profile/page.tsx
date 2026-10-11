"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import {
  User,
  Mail,
  Phone,
  BriefcaseBusiness,
  GraduationCap,
  Building2,
  CalendarDays,
  MapPin,
  Clock3,
  Users,
  BookOpen,
  Award,
  FileText,
  ShieldCheck,
  Pencil,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Download,
  Loader2,
  Lock,
  Monitor,
  Sparkles,
  Trash2,
} from "lucide-react";

import { api, ApiError, type TeacherProfileDTO } from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";
import ChangePasswordModal from "@/components/ChangePasswordModal";

type Skill = {
  id: number;
  name: string;
  level: number;
};

type Profile = {
  fullName: string;
  facultyId: string;
  email: string;
  phone: string;
  photo: string;
  gender: string;
  dob: string;
  department: string;
  designation: string;
  specialization: string;
  qualification: string;
  joiningDate: string;
  office: string;
  officeHours: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function FacultyProfilePage() {
  const { data, loading, error, reload } = useApiResource<TeacherProfileDTO>(() =>
    api.teachers.me(),
  );

  const [editOpen, setEditOpen] = useState(false);
  const [skillOpen, setSkillOpen] = useState(false);
  const [changeOpen, setChangeOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [skills, setSkills] = useState<Skill[]>([]);

  const [editForm, setEditForm] = useState<Profile | null>(null);

  const [newSkill, setNewSkill] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState("80");

  const profile: Profile = {
    fullName: data?.name ?? "—",
    facultyId: data?.id ?? "—",
    email: data?.email ?? "—",
    phone: data?.phone ?? "—",
    photo: data?.photo ?? "",
    gender: "—",
    dob: "—",
    department: data?.department ?? "—",
    designation: data?.designation ?? "—",
    specialization: "—",
    qualification: "—",
    joiningDate: data?.createdAt
      ? new Date(data.createdAt).toLocaleDateString()
      : "—",
    office: "—",
    officeHours: "—",
  };

  const openEdit = () => {
    setEditForm({
      ...profile,
      phone: data?.phone ?? "",
      photo: data?.photo ?? "",
    });
    setSaveError(null);
    setEditOpen(true);
  };

  const saveProfile = async () => {
    if (!editForm || !data) return;

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
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;

    setSkills((current) => [
      ...current,
      {
        id: Date.now(),
        name: newSkill.trim(),
        level: Number(newSkillLevel),
      },
    ]);

    setNewSkill("");
    setNewSkillLevel("80");
    setSkillOpen(false);
  };

  const removeSkill = (id: number) => {
    setSkills((current) => current.filter((skill) => skill.id !== id));
  };

  const inputClass =
    "h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-indigo-400";

  if (loading) {
    return (
      <main className="space-y-6">
        <Card className="flex items-center gap-2 p-8 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin" /> Loading profile…
        </Card>
      </main>
    );
  }

  if (error) {
    return (
      <main className="space-y-6">
        <Card className="flex items-center gap-2 p-6 text-sm text-red-600">
          <AlertCircle size={16} /> {error}
        </Card>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <User size={14} />
            Faculty Profile Management
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your professional identity, teaching information and account
            details.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() =>
              alert(
                "Faculty ID card download will be connected to the backend.",
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <Download size={17} />
            Faculty ID Card
          </button>

          <button
            onClick={openEdit}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Pencil size={17} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Profile Hero */}
      <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="h-32 bg-linear-to-r from-gray-950 via-indigo-950 to-violet-900" />

        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-4 border-white bg-indigo-100 text-2xl font-bold text-indigo-700 shadow-lg">
                {initials(profile.fullName)}
              </div>

              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile.fullName}
                  </h2>

                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 size={13} />
                    Active
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  {profile.designation} · {profile.department}
                </p>

                <p className="mt-2 text-xs font-medium text-gray-400">
                  Faculty ID: {profile.facultyId}
                </p>
              </div>
            </div>

            <div className="w-full max-w-sm">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-700">
                  Profile Completion
                </span>
                <span className="font-bold text-indigo-600">—</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full w-0 rounded-full bg-indigo-600" />
              </div>

              <p className="mt-2 text-xs text-gray-400">
                Your faculty profile is almost complete.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Assigned Courses",
            value: "—",
            description: "Current semester",
            icon: BookOpen,
          },
          {
            label: "Total Students",
            value: "—",
            description: "Across all courses",
            icon: Users,
          },
          {
            label: "Research Publications",
            value: "—",
            description: "Academic publications",
            icon: Award,
          },
          {
            label: "Teaching Experience",
            value: "—",
            description: "Academic experience",
            icon: GraduationCap,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {item.description}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon size={19} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        {/* Left */}
        <div className="space-y-6">
          {/* Personal Information */}
          <Card className="p-6">
            <SectionHeader
              icon={<User size={18} />}
              title="Personal Information"
              description="Your basic identity and contact information."
              action={
                <button
                  onClick={openEdit}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                >
                  <Pencil size={14} />
                  Edit
                </button>
              }
            />

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <InfoItem
                icon={<User size={17} />}
                label="Full Name"
                value={profile.fullName}
              />

              <InfoItem
                icon={<BriefcaseBusiness size={17} />}
                label="Faculty ID"
                value={profile.facultyId}
              />

              <InfoItem
                icon={<Mail size={17} />}
                label="Email Address"
                value={profile.email}
              />

              <InfoItem
                icon={<Phone size={17} />}
                label="Phone Number"
                value={profile.phone}
              />

              <InfoItem
                icon={<User size={17} />}
                label="Gender"
                value={profile.gender}
              />

              <InfoItem
                icon={<CalendarDays size={17} />}
                label="Date of Birth"
                value={profile.dob}
              />
            </div>
          </Card>

          {/* Academic Information */}
          <Card className="p-6">
            <SectionHeader
              icon={<GraduationCap size={18} />}
              title="Academic & Professional Information"
              description="Your university role, qualification and specialization."
            />

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <InfoItem
                icon={<Building2 size={17} />}
                label="Department"
                value={profile.department}
              />

              <InfoItem
                icon={<BriefcaseBusiness size={17} />}
                label="Designation"
                value={profile.designation}
              />

              <InfoItem
                icon={<Sparkles size={17} />}
                label="Specialization"
                value={profile.specialization}
              />

              <InfoItem
                icon={<GraduationCap size={17} />}
                label="Highest Qualification"
                value={profile.qualification}
              />

              <InfoItem
                icon={<CalendarDays size={17} />}
                label="Joining Date"
                value={profile.joiningDate}
              />

              <InfoItem
                icon={<MapPin size={17} />}
                label="Office"
                value={profile.office}
              />
            </div>
          </Card>

          {/* Teaching Profile */}
          <Card className="p-6">
            <SectionHeader
              icon={<BookOpen size={18} />}
              title="Teaching Profile"
              description="Teaching workload and student-facing information."
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <MetricBox
                icon={<BookOpen size={18} />}
                label="Courses Assigned"
                value="—"
              />

              <MetricBox
                icon={<Users size={18} />}
                label="Students"
                value="—"
              />

              <MetricBox
                icon={<Clock3 size={18} />}
                label="Office Hours"
                value="—"
              />
            </div>

            <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                  <Clock3 size={17} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Office Hours
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {profile.officeHours}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Skills */}
          <Card className="p-6">
            <SectionHeader
              icon={<Sparkles size={18} />}
              title="Skills & Expertise"
              description="Your academic and technical areas of expertise."
              action={
                <button
                  onClick={() => setSkillOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  <Plus size={14} />
                  Add Skill
                </button>
              }
            />

            {skills.length === 0 ? (
              <div className="mt-6 text-sm text-gray-400">
                No skills added yet.
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                {skills.map((skill) => (
                <div key={skill.id}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">
                        {skill.name}
                      </span>

                      <button
                        onClick={() => removeSkill(skill.id)}
                        className="text-gray-300 transition hover:text-red-500"
                        title="Remove skill"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <span className="text-xs font-semibold text-gray-500">
                      {skill.level}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
                ))}
              </div>
            )}
          </Card>

          {/* Publications */}
          <Card className="p-6">
            <SectionHeader
              icon={<Award size={18} />}
              title="Publications & Research"
              description="Recent academic publications and research work."
            />

            <div className="mt-5 text-sm text-gray-400">
              No publications available.
            </div>
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* Professional Snapshot */}
          <Card className="overflow-hidden">
            <div className="bg-linear-to-br from-indigo-600 to-violet-700 p-6 text-white">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                <BriefcaseBusiness size={21} />
              </div>

              <h3 className="text-lg font-bold">Professional Snapshot</h3>

              <p className="mt-1 text-sm leading-6 text-indigo-100">
                Faculty profile visible to students and authorized university
                staff.
              </p>
            </div>

            <div className="space-y-4 p-6">
              <SnapshotRow label="Department" value={profile.department} />
              <SnapshotRow label="Designation" value={profile.designation} />
              <SnapshotRow label="Specialization" value="—" />
              <SnapshotRow label="Experience" value="—" />
              <SnapshotRow label="Research Areas" value="—" />
            </div>
          </Card>

          {/* Documents */}
          <Card className="p-6">
            <SectionHeader
              icon={<FileText size={18} />}
              title="Documents"
              description="Important faculty documents."
              action={
                <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50">
                  <Plus size={14} />
                  Upload
                </button>
              }
            />

            <div className="mt-5 text-sm text-gray-400">
              No documents available.
            </div>
          </Card>

          {/* Security */}
          <Card className="p-6">
            <SectionHeader
              icon={<ShieldCheck size={18} />}
              title="Security"
              description="Protect your faculty account."
            />

            <div className="mt-5 space-y-3">
              <SecurityRow
                icon={<ShieldCheck size={17} />}
                title="Two-Factor Authentication"
                description="Extra security layer"
                status="Enabled"
                positive
              />

              <SecurityRow
                icon={<Monitor size={17} />}
                title="Active Sessions"
                description="2 devices currently active"
                status="2 Active"
              />

              <SecurityRow
                icon={<Lock size={17} />}
                title="Password"
                description="Keep your account secure"
                status="Update"
                action
                onClick={() => setChangeOpen(true)}
              />
            </div>
          </Card>

          {/* Account Notice */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                <ShieldCheck size={17} />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Profile visibility
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-600">
                  Your academic and professional information is visible only to
                  authorized university users according to your account
                  permissions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backend Ready */}
      <Card className="border-indigo-100 bg-indigo-50/50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
            <Sparkles size={18} />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">
              Live faculty profile
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-600">
              Your identity, department and designation are loaded from your
              faculty profile. Skills, documents, sessions, ID cards and 2FA
              settings are not yet available.
            </p>
          </div>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      {editOpen && editForm && (
        <Modal
          title="Edit Faculty Profile"
          description="Update your personal and professional information."
          onClose={() => setEditOpen(false)}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Full Name">
              <input
                className={inputClass}
                value={editForm.fullName}
                readOnly
              />
            </FormField>

            <FormField label="Phone Number">
              <input
                className={inputClass}
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                placeholder="+92 300 0000000"
              />
            </FormField>

            <FormField label="Profile Photo URL">
              <input
                className={inputClass}
                value={editForm.photo}
                onChange={(e) =>
                  setEditForm({ ...editForm, photo: e.target.value })
                }
                placeholder="https://…"
              />
            </FormField>

            <FormField label="Email Address">
              <input className={inputClass} value={editForm.email} readOnly />
            </FormField>

            <FormField label="Designation">
              <input
                className={inputClass}
                value={editForm.designation}
                readOnly
              />
            </FormField>

            <FormField label="Specialization">
              <input
                className={inputClass}
                value={editForm.specialization}
                readOnly
              />
            </FormField>

            <FormField label="Office">
              <input className={inputClass} value={editForm.office} readOnly />
            </FormField>

            <FormField label="Highest Qualification">
              <input
                className={inputClass}
                value={editForm.qualification}
                readOnly
              />
            </FormField>

            <FormField label="Office Hours">
              <input
                className={inputClass}
                value={editForm.officeHours}
                readOnly
              />
            </FormField>
          </div>

          {saveError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle size={15} /> {saveError}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void saveProfile()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </Modal>
      )}

      {changeOpen && (
        <ChangePasswordModal onClose={() => setChangeOpen(false)} />
      )}

      {/* Add Skill Modal */}
      {skillOpen && (
        <Modal
          title="Add Skill"
          description="Add a technical, academic or professional expertise."
          onClose={() => setSkillOpen(false)}
        >
          <div className="space-y-4">
            <FormField label="Skill Name">
              <input
                className={inputClass}
                placeholder="e.g. Machine Learning"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
              />
            </FormField>

            <FormField label="Proficiency">
              <select
                className={inputClass}
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value)}
              >
                <option value="60">60%</option>
                <option value="70">70%</option>
                <option value="80">80%</option>
                <option value="90">90%</option>
                <option value="95">95%</option>
                <option value="100">100%</option>
              </select>
            </FormField>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setSkillOpen(false)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              onClick={addSkill}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Add Skill
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

/* ---------------- Components ---------------- */

function SectionHeader({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>

        <div>
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <p className="mt-1 text-xs text-gray-400">{description}</p>
        </div>
      </div>

      {action}
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-gray-400">{icon}</div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-400">{label}</p>
        <p className="mt-1 wrap-break-word text-sm font-semibold text-gray-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function MetricBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
        {icon}
      </div>

      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-right text-xs font-semibold text-gray-700">
        {value}
      </span>
    </div>
  );
}

function SecurityRow({
  icon,
  title,
  description,
  status,
  positive,
  action,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: string;
  positive?: boolean;
  action?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm">
        {icon}
      </div>

      <div className="min-w-0 flex-1 text-left">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="mt-1 text-xs text-gray-400">{description}</p>
      </div>

      <span
        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
          positive
            ? "bg-emerald-50 text-emerald-700"
            : action
              ? "bg-indigo-50 text-indigo-700"
              : "bg-gray-100 text-gray-600"
        }`}
      >
        {status}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:bg-gray-100"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
      {content}
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-600">
        {label}
      </label>
      {children}
    </div>
  );
}

function Modal({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/45 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-100 bg-white px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="mt-1 text-xs text-gray-400">{description}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
