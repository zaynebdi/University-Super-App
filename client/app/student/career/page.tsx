"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Code2,
  ExternalLink,
  FileText,
  GraduationCap,
  Lightbulb,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";

type Skill = {
  name: string;
  level: number;
  category: string;
};

type Role = {
  title: string;
  company: string;
  location: string;
  type: string;
  match: number;
  skills: string[];
};

const initialSkills: Skill[] = [
  { name: "React / Next.js", level: 88, category: "Development" },
  { name: "Python", level: 82, category: "Development" },
  { name: "TypeScript", level: 76, category: "Development" },
  { name: "Cyber Security", level: 70, category: "Security" },
  { name: "AI / Machine Learning", level: 68, category: "AI & Data" },
  { name: "SQL / Databases", level: 74, category: "Backend" },
  { name: "System Design", level: 65, category: "Architecture" },
  { name: "Git / GitHub", level: 86, category: "Tools" },
];

const roles: Role[] = [
  {
    title: "Full-Stack Software Engineer",
    company: "Technology & Product",
    location: "Remote / Hybrid",
    type: "Internship",
    match: 94,
    skills: ["React", "Next.js", "TypeScript", "SQL"],
  },
  {
    title: "AI / ML Engineering Intern",
    company: "AI & Data",
    location: "Remote",
    type: "Internship",
    match: 86,
    skills: ["Python", "Machine Learning", "SQL"],
  },
  {
    title: "Cyber Security Analyst",
    company: "Security Operations",
    location: "On-site",
    type: "Graduate",
    match: 79,
    skills: ["Security", "Networking", "Python"],
  },
  {
    title: "Backend Engineer",
    company: "Cloud & Platforms",
    location: "Remote / Hybrid",
    type: "Internship",
    match: 82,
    skills: ["Python", "SQL", "APIs", "System Design"],
  },
];

const roadmap = [
  {
    step: "01",
    title: "Strengthen foundations",
    description:
      "Improve data structures, algorithms, system design and backend engineering.",
    status: "Current",
  },
  {
    step: "02",
    title: "Build portfolio projects",
    description:
      "Create 2–3 production-quality projects demonstrating real engineering skills.",
    status: "Next",
  },
  {
    step: "03",
    title: "Industry experience",
    description:
      "Apply for internships, open-source opportunities and practical engineering roles.",
    status: "Upcoming",
  },
  {
    step: "04",
    title: "Graduate career",
    description:
      "Target software engineering, AI, security and cloud engineering positions.",
    status: "Upcoming",
  },
];

