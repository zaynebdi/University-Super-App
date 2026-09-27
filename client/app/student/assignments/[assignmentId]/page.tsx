"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Download,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  UserRound,
  BookOpen,
  Send,
  X,
} from "lucide-react";

const assignment = {
  id: "software-architecture-01",
  title: "Microservices Architecture Report",
  course: "SE-401",
  courseName: "Software Architecture",
  instructor: "Dr. Ahmed Khan",
  dueDate: "26 Sep 2026",
  dueTime: "11:59 PM",
  marks: 20,
  priority: "High",
  description:
    "Analyze a real-world software system and propose a microservices-based architecture. Your report should explain service boundaries, communication patterns, data ownership and deployment strategy.",
  instructions: [
    "Select a real-world application that can benefit from microservices.",
    "Identify the major business capabilities and define appropriate services.",
    "Explain communication between services using REST, messaging or event-driven architecture.",
    "Provide a database strategy for each service.",
    "Include a deployment architecture diagram.",
    "Submit the final report as a PDF.",
  ],
  requirements: [
    "PDF format",
    "Maximum file size: 10 MB",
    "Recommended length: 8–12 pages",
    "Include student name and registration number",
  ],
};

const resources = [
  {
    name: "Assignment Brief.pdf",
    size: "1.2 MB",
  },
  {
    name: "Architecture Guidelines.pdf",
    size: "860 KB",
  },
  {
    name: "Sample Architecture Diagram.png",
    size: "420 KB",
  },
];

