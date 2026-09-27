"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  FileText,
  Users,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  MoreHorizontal,
  Eye,
  Edit3,
  Trash2,
  Download,
  ChevronDown,
  CalendarDays,
  BookOpen,
  BarChart3,
} from "lucide-react";

import Card from "@/components/ui/Card";

type AssignmentStatus = "Active" | "Draft" | "Closed";

type Assignment = {
  id: string;
  title: string;
  courseCode: string;
  courseName: string;
  type: "Assignment" | "Project" | "Report" | "Quiz";
  dueDate: string;
  dueTime: string;
  submissions: number;
  totalStudents: number;
  graded: number;
  marks: number;
  status: AssignmentStatus;
  priority: "High" | "Medium" | "Low";
};

const initialAssignments: Assignment[] = [
  {
    id: "fa-001",
    title: "Microservices Architecture Report",
    courseCode: "SE-401",
    courseName: "Software Architecture",
    type: "Report",
    dueDate: "26 Sep 2026",
    dueTime: "11:59 PM",
    submissions: 30,
    totalStudents: 42,
    graded: 24,
    marks: 20,
    status: "Active",
    priority: "High",
  },
  {
    id: "fa-002",
    title: "Architecture Pattern Analysis",
    courseCode: "SE-401",
    courseName: "Software Architecture",
    type: "Assignment",
    dueDate: "02 Oct 2026",
    dueTime: "11:59 PM",
    submissions: 18,
    totalStudents: 42,
    graded: 12,
    marks: 15,
    status: "Active",
    priority: "Medium",
  },
  {
    id: "fa-003",
    title: "Intelligent Search using A*",
    courseCode: "AI-402",
    courseName: "Artificial Intelligence",
    type: "Project",
    dueDate: "28 Sep 2026",
    dueTime: "11:59 PM",
    submissions: 26,
    totalStudents: 48,
    graded: 19,
    marks: 25,
    status: "Active",
    priority: "High",
  },
  {
    id: "fa-004",
    title: "Network Security Assessment",
    courseCode: "CS-405",
    courseName: "Cyber Security",
    type: "Report",
    dueDate: "30 Sep 2026",
    dueTime: "11:59 PM",
    submissions: 35,
    totalStudents: 44,
    graded: 31,
    marks: 20,
    status: "Active",
    priority: "Medium",
  },
  {
    id: "fa-005",
    title: "Next.js Full Stack Application",
    courseCode: "SE-406",
    courseName: "Web Engineering",
    type: "Project",
    dueDate: "02 Oct 2026",
    dueTime: "11:59 PM",
    submissions: 22,
    totalStudents: 48,
    graded: 14,
    marks: 25,
    status: "Active",
    priority: "High",
  },
  {
    id: "fa-006",
    title: "Software Testing Fundamentals",
    courseCode: "SE-407",
    courseName: "Software Testing",
    type: "Quiz",
    dueDate: "20 Sep 2026",
    dueTime: "10:00 PM",
    submissions: 44,
    totalStudents: 44,
    graded: 44,
    marks: 15,
    status: "Closed",
    priority: "Low",
  },
  {
    id: "fa-007",
    title: "Distributed System Design",
    courseCode: "SE-408",
    courseName: "Distributed Systems",
    type: "Project",
    dueDate: "10 Oct 2026",
    dueTime: "11:59 PM",
    submissions: 0,
    totalStudents: 52,
    graded: 0,
    marks: 30,
    status: "Draft",
    priority: "Medium",
  },
];

const statusStyles: Record<AssignmentStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Draft: "bg-gray-100 text-gray-600 border-gray-200",
  Closed: "bg-violet-50 text-violet-700 border-violet-100",
};

const priorityStyles = {
  High: "bg-rose-50 text-rose-700",
  Medium: "bg-amber-50 text-amber-700",
  Low: "bg-gray-100 text-gray-500",
};