export default function CareerPage() {
  const [skills, setSkills] = useState(initialSkills);
  const [search, setSearch] = useState("");
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const query = search.toLowerCase();

      return (
        role.title.toLowerCase().includes(query) ||
        role.company.toLowerCase().includes(query) ||
        role.skills.some((skill) => skill.toLowerCase().includes(query))
      );
    });
  }, [search]);

  const averageSkill = Math.round(
    skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length,
  );

  function addSkill() {
    if (!newSkill.trim()) return;

    setSkills((current) => [
      ...current,
      {
        name: newSkill.trim(),
        level: 35,
        category: "Custom",
      },
    ]);

    setNewSkill("");
    setShowSkillForm(false);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-375 space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-600">
              <Sparkles size={13} />
              AI Career Intelligence
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-950">
              Career Hub
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Understand your skills, discover opportunities, and build your
              career roadmap.
            </p>
          </div>

          <button
            onClick={() => setShowSkillForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
          >
            <Plus size={17} />
            Add Skill
          </button>
        </div>

        {/* Career overview */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Career Readiness
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-950">82%</p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <Target size={18} />
              </div>
            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-indigo-600"
                style={{ width: "82%" }}
              />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Skill Strength
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-950">
                  {averageSkill}%
                </p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp size={18} />
              </div>
            </div>

            <p className="mt-4 text-[11px] text-gray-400">
              Across {skills.length} tracked skills
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Recommended Roles
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-950">12</p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
                <BriefcaseBusiness size={18} />
              </div>
            </div>

            <p className="mt-4 text-[11px] text-gray-400">
              Based on your current profile
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Profile Completion
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-950">76%</p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
                <UserRound size={18} />
              </div>
            </div>

            <p className="mt-4 text-[11px] text-gray-400">
              Add projects and certifications
            </p>
          </Card>
        </div>

        {/* AI career insight */}
        <div className="overflow-hidden rounded-2xl bg-linear-to-r from-gray-950 via-gray-900 to-indigo-950 p-6 text-white shadow-xl">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="flex gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10">
                <Sparkles size={20} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold">AI Career Insight</h2>

                  <span className="rounded-full bg-indigo-400/15 px-2 py-1 text-[9px] font-semibold text-indigo-200">
                    PERSONALIZED
                  </span>
                </div>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-300">
                  Your strongest profile areas are modern web development,
                  Python and Git/GitHub. Strengthening system design, algorithms
                  and practical AI projects could expand the range of roles that
                  match your current skill profile.
                </p>
              </div>
            </div>

            <button className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-gray-900 hover:bg-gray-100">
              View Skill Gap
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          {/* Skills */}
          <Card className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-950">My Skills</h2>

                <p className="mt-1 text-[11px] text-gray-400">
                  Your current self-assessed skill profile.
                </p>
              </div>

              <Code2 size={19} className="text-gray-300" />
            </div>

            <div className="space-y-5">
              {skills.map((skill) => (
                <div key={skill.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-gray-800">
                        {skill.name}
                      </span>

                      <span className="ml-2 text-[9px] text-gray-400">
                        {skill.category}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-gray-700">
                      {skill.level}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Skill gaps */}
          <Card className="p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-600">
                <Lightbulb size={18} />
              </div>

              <div>
                <h2 className="text-base font-bold text-gray-950">
                  Skill Gaps
                </h2>

                <p className="text-[10px] text-gray-400">
                  Areas worth developing
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <SkillGap
                title="Data Structures & Algorithms"
                level="58%"
                priority="High"
              />

              <SkillGap title="System Design" level="65%" priority="High" />

              <SkillGap title="Cloud / DevOps" level="52%" priority="Medium" />

              <SkillGap
                title="Machine Learning"
                level="68%"
                priority="Medium"
              />
            </div>

            <button className="mt-5 flex w-full items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600">
              Generate learning plan
              <ArrowUpRight size={14} />
            </button>
          </Card>
        </div>

        {/* Opportunities */}
        <Card className="overflow-hidden">
          <div className="border-b border-gray-100 p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-base font-bold text-gray-950">
                  Recommended Opportunities
                </h2>

                <p className="mt-1 text-[11px] text-gray-400">
                  Example opportunities matched to your current profile.
                </p>
              </div>

              <div className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3">
                <Search size={16} className="text-gray-400" />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search roles..."
                  className="w-full bg-transparent text-xs outline-none placeholder:text-gray-400 sm:w-55"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5 lg:grid-cols-2">
            {filteredRoles.map((role) => (
              <div
                key={role.title}
                className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 transition hover:border-indigo-100 hover:bg-white hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm">
                      <BriefcaseBusiness size={18} />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-gray-950">
                        {role.title}
                      </h3>

                      <p className="mt-1 text-[11px] text-gray-500">
                        {role.company}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-emerald-50 px-2.5 py-2 text-center">
                    <p className="text-[9px] font-semibold text-emerald-600">
                      MATCH
                    </p>

                    <p className="text-sm font-bold text-emerald-700">
                      {role.match}%
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {role.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-medium text-gray-500"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-3 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {role.location}
                    </span>

                    <span>{role.type}</span>
                  </div>

                  <button className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600">
                    Explore
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            ))}

            {filteredRoles.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <Search size={22} className="mx-auto text-gray-300" />

                <p className="mt-3 text-sm font-semibold text-gray-700">
                  No matching roles
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Try another role or skill.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Career roadmap */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-base font-bold text-gray-950">
              Career Roadmap
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              A structured path from university to industry.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            {roadmap.map((item, index) => (
              <div key={item.step} className="relative">
                {index < roadmap.length - 1 && (
                  <div className="absolute left-10 top-5 hidden h-px w-[calc(100%-30px)] bg-gray-200 md:block" />
                )}

                <div className="relative">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-xl text-xs font-bold ${
                      item.status === "Current"
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {item.step}
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-gray-900">
                        {item.title}
                      </h3>

                      {item.status === "Current" && (
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[8px] font-bold text-indigo-600">
                          NOW
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-[11px] leading-5 text-gray-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Portfolio checklist */}
        <Card className="p-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-base font-bold text-gray-950">
                Career Profile Checklist
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Complete these items to make your UniSphere career profile
                stronger.
              </p>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-gray-950">3 / 5</p>
              <p className="text-[10px] text-gray-400">Completed</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <ChecklistItem title="Academic Profile" complete />

            <ChecklistItem title="Skills" complete />

            <ChecklistItem title="Projects" complete />

            <ChecklistItem title="Certifications" />

            <ChecklistItem title="Resume" />
          </div>
        </Card>

        {/* Add skill modal */}
        {showSkillForm && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <div>
                  <h2 className="text-base font-bold text-gray-950">
                    Add Skill
                  </h2>

                  <p className="mt-1 text-[11px] text-gray-400">
                    Add another skill to your career profile.
                  </p>
                </div>

                <button
                  onClick={() => setShowSkillForm(false)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6">
                <label className="mb-2 block text-xs font-semibold text-gray-700">
                  Skill name
                </label>

                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addSkill();
                  }}
                  placeholder="e.g. Docker"
                  autoFocus
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />

                <div className="mt-5 flex justify-end gap-3">
                  <button
                    onClick={() => setShowSkillForm(false)}
                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={addSkill}
                    disabled={!newSkill.trim()}
                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
                  >
                    Add Skill
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function SkillGap({
  title,
  level,
  priority,
}: {
  title: string;
  level: string;
  priority: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-800">{title}</p>

        <span
          className={`text-[9px] font-bold ${
            priority === "High" ? "text-rose-600" : "text-amber-600"
          }`}
        >
          {priority}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gray-500"
            style={{ width: level }}
          />
        </div>

        <span className="text-[10px] font-bold text-gray-500">{level}</span>
      </div>
    </div>
  );
}

function ChecklistItem({
  title,
  complete = false,
}: {
  title: string;
  complete?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-3 ${
        complete
          ? "border-emerald-100 bg-emerald-50/50"
          : "border-gray-100 bg-gray-50"
      }`}
    >
      {complete ? (
        <CheckCircle2 size={17} className="shrink-0 text-emerald-500" />
      ) : (
        <div className="h-4.25 w-4.25 shrink-0 rounded-full border-2 border-gray-300" />
      )}

      <span
        className={`text-[11px] font-semibold ${
          complete ? "text-emerald-700" : "text-gray-600"
        }`}
      >
        {title}
      </span>
    </div>
  );
}
