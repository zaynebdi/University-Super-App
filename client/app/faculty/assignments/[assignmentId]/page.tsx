"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Award,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  FileText,
  MessageSquare,
  Search,
  Send,
  User,
  Users,
  X,
} from "lucide-react";

import Card from "@/components/ui/Card";

type SubmissionStatus = "Submitted" | "Late" | "Not Submitted" | "Graded";

type Submission = {
  id: string;
  student: string;
  studentId: string;
  initials: string;
  submittedAt: string;
  status: SubmissionStatus;
  marks: number | null;
  feedback: string;
};

const initialSubmissions: Submission[] = [
  {
    id: "sub-001",
    student: "Ahmed Hassan",
    studentId: "SE-2022-041",
    initials: "AH",
    submittedAt: "Sep 25, 2026 · 08:42 PM",
    status: "Graded",
    marks: 18,
    feedback: "Strong architecture analysis with clear diagrams.",
  },
  {
    id: "sub-002",
    student: "Ayesha Malik",
    studentId: "SE-2022-057",
    initials: "AM",
    submittedAt: "Sep 25, 2026 · 10:18 PM",
    status: "Graded",
    marks: 17,
    feedback: "Good analysis. Add more detail around service communication.",
  },
  {
    id: "sub-003",
    student: "Hamza Ali",
    studentId: "SE-2022-063",
    initials: "HA",
    submittedAt: "Sep 26, 2026 · 11:21 PM",
    status: "Submitted",
    marks: null,
    feedback: "",
  },
  {
    id: "sub-004",
    student: "Fatima Noor",
    studentId: "SE-2022-071",
    initials: "FN",
    submittedAt: "Sep 26, 2026 · 09:12 PM",
    status: "Submitted",
    marks: null,
    feedback: "",
  },
  {
    id: "sub-005",
    student: "Usman Tariq",
    studentId: "SE-2022-084",
    initials: "UT",
    submittedAt: "Sep 27, 2026 · 12:14 AM",
    status: "Late",
    marks: null,
    feedback: "",
  },
  {
    id: "sub-006",
    student: "Maham Khan",
    studentId: "SE-2022-091",
    initials: "MK",
    submittedAt: "Sep 25, 2026 · 07:54 PM",
    status: "Graded",
    marks: 16,
    feedback: "Well structured report.",
  },
  {
    id: "sub-007",
    student: "Bilal Ahmed",
    studentId: "SE-2022-103",
    initials: "BA",
    submittedAt: "—",
    status: "Not Submitted",
    marks: null,
    feedback: "",
  },
  {
    id: "sub-008",
    student: "Hira Shah",
    studentId: "SE-2022-118",
    initials: "HS",
    submittedAt: "Sep 26, 2026 · 08:31 PM",
    status: "Submitted",
    marks: null,
    feedback: "",
  },
];

const statusStyles: Record<SubmissionStatus, string> = {
  Submitted: "bg-indigo-50 text-indigo-700 border-indigo-100",
  Graded: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Late: "bg-amber-50 text-amber-700 border-amber-100",
  "Not Submitted": "bg-gray-100 text-gray-500 border-gray-200",
};