export default function FacultyAssignmentsPage() {
  const [assignments, setAssignments] =
    useState<Assignment[]>(initialAssignments);

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const matchesSearch =
        assignment.title.toLowerCase().includes(search.toLowerCase()) ||
        assignment.courseCode.toLowerCase().includes(search.toLowerCase()) ||
        assignment.courseName.toLowerCase().includes(search.toLowerCase());

      const matchesCourse =
        courseFilter === "All Courses" ||
        assignment.courseCode === courseFilter;

      const matchesStatus =
        statusFilter === "All Status" || assignment.status === statusFilter;

      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [assignments, search, courseFilter, statusFilter]);

  const activeCount = assignments.filter(
    (assignment) => assignment.status === "Active",
  ).length;

  const totalSubmissions = assignments.reduce(
    (sum, assignment) => sum + assignment.submissions,
    0,
  );

  const totalPendingGrading = assignments.reduce(
    (sum, assignment) =>
      sum + Math.max(assignment.submissions - assignment.graded, 0),
    0,
  );

  const averageSubmissionRate = Math.round(
    (assignments.reduce(
      (sum, assignment) =>
        sum + assignment.submissions / assignment.totalStudents,
      0,
    ) /
      assignments.length) *
      100,
  );

  const deleteAssignment = (id: string) => {
    setAssignments((current) =>
      current.filter((assignment) => assignment.id !== id),
    );
  };

  return (
    <div className="mx-auto max-w-375e-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-700">
            <FileText size={13} />
            Faculty Assignment Management
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-950">
            Assignments
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Create assignments, monitor submissions, manage deadlines, and
            review grading progress across your courses.
          </p>
        </div>

        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            <Download size={16} />
            Export
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
          >
            <Plus size={17} />
            Create Assignment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AssignmentStat
          label="Active Assignments"
          value={activeCount.toString()}
          description="Currently accepting work"
          icon={<FileText size={18} />}
          iconClass="bg-indigo-50 text-indigo-600"
        />

        <AssignmentStat
          label="Total Submissions"
          value={totalSubmissions.toString()}
          description="Across all assignments"
          icon={<Users size={18} />}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <AssignmentStat
          label="Pending Grading"
          value={totalPendingGrading.toString()}
          description="Submissions awaiting review"
          icon={<Clock3 size={18} />}
          iconClass="bg-amber-50 text-amber-600"
        />

        <AssignmentStat
          label="Submission Rate"
          value={`${averageSubmissionRate}%`}
          description="Average across assignments"
          icon={<BarChart3 size={18} />}
          iconClass="bg-violet-50 text-violet-600"
        />
      </div>

      {/* Filters */}
      <Card className="p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <div className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3">
              <Search size={17} className="shrink-0 text-gray-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assignments or courses..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>

            <SelectFilter
              value={courseFilter}
              onChange={setCourseFilter}
              options={[
                "All Courses",
                "SE-401",
                "AI-402",
                "CS-405",
                "SE-406",
                "SE-407",
                "SE-408",
              ]}
            />

            <SelectFilter
              value={statusFilter}
              onChange={setStatusFilter}
              options={["All Status", "Active", "Draft", "Closed"]}
            />
          </div>
        </div>
      </Card>

      {/* Assignment list */}
      <Card className="overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-950">
                Assignment Workspace
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                {filteredAssignments.length} assignments shown
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredAssignments.map((assignment) => {
            const submissionRate = Math.round(
              (assignment.submissions / assignment.totalStudents) * 100,
            );

            const gradingRate =
              assignment.submissions === 0
                ? 0
                : Math.round(
                    (assignment.graded / assignment.submissions) * 100,
                  );

            return (
              <div
                key={assignment.id}
                className="p-5 transition hover:bg-gray-50/60"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  {/* Assignment identity */}
                  <div className="flex min-w-0 gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <FileText size={20} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-950">
                          {assignment.title}
                        </h3>

                        <span
                          className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${statusStyles[assignment.status]}`}
                        >
                          {assignment.status}
                        </span>
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-400">
                        <span className="font-semibold text-indigo-600">
                          {assignment.courseCode}
                        </span>

                        <span>{assignment.courseName}</span>

                        <span>•</span>

                        <span>{assignment.type}</span>

                        <span>•</span>

                        <span>{assignment.marks} marks</span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-[9px] font-semibold ${priorityStyles[assignment.priority]}`}
                        >
                          {assignment.priority} Priority
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-[9px] text-gray-500">
                          <CalendarDays size={10} />
                          Due {assignment.dueDate}
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-[9px] text-gray-500">
                          <Clock3 size={10} />
                          {assignment.dueTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="grid gap-4 sm:grid-cols-3 xl:w-105">
                    <ProgressMetric
                      label="Submissions"
                      value={`${assignment.submissions}/${assignment.totalStudents}`}
                      percentage={submissionRate}
                      description={`${submissionRate}% submitted`}
                    />

                    <ProgressMetric
                      label="Grading"
                      value={`${assignment.graded}/${assignment.submissions}`}
                      percentage={gradingRate}
                      description={`${gradingRate}% graded`}
                    />

                    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 sm:block">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400">
                          Marks
                        </p>

                        <p className="mt-1 text-lg font-bold text-gray-900">
                          {assignment.marks}
                        </p>
                      </div>

                      <p className="text-[10px] text-gray-400 sm:mt-1">
                        total marks
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/faculty/assignments/${assignment.id}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      <Eye size={15} />
                      Open
                    </Link>

                    <button
                      title="Edit assignment"
                      className="rounded-xl p-2.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      title="Delete assignment"
                      onClick={() => deleteAssignment(assignment.id)}
                      className="rounded-xl p-2.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>

                    <button
                      title="More actions"
                      className="rounded-xl p-2.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                      <MoreHorizontal size={17} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAssignments.length === 0 && (
          <div className="px-6 py-16 text-center">
            <Search className="mx-auto text-gray-300" size={22} />

            <p className="mt-3 text-sm font-semibold text-gray-800">
              No assignments found
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Try changing your search or filters.
            </p>
          </div>
        )}
      </Card>

      {/* Submission / grading overview */}
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <BarChart3 size={17} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-gray-950">
                Assignment Performance
              </h2>

              <p className="text-[11px] text-gray-400">
                Submission and grading activity
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {assignments
              .filter((assignment) => assignment.status === "Active")
              .slice(0, 4)
              .map((assignment) => {
                const rate = Math.round(
                  (assignment.submissions / assignment.totalStudents) * 100,
                );

                return (
                  <div key={assignment.id}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-gray-800">
                          {assignment.title}
                        </p>

                        <p className="mt-0.5 text-[10px] text-gray-400">
                          {assignment.courseCode}
                        </p>
                      </div>

                      <span className="shrink-0 text-xs font-bold text-gray-700">
                        {rate}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle size={17} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-gray-950">Grading Queue</h2>

              <p className="text-[11px] text-gray-400">
                Submissions requiring review
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {assignments
              .filter(
                (assignment) =>
                  assignment.submissions > assignment.graded &&
                  assignment.status !== "Draft",
              )
              .slice(0, 4)
              .map((assignment) => {
                const pending = assignment.submissions - assignment.graded;

                return (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-gray-500 shadow-sm">
                        <BookOpen size={14} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-gray-800">
                          {assignment.title}
                        </p>

                        <p className="mt-0.5 text-[10px] text-gray-400">
                          {assignment.courseCode}
                        </p>
                      </div>
                    </div>

                    <span className="ml-3 shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                      {pending} pending
                    </span>
                  </div>
                );
              })}
          </div>
        </Card>
      </div>

      {/* Backend note */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
        <div className="flex gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm">
            <CheckCircle2 size={17} />
          </div>

          <div>
            <p className="text-xs font-semibold text-indigo-900">
              Backend-ready assignment architecture
            </p>

            <p className="mt-1 max-w-4xl text-[11px] leading-5 text-indigo-700/70">
              Assignment metadata, deadlines, submissions, grading progress,
              course ownership, and student records will later come from FastAPI
              and PostgreSQL. Actual submission files should use object storage
              while PostgreSQL stores their metadata.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "GET /api/faculty/assignments",
                "POST /api/faculty/assignments",
                "GET /api/faculty/assignments/{id}",
                "PATCH /api/faculty/assignments/{id}",
                "DELETE /api/faculty/assignments/{id}",
                "GET /api/faculty/assignments/{id}/submissions",
              ].map((api) => (
                <code
                  key={api}
                  className="rounded-lg bg-white px-2.5 py-1.5 text-[10px] text-indigo-700 shadow-sm"
                >
                  {api}
                </code>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <CreateAssignmentModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(assignment) => {
            setAssignments((current) => [assignment, ...current]);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

function AssignmentStat({
  label,
  value,
  description,
  icon,
  iconClass,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
            {value}
          </p>

          <p className="mt-3 text-[11px] text-gray-400">{description}</p>
        </div>

        <div
          className={`grid h-10 w-10 place-items-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

function SelectFilter({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 min-w-36.25 appearance-none rounded-xl border border-gray-200 bg-white pl-4 pr-10 text-sm text-gray-600 outline-none focus:border-indigo-400"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-3.5 text-gray-400"
      />
    </div>
  );
}

function ProgressMetric({
  label,
  value,
  percentage,
  description,
}: {
  label: string;
  value: string;
  percentage: number;
  description: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-gray-900">{value}</p>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-indigo-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="mt-1.5 text-[10px] text-gray-400">{description}</p>
    </div>
  );
}

function CreateAssignmentModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (assignment: Assignment) => void;
}) {
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("SE-401");
  const [type, setType] = useState<Assignment["type"]>("Assignment");
  const [dueDate, setDueDate] = useState("05 Oct 2026");
  const [marks, setMarks] = useState("20");

  const createAssignment = () => {
    if (!title.trim()) return;

    const courseNames: Record<string, string> = {
      "SE-401": "Software Architecture",
      "AI-402": "Artificial Intelligence",
      "CS-405": "Cyber Security",
      "SE-406": "Web Engineering",
      "SE-407": "Software Testing",
      "SE-408": "Distributed Systems",
    };

    onCreate({
      id: `fa-${Date.now()}`,
      title: title.trim(),
      courseCode: course,
      courseName: courseNames[course],
      type,
      dueDate,
      dueTime: "11:59 PM",
      submissions: 0,
      totalStudents: course === "SE-401" ? 42 : 48,
      graded: 0,
      marks: Number(marks) || 20,
      status: "Draft",
      priority: "Medium",
    });
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-gray-950">
              Create Assignment
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Add the basic assignment details.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-5 p-6">
          <Field label="Assignment Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Microservices Architecture Report"
              className="input-style"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Course">
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="input-style"
              >
                <option>SE-401</option>
                <option>AI-402</option>
                <option>CS-405</option>
                <option>SE-406</option>
                <option>SE-407</option>
                <option>SE-408</option>
              </select>
            </Field>

            <Field label="Type">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Assignment["type"])}
                className="input-style"
              >
                <option>Assignment</option>
                <option>Project</option>
                <option>Report</option>
                <option>Quiz</option>
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Due Date">
              <input
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input-style"
              />
            </Field>

            <Field label="Total Marks">
              <input
                type="number"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="input-style"
              />
            </Field>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
            <p className="text-xs font-semibold text-indigo-800">
              Draft workflow
            </p>

            <p className="mt-1 text-[11px] leading-5 text-indigo-700/70">
              This prototype creates a draft assignment. Later, faculty can
              publish it through the backend after adding instructions,
              attachments, rubric, and submission settings.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={createAssignment}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            Create Draft
          </button>
        </div>
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
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </span>

      {children}
    </label>
  );
}
