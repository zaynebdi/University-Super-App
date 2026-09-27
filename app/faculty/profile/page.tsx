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
  Download,
  Lock,
  Monitor,
  Sparkles,
  Trash2,
} from "lucide-react";

type Skill = {
  id: number;
  name: string;
  level: number;
};

const initialSkills: Skill[] = [
  { id: 1, name: "Software Architecture", level: 94 },
  { id: 2, name: "Web Engineering", level: 91 },
  { id: 3, name: "Software Testing", level: 86 },
  { id: 4, name: "Artificial Intelligence", level: 78 },
  { id: 5, name: "Cyber Security", level: 72 },
  { id: 6, name: "Cloud Computing", level: 68 },
];

const publications = [
  {
    title: "Modern Software Architecture Patterns for Enterprise Systems",
    journal: "International Journal of Software Engineering",
    year: "2025",
  },
  {
    title: "AI-Assisted Development in Modern Web Applications",
    journal: "Computing Research Review",
    year: "2024",
  },
  {
    title: "Secure Software Development Lifecycle: A Practical Framework",
    journal: "Journal of Cyber Security Studies",
    year: "2024",
  },
];

const documents = [
  {
    name: "Faculty Appointment Letter",
    type: "PDF",
    size: "1.8 MB",
    date: "12 Aug 2026",
  },
  {
    name: "Highest Qualification Certificate",
    type: "PDF",
    size: "2.4 MB",
    date: "05 Jul 2026",
  },
  {
    name: "Research Profile",
    type: "PDF",
    size: "890 KB",
    date: "18 Jun 2026",
  },
];

export default function FacultyProfilePage() {
  const [editOpen, setEditOpen] = useState(false);
  const [skillOpen, setSkillOpen] = useState(false);

  const [skills, setSkills] = useState(initialSkills);

  const [profile, setProfile] = useState({
    fullName: "Dr. Ahmed Khan",
    facultyId: "FAC-2021-0047",
    email: "ahmed.khan@university.edu",
    phone: "+92 300 1234567",
    gender: "Male",
    dob: "14 March 1987",
    department: "Department of Software Engineering",
    designation: "Assistant Professor",
    specialization: "Software Architecture & Web Engineering",
    qualification: "PhD in Software Engineering",
    joiningDate: "12 September 2021",
    office: "SE-214, Computing & Technology Block",
    officeHours: "Monday & Wednesday, 02:00 PM – 04:00 PM",
  });

  const [editForm, setEditForm] = useState(profile);

  const [newSkill, setNewSkill] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState("80");

  const openEdit = () => {
    setEditForm(profile);
    setEditOpen(true);
  };

  const saveProfile = () => {
    setProfile(editForm);
    setEditOpen(false);
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
                AK
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
                <span className="font-bold text-indigo-600">94%</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full w-[94%] rounded-full bg-indigo-600" />
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
            value: "4",
            description: "Current semester",
            icon: BookOpen,
          },
          {
            label: "Total Students",
            value: "186",
            description: "Across all courses",
            icon: Users,
          },
          {
            label: "Research Publications",
            value: "18",
            description: "Academic publications",
            icon: Award,
          },
          {
            label: "Teaching Experience",
            value: "8+ Years",
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
                value="4"
              />

              <MetricBox
                icon={<Users size={18} />}
                label="Students"
                value="186"
              />

              <MetricBox
                icon={<Clock3 size={18} />}
                label="Office Hours"
                value="4 hrs/week"
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
          </Card>

          {/* Publications */}
          <Card className="p-6">
            <SectionHeader
              icon={<Award size={18} />}
              title="Publications & Research"
              description="Recent academic publications and research work."
            />

            <div className="mt-5 divide-y divide-gray-100">
              {publications.map((publication) => (
                <div
                  key={publication.title}
                  className="flex gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <FileText size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {publication.title}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {publication.journal}
                    </p>

                    <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-600">
                      {publication.year}
                    </span>
                  </div>
                </div>
              ))}
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
              <SnapshotRow label="Department" value="Software Engineering" />
              <SnapshotRow label="Designation" value="Assistant Professor" />
              <SnapshotRow
                label="Specialization"
                value="Software Architecture"
              />
              <SnapshotRow label="Experience" value="8+ Years" />
              <SnapshotRow label="Research Areas" value="AI · Security · Web" />
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

            <div className="mt-5 space-y-3">
              {documents.map((document) => (
                <div
                  key={document.name}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-500 shadow-sm">
                      <FileText size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-800">
                        {document.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {document.type} · {document.size} · {document.date}
                      </p>
                    </div>

                    <button
                      onClick={() => alert(`Opening ${document.name}`)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-white hover:text-indigo-600"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              ))}
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
                description="Last changed 42 days ago"
                status="Update"
                action
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
              Backend-ready faculty profile
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-600">
              This UI is currently using local state. Later it will connect to
              FastAPI endpoints for profile data, skills, documents, sessions,
              ID cards and 2FA settings.
            </p>
          </div>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      {editOpen && (
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
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    fullName: e.target.value,
                  })
                }
              />
            </FormField>

            <FormField label="Phone Number">
              <input
                className={inputClass}
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    phone: e.target.value,
                  })
                }
              />
            </FormField>

            <FormField label="Email Address">
              <input
                className={inputClass}
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    email: e.target.value,
                  })
                }
              />
            </FormField>

            <FormField label="Designation">
              <input
                className={inputClass}
                value={editForm.designation}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    designation: e.target.value,
                  })
                }
              />
            </FormField>

            <FormField label="Specialization">
              <input
                className={inputClass}
                value={editForm.specialization}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    specialization: e.target.value,
                  })
                }
              />
            </FormField>

            <FormField label="Office">
              <input
                className={inputClass}
                value={editForm.office}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    office: e.target.value,
                  })
                }
              />
            </FormField>

            <FormField label="Highest Qualification">
              <input
                className={inputClass}
                value={editForm.qualification}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    qualification: e.target.value,
                  })
                }
              />
            </FormField>

            <FormField label="Office Hours">
              <input
                className={inputClass}
                value={editForm.officeHours}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    officeHours: e.target.value,
                  })
                }
              />
            </FormField>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setEditOpen(false)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              onClick={saveProfile}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </Modal>
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
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: string;
  positive?: boolean;
  action?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
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