export default function AssignmentDetailsPage() {
  const params = useParams();
  const assignmentId = params.assignmentId;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = () => {
    if (!selectedFile) return;

    setSubmitted(true);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-350">
        {/* Back */}
        <Link
          href="/student/assignments"
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-gray-500 transition hover:text-indigo-600"
        >
          <ArrowLeft size={15} />
          Back to Assignments
        </Link>

        {/* Hero */}
        <Card className="mb-6 overflow-hidden">
          <div className="border-b border-gray-100 bg-linear-to-br from-indigo-50 via-white to-violet-50 px-6 py-7 lg:px-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
              <div className="flex gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                  <FileText size={24} />
                </div>

                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-white px-2.5 py-1 text-[10px] font-bold text-indigo-600 shadow-sm">
                      {assignment.course}
                    </span>

                    <span className="rounded-md bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-500">
                      {assignment.priority} Priority
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-gray-950 lg:text-3xl">
                    {assignment.title}
                  </h1>

                  <p className="mt-2 text-sm text-gray-500">
                    {assignment.courseName}
                  </p>
                </div>
              </div>

              <div>
                {submitted ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 size={15} />
                    Submitted
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-600">
                    <Clock3 size={15} />
                    Pending Submission
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="grid divide-y divide-gray-100 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
            <div className="flex items-center gap-3 px-6 py-5">
              <CalendarDays size={18} className="text-indigo-500" />

              <div>
                <p className="text-[10px] text-gray-400">Due Date</p>

                <p className="mt-1 text-xs font-semibold text-gray-800">
                  {assignment.dueDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-5">
              <Clock3 size={18} className="text-indigo-500" />

              <div>
                <p className="text-[10px] text-gray-400">Deadline</p>

                <p className="mt-1 text-xs font-semibold text-gray-800">
                  {assignment.dueTime}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-5">
              <BookOpen size={18} className="text-indigo-500" />

              <div>
                <p className="text-[10px] text-gray-400">Assessment</p>

                <p className="mt-1 text-xs font-semibold text-gray-800">
                  {assignment.marks} Marks
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-5">
              <UserRound size={18} className="text-indigo-500" />

              <div>
                <p className="text-[10px] text-gray-400">Instructor</p>

                <p className="mt-1 text-xs font-semibold text-gray-800">
                  {assignment.instructor}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Main content */}
        <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
          {/* Left */}
          <div className="space-y-6">
            {/* Description */}
            <Card className="p-6">
              <div className="mb-5">
                <h2 className="text-base font-bold text-gray-950">
                  Assignment Overview
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  What you need to complete
                </p>
              </div>

              <p className="text-sm leading-7 text-gray-600">
                {assignment.description}
              </p>
            </Card>

            {/* Instructions */}
            <Card className="p-6">
              <h2 className="text-base font-bold text-gray-950">
                Instructions
              </h2>

              <div className="mt-5 space-y-4">
                {assignment.instructions.map((instruction, index) => (
                  <div key={instruction} className="flex gap-3">
                    <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600">
                      {index + 1}
                    </div>

                    <p className="pt-0.5 text-sm leading-6 text-gray-600">
                      {instruction}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Resources */}
            <Card className="overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="text-base font-bold text-gray-950">
                  Assignment Resources
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Files provided by your instructor
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {resources.map((resource) => (
                  <div
                    key={resource.name}
                    className="flex items-center gap-4 px-6 py-4"
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-gray-50 text-gray-500">
                      <FileText size={18} />
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {resource.name}
                      </p>

                      <p className="mt-0.5 text-[10px] text-gray-400">
                        {resource.size}
                      </p>
                    </div>

                    <button className="rounded-lg border border-gray-200 p-2 text-gray-400 transition hover:bg-gray-50 hover:text-indigo-600">
                      <Download size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right */}
          <div className="space-y-6">
            {/* Submission */}
            <Card className="overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="text-base font-bold text-gray-950">
                  Submit Assignment
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Upload your final submission
                </p>
              </div>

              <div className="p-6">
                {submitted ? (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        size={20}
                        className="mt-0.5 text-emerald-600"
                      />

                      <div>
                        <p className="text-sm font-bold text-emerald-700">
                          Assignment Submitted
                        </p>

                        <p className="mt-1 text-xs leading-5 text-emerald-600">
                          Your submission has been recorded successfully.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-white p-3">
                      <p className="text-[10px] text-gray-400">
                        Submitted File
                      </p>

                      <p className="mt-1 text-xs font-semibold text-gray-700">
                        {selectedFile?.name}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Upload zone */}
                    {!selectedFile ? (
                      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-5 py-10 text-center transition hover:border-indigo-300 hover:bg-indigo-50/30">
                        <div className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                          <UploadCloud size={22} />
                        </div>

                        <p className="mt-4 text-sm font-semibold text-gray-800">
                          Upload your assignment
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Drag & drop or click to browse
                        </p>

                        <p className="mt-3 text-[10px] text-gray-400">
                          PDF · DOCX · ZIP · Max 10 MB
                        </p>

                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.zip"
                          onChange={handleFileChange}
                        />
                      </label>
                    ) : (
                      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-indigo-600">
                            <FileText size={18} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-gray-800">
                              {selectedFile.name}
                            </p>

                            <p className="mt-1 text-[10px] text-gray-400">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>

                          <button
                            onClick={removeFile}
                            className="rounded-lg p-2 text-gray-400 hover:bg-white hover:text-red-500"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      onClick={handleSubmit}
                      disabled={!selectedFile}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                    >
                      <Send size={16} />
                      Submit Assignment
                    </button>
                  </>
                )}
              </div>
            </Card>

            {/* Requirements */}
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-50 text-amber-600">
                  <AlertTriangle size={17} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    Submission Requirements
                  </h2>

                  <p className="text-[10px] text-gray-400">
                    Please check before submitting
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {assignment.requirements.map((requirement) => (
                  <div key={requirement} className="flex items-center gap-2.5">
                    <CheckCircle2
                      size={14}
                      className="shrink-0 text-emerald-500"
                    />

                    <span className="text-xs text-gray-500">{requirement}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Deadline warning */}
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
              <div className="flex gap-3">
                <Clock3 size={18} className="mt-0.5 shrink-0 text-amber-600" />

                <div>
                  <p className="text-xs font-bold text-amber-700">
                    Submission Deadline
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-600">
                    Make sure your assignment is submitted before{" "}
                    <strong>
                      {assignment.dueDate} at {assignment.dueTime}
                    </strong>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
