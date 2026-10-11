"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import {
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Download,
  GraduationCap,
  Loader2,
  TrendingUp,
} from "lucide-react";

import {
  api,
  type StudentResultsDTO,
} from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";
import { GradePoints } from "@/lib/constants";

type Data = {
  results: StudentResultsDTO;
  department: string;
};

const semesters = ["Fall 2026", "Spring 2026", "Fall 2025", "Spring 2025"];

export default function GradesPage() {
  const [selectedSemester, setSelectedSemester] = useState("Fall 2026");

  const { data, loading, error } = useApiResource<Data>(async () => {
    const me = await api.students.me();
    const results = await api.results.byStudent(me.id);
    return { results, department: me.department };
  });

  const results = data?.results.results ?? [];
  const gpa = data?.results.gpa;
  const department = data?.department;

  const totalCredits = results.reduce(
    (sum, result) => sum + (result.course?.creditHours ?? 0),
    0,
  );

  const gradeDistribution = useMemo(() => {
    const list = data?.results.results ?? [];
    const counts = new Map<string, number>();
    for (const result of list) {
      counts.set(result.grade, (counts.get(result.grade) ?? 0) + 1);
    }
    const order = Object.keys(GradePoints);
    return [...counts.entries()]
      .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
      .map(([grade, count]) => ({
        grade,
        count,
        percentage: list.length ? Math.round((count / list.length) * 100) : 0,
      }));
  }, [data]);

  const gpaBars = gpa != null ? [{ semester: selectedSemester, gpa }] : [];

  const standing =
    gpa == null ? "—" : gpa >= 2 ? "Good Standing" : "Academic Warning";

  return (
    <AppShell>
      <div className="mx-auto max-w-375">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600">
              <GraduationCap size={15} />
              Academic Performance
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-950">
              Grades & Results
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Track your academic performance, GPA and semester results.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm font-semibold text-gray-700 outline-none transition focus:border-indigo-400"
              >
                {semesters.map((semester) => (
                  <option key={semester}>{semester}</option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>

            <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
              <Download size={16} />
              Transcript
            </button>
          </div>
        </div>

        {/* Academic Summary */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Current GPA</p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                  {gpa != null ? gpa.toFixed(2) : "—"}
                </h2>

                <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                  <TrendingUp size={13} />
                  Based on recorded results
                </p>
              </div>

              <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <TrendingUp size={19} />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Cumulative CGPA
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                  —
                </h2>

                <p className="mt-2 text-[11px] text-gray-400">Out of 4.00</p>
              </div>

              <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-violet-600">
                <Award size={19} />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Completed Credits
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                  {totalCredits}
                </h2>

                <p className="mt-2 text-[11px] text-gray-400">
                  From recorded results
                </p>
              </div>

              <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <BookOpen size={19} />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Semester Result
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                  {results.length}
                </h2>

                <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                  <CheckCircle2 size={13} />
                  Courses completed
                </p>
              </div>

              <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-600">
                <GraduationCap size={19} />
              </div>
            </div>
          </Card>
        </div>

        {/* Performance + Grade Distribution */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-950">
                  GPA Performance
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Semester-by-semester academic progress
                </p>
              </div>

              <div className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
                {gpa != null ? `${gpa.toFixed(2)} GPA` : "— GPA"}
              </div>
            </div>

            {gpaBars.length === 0 ? (
              <div className="mt-7 flex h-55 items-center justify-center border-b border-gray-100 text-sm text-gray-400">
                No GPA data available.
              </div>
            ) : (
              <div className="mt-7 flex h-55 items-end gap-3 border-b border-gray-100 pb-0 sm:gap-5">
                {gpaBars.map((item) => {
                  const height = `${(item.gpa / 4) * 100}%`;

                  return (
                    <div
                      key={item.semester}
                      className="flex h-full flex-1 flex-col items-center justify-end"
                    >
                      <span className="mb-2 text-[10px] font-bold text-gray-500">
                        {item.gpa.toFixed(2)}
                      </span>

                      <div className="flex h-42.5 w-full items-end">
                        <div
                          className="w-full rounded-t-lg bg-indigo-500 transition hover:bg-indigo-600"
                          style={{ height }}
                        />
                      </div>

                      <span className="mt-3 text-center text-[9px] font-medium text-gray-400">
                        {item.semester.replace(" ", "\n")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div>
              <h2 className="text-base font-bold text-gray-950">
                Grade Distribution
              </h2>

              <p className="mt-1 text-xs text-gray-400">Current semester</p>
            </div>

            {gradeDistribution.length === 0 ? (
              <div className="mt-7 text-sm text-gray-400">
                No grades recorded yet.
              </div>
            ) : (
              <div className="mt-7 space-y-5">
                {gradeDistribution.map((item) => (
                  <div key={item.grade}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-800">
                        {item.grade}
                      </span>

                      <span className="text-xs text-gray-400">
                        {item.count} course{item.count > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Results Table */}
        <Card className="mt-6 overflow-hidden">
          <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-bold text-gray-950">
                Semester Results
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                {selectedSemester} · {department ?? "—"}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500">
              {results.length} Courses · {totalCredits} Credits
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-225 text-left">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Course
                  </th>

                  <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Credits
                  </th>

                  <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Total
                  </th>

                  <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Grade
                  </th>

                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Points
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-sm text-gray-500"
                    >
                      <span className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" /> Loading
                        results…
                      </span>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-sm text-red-600"
                    >
                      <span className="flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                      </span>
                    </td>
                  </tr>
                ) : results.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm text-gray-500"
                    >
                      No results recorded yet.
                    </td>
                  </tr>
                ) : (
                  results.map((result) => (
                    <tr
                      key={result.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50/70"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                            <BookOpen size={16} />
                          </div>

                          <div>
                            <p className="text-xs font-bold text-indigo-600">
                              {result.course?.code ?? "—"}
                            </p>

                            <p className="mt-0.5 text-sm font-semibold text-gray-900">
                              {result.course?.title ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-5 text-sm font-medium text-gray-600">
                        {result.course?.creditHours ?? "—"}
                      </td>

                      <td className="px-4 py-5 text-sm font-bold text-gray-900">
                        {result.marks}
                      </td>

                      <td className="px-4 py-5">
                        <span className="inline-flex rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-600">
                          {result.grade}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm font-bold text-gray-900">
                        {GradePoints[result.grade]?.toFixed(1) ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col justify-between gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4 text-xs sm:flex-row">
            <span className="text-gray-400">
              Grading scale: A = 4.0 · A- = 3.7 · B+ = 3.3 · B = 3.0
            </span>

            <span className="font-semibold text-gray-600">
              Semester GPA:{" "}
              <span className="text-indigo-600">
                {gpa != null ? gpa.toFixed(2) : "—"}
              </span>
            </span>
          </div>
        </Card>

        {/* Academic Standing */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-base font-bold text-gray-950">
              Academic Progress
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Degree completion overview
            </p>

            <div className="mt-6 flex items-end justify-between rounded-xl bg-gray-50 px-4 py-5">
              <div>
                <p className="text-2xl font-bold text-gray-950">
                  {totalCredits}
                </p>
                <p className="mt-1 text-[11px] text-gray-400">
                  credits recorded
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-gray-950">
                  {results.length}
                </p>
                <p className="mt-1 text-[11px] text-gray-400">
                  recorded results
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-indigo-100 bg-indigo-50/50 p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white">
                <Award size={20} />
              </div>

              <div>
                <h2 className="text-base font-bold text-gray-950">
                  Academic Standing
                </h2>

                <p className="mt-1 text-sm font-semibold text-indigo-600">
                  {standing}
                </p>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Your current academic performance meets the university
                  requirements. Keep maintaining your GPA and attendance.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