export default function FacultyAssignmentDetailsPage() {
  const [submissions, setSubmissions] =
    useState<Submission[]>(initialSubmissions);

  const [activeTab, setActiveTab] = useState<"Overview" | "Submissions">(
    "Overview",
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  const assignment = {
    id: "fa-001",
    title: "Microservices Architecture Report",
    courseCode: "SE-401",
    courseName: "Software Architecture",
    type: "Report",
    description:
      "Prepare a technical report analyzing a microservices-based architecture. Explain service boundaries, communication patterns, scalability considerations, fault tolerance, and deployment strategy.",
    dueDate: "26 Sep 2026",
    dueTime: "11:59 PM",
    totalMarks: 20,
    submissions: 30,
    totalStudents: 42,
  };

  const submittedCount = submissions.filter(
    (item) =>
      item.status === "Submitted" ||
      item.status === "Late" ||
      item.status === "Graded",
  ).length;

  const gradedCount = submissions.filter(
    (item) => item.status === "Graded",
  ).length;

  const lateCount = submissions.filter((item) => item.status === "Late").length;

  const averageMarks = useMemo(() => {
    const graded = submissions.filter((item) => item.marks !== null);

    if (!graded.length) return 0;

    return Math.round(
      graded.reduce((sum, item) => sum + (item.marks || 0), 0) / graded.length,
    );
  }, [submissions]);

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.student.toLowerCase().includes(search.toLowerCase()) ||
      submission.studentId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || submission.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const saveGrade = (submissionId: string, marks: number, feedback: string) => {
    setSubmissions((current) =>
      current.map((submission) =>
        submission.id === submissionId
          ? {
              ...submission,
              marks,
              feedback,
              status: "Graded",
            }
          : submission,
      ),
    );

    setSelectedSubmission(null);
  };

  return (
    <div className="mx-auto max-w-375 space-y-7">
      {/* Back */}
      <Link
        href="/faculty/assignments"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-indigo-600"
      >
        <ArrowLeft size={15} />
        Back to Assignments
      </Link>

      {/* Hero */}
      <Card className="overflow-hidden">
        <div className="relative bg-linear-to-br from-gray-950 via-indigo-950 to-violet-900 px-6 py-7 text-white lg:px-8">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col justify-between gap-6 lg:flex-row">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-indigo-200">
                  <FileText size={13} />
                  {assignment.courseCode} · {assignment.type}
                </div>

                <h1 className="max-w-3xl text-2xl font-bold tracking-tight lg:text-3xl">
                  {assignment.title}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
                  {assignment.courseName} · Faculty Assignment Workspace
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] text-white/70">
                    <CalendarDays size={12} />
                    Due {assignment.dueDate}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] text-white/70">
                    <Clock3 size={12} />
                    {assignment.dueTime}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] text-white/70">
                    <Award size={12} />
                    {assignment.totalMarks} marks
                  </span>
                </div>
              </div>

              <div className="grid min-w-57.5 grid-cols-2 gap-3 self-start">
                <HeroMetric
                  label="Submitted"
                  value={`${submittedCount}/${assignment.totalStudents}`}
                />

                <HeroMetric label="Graded" value={`${gradedCount}`} />

                <HeroMetric label="Late" value={`${lateCount}`} />

                <HeroMetric
                  label="Avg. Marks"
                  value={`${averageMarks}/${assignment.totalMarks}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-100 px-5">
          {(["Overview", "Submissions"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative whitespace-nowrap px-5 py-4 text-xs font-semibold transition ${
                activeTab === tab
                  ? "text-indigo-600"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              {tab}

              {tab === "Submissions" && (
                <span className="ml-2 rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px]">
                  {submittedCount}
                </span>
              )}

              {activeTab === tab && (
                <span className="absolute bottom-0 left-5 right-5 h-0.5 rounded-full bg-indigo-600" />
              )}
            </button>
          ))}
        </div>
      </Card>

      {activeTab === "Overview" ? (
        <>
          {/* Description */}
          <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
            <Card className="p-6">
              <SectionHeader
                icon={<FileText size={17} />}
                title="Assignment Details"
                subtitle="Instructions and assessment information"
              />

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900">
                  Instructions
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-500">
                  {assignment.description}
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <InfoItem
                  label="Course"
                  value={`${assignment.courseCode} · ${assignment.courseName}`}
                />

                <InfoItem label="Assignment Type" value={assignment.type} />

                <InfoItem
                  label="Due Date"
                  value={`${assignment.dueDate} · ${assignment.dueTime}`}
                />

                <InfoItem
                  label="Maximum Marks"
                  value={`${assignment.totalMarks} marks`}
                />
              </div>
            </Card>

            <Card className="p-6">
              <SectionHeader
                icon={<BarIcon />}
                title="Submission Analytics"
                subtitle="Current assignment activity"
              />

              <div className="mt-6 space-y-5">
                <AnalyticsRow
                  label="Submission Rate"
                  value={`${Math.round(
                    (submittedCount / assignment.totalStudents) * 100,
                  )}%`}
                  percentage={Math.round(
                    (submittedCount / assignment.totalStudents) * 100,
                  )}
                />

                <AnalyticsRow
                  label="Grading Progress"
                  value={`${Math.round(
                    (gradedCount / Math.max(submittedCount, 1)) * 100,
                  )}%`}
                  percentage={Math.round(
                    (gradedCount / Math.max(submittedCount, 1)) * 100,
                  )}
                />

                <AnalyticsRow
                  label="Late Submissions"
                  value={`${lateCount}`}
                  percentage={Math.round(
                    (lateCount / assignment.totalStudents) * 100,
                  )}
                />
              </div>

              <button
                onClick={() => setActiveTab("Submissions")}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                <Users size={15} />
                Review Submissions
              </button>
            </Card>
          </div>

          {/* Assessment criteria */}
          <Card className="p-6">
            <SectionHeader
              icon={<Award size={17} />}
              title="Assessment Criteria"
              subtitle="Suggested grading structure"
            />

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Criterion
                title="Architecture Design"
                percentage="40%"
                description="Service boundaries, architecture quality and diagrams."
              />

              <Criterion
                title="Technical Analysis"
                percentage="35%"
                description="Depth of research, scalability and fault tolerance."
              />

              <Criterion
                title="Documentation"
                percentage="25%"
                description="Clarity, structure, references and presentation."
              />
            </div>
          </Card>
        </>
      ) : (
        <>
          {/* Submission workspace */}
          <Card className="overflow-hidden">
            <div className="border-b border-gray-100 p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-950">
                    Student Submissions
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">
                    Review files, assign marks, and provide feedback.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 sm:w-64">
                    <Search size={15} className="text-gray-400" />

                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search student..."
                      className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-gray-400"
                    />
                  </div>

                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                      "All",
                      "Submitted",
                      "Graded",
                      "Late",
                      "Not Submitted",
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-237.5">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Student
                    </th>

                    <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Submitted
                    </th>

                    <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Status
                    </th>

                    <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Marks
                    </th>

                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredSubmissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className="transition hover:bg-gray-50/60"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-[10px] font-bold text-white">
                            {submission.initials}
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-gray-900">
                              {submission.student}
                            </p>

                            <p className="mt-0.5 text-[10px] text-gray-400">
                              {submission.studentId}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-4 text-xs text-gray-500">
                        {submission.submittedAt}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[9px] font-semibold ${statusStyles[submission.status]}`}
                        >
                          {submission.status}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        {submission.marks !== null ? (
                          <span className="text-sm font-bold text-gray-800">
                            {submission.marks}
                            <span className="text-[10px] font-normal text-gray-400">
                              /{assignment.totalMarks}
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {submission.status === "Not Submitted" ? (
                          <button
                            disabled
                            className="rounded-xl bg-gray-100 px-3 py-2 text-[10px] font-semibold text-gray-400"
                          >
                            No Submission
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedSubmission(submission)}
                            className="rounded-xl bg-indigo-50 px-3 py-2 text-[10px] font-semibold text-indigo-700 hover:bg-indigo-100"
                          >
                            {submission.status === "Graded"
                              ? "View Grade"
                              : "Review & Grade"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredSubmissions.length === 0 && (
              <div className="px-6 py-16 text-center">
                <Search className="mx-auto text-gray-300" size={22} />

                <p className="mt-3 text-sm font-semibold text-gray-800">
                  No submissions found
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Try another student or status.
                </p>
              </div>
            )}
          </Card>

          {/* Submission stats */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SmallMetric
              label="Submitted"
              value={`${submittedCount}`}
              description={`of ${assignment.totalStudents} students`}
              icon={<CheckCircle2 size={17} />}
            />

            <SmallMetric
              label="Pending Review"
              value={`${submittedCount - gradedCount}`}
              description="Submissions to grade"
              icon={<Clock3 size={17} />}
            />

            <SmallMetric
              label="Late"
              value={`${lateCount}`}
              description="Submitted after deadline"
              icon={<Clock3 size={17} />}
            />

            <SmallMetric
              label="Average Marks"
              value={`${averageMarks}/${assignment.totalMarks}`}
              description="Across graded work"
              icon={<Award size={17} />}
            />
          </div>
        </>
      )}

      {/* Backend note */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
        <div className="flex gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm">
            <CheckCircle2 size={17} />
          </div>

          <div>
            <p className="text-xs font-semibold text-indigo-900">
              Backend-ready submission workflow
            </p>

            <p className="mt-1 max-w-4xl text-[11px] leading-5 text-indigo-700/70">
              Submission records, file metadata, grading, feedback, deadlines,
              and faculty ownership will later be persisted through FastAPI and
              PostgreSQL. Actual assignment files should be stored in object
              storage rather than inside PostgreSQL.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "GET /api/faculty/assignments/{id}",
                "GET /api/faculty/assignments/{id}/submissions",
                "GET /api/faculty/submissions/{id}",
                "PATCH /api/faculty/submissions/{id}/grade",
                "GET /api/faculty/submissions/{id}/file",
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

      {/* Grading modal */}
      {selectedSubmission && (
        <GradeModal
          submission={selectedSubmission}
          totalMarks={assignment.totalMarks}
          onClose={() => setSelectedSubmission(null)}
          onSave={saveGrade}
        />
      )}
    </div>
  );
}

function GradeModal({
  submission,
  totalMarks,
  onClose,
  onSave,
}: {
  submission: Submission;
  totalMarks: number;
  onClose: () => void;
  onSave: (submissionId: string, marks: number, feedback: string) => void;
}) {
  const [marks, setMarks] = useState(submission.marks?.toString() || "");

  const [feedback, setFeedback] = useState(submission.feedback);

  const handleSave = () => {
    const numericMarks = Number(marks);

    if (
      Number.isNaN(numericMarks) ||
      numericMarks < 0 ||
      numericMarks > totalMarks
    ) {
      return;
    }

    onSave(submission.id, numericMarks, feedback);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
              {submission.initials}
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-950">
                {submission.student}
              </h2>

              <p className="mt-0.5 text-[11px] text-gray-400">
                {submission.studentId} · {submission.submittedAt}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {/* Submitted file */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm">
                  <FileText size={18} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    Microservices_Architecture_Report.pdf
                  </p>

                  <p className="mt-0.5 text-[10px] text-gray-400">
                    PDF · 4.8 MB
                  </p>
                </div>
              </div>

              <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[10px] font-semibold text-gray-600 hover:bg-gray-50">
                <Download size={14} />
                Download
              </button>
            </div>
          </div>

          {/* Marks */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Marks
            </label>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max={totalMarks}
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="h-12 w-28 rounded-xl border border-gray-200 bg-white px-4 text-lg font-bold text-gray-900 outline-none focus:border-indigo-400"
              />

              <span className="text-sm text-gray-400">
                / {totalMarks} marks
              </span>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Feedback
            </label>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
              placeholder="Write feedback for the student..."
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-indigo-400"
            />
          </div>

          {/* Quick feedback */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Quick Feedback
            </p>

            <div className="flex flex-wrap gap-2">
              {[
                "Strong technical analysis",
                "Good documentation",
                "Needs more detail",
                "Improve architecture diagrams",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    setFeedback((current) =>
                      current ? `${current} ${item}.` : `${item}.`,
                    )
                  }
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[10px] text-gray-500 hover:bg-gray-50"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
            <div className="flex gap-3">
              <MessageSquare
                size={16}
                className="mt-0.5 shrink-0 text-indigo-600"
              />

              <p className="text-[11px] leading-5 text-indigo-700/75">
                Saving this grade will mark the submission as graded. In the
                production version, the student will receive a notification
                containing the marks and feedback.
              </p>
            </div>
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
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            <Send size={14} />
            Save Grade
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 p-3">
      <p className="text-[9px] uppercase tracking-wider text-white/40">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
        {icon}
      </div>

      <div>
        <h2 className="text-sm font-bold text-gray-950">{title}</h2>
        <p className="text-[11px] text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
      <p className="text-[10px] uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-1.5 text-xs font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function AnalyticsRow({
  label,
  value,
  percentage,
}: {
  label: string;
  value: string;
  percentage: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-bold text-gray-800">{value}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-indigo-500"
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />
      </div>
    </div>
  );
}

function Criterion({
  title,
  percentage,
  description,
}: {
  title: string;
  percentage: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-800">{title}</p>

        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-600">
          {percentage}
        </span>
      </div>

      <p className="mt-3 text-[11px] leading-5 text-gray-400">{description}</p>
    </div>
  );
}

function SmallMetric({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>

          <p className="mt-2 text-xl font-bold text-gray-950">{value}</p>

          <p className="mt-2 text-[10px] text-gray-400">{description}</p>
        </div>

        <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      </div>
    </Card>
  );
}

function Select({
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
        className="h-10 min-w-33.75 appearance-none rounded-xl border border-gray-200 bg-white pl-3 pr-9 text-xs text-gray-600 outline-none focus:border-indigo-400"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-3 text-gray-400"
      />
    </div>
  );
}

function BarIcon() {
  return (
    <div className="flex h-4 items-end gap-0.5">
      <span className="h-2 w-1.5 rounded-sm bg-indigo-400" />
      <span className="h-3 w-1.5 rounded-sm bg-indigo-500" />
      <span className="h-4 w-1.5 rounded-sm bg-indigo-600" />
    </div>
  );
}
