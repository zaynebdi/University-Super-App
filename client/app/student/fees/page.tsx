"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import {
  CreditCard,
  Wallet,
  Receipt,
  CalendarDays,
  Download,
  CheckCircle2,
  Clock3,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

const transactions = [
  {
    id: "TXN-2026-0912",
    description: "Fall 2026 Semester Fee",
    date: "05 Sep 2026",
    amount: "PKR 82,500",
    method: "Bank Transfer",
    status: "Paid",
  },
  {
    id: "TXN-2026-0721",
    description: "Summer Semester Fee",
    date: "21 Jul 2026",
    amount: "PKR 74,000",
    method: "Online Payment",
    status: "Paid",
  },
  {
    id: "TXN-2026-0418",
    description: "Spring 2026 Semester Fee",
    date: "18 Apr 2026",
    amount: "PKR 79,500",
    method: "Bank Transfer",
    status: "Paid",
  },
  {
    id: "TXN-2026-0110",
    description: "Spring 2026 Registration",
    date: "10 Jan 2026",
    amount: "PKR 5,000",
    method: "Online Payment",
    status: "Paid",
  },
];

const feeBreakdown = [
  { label: "Tuition Fee", amount: 72000 },
  { label: "University Charges", amount: 4500 },
  { label: "Examination Fee", amount: 2500 },
  { label: "Technology Fee", amount: 2000 },
  { label: "Student Services", amount: 1500 },
];

export default function FeesPage() {
  const [showPayment, setShowPayment] = useState(false);

  const totalFee = feeBreakdown.reduce((total, item) => total + item.amount, 0);

  return (
    <AppShell>
      <div className="mx-auto max-w-350">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600">
              <CreditCard size={15} />
              Student Finance
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-950">
              Fees & Payments
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage your university fees, invoices and payment history.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">
              Secure Payment Portal
            </span>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Outstanding Balance
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-950">
                  PKR 24,500
                </h2>

                <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-amber-600">
                  <Clock3 size={12} />
                  Due 30 Sep 2026
                </p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
                <Wallet size={18} />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Current Semester
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-950">
                  PKR 82,500
                </h2>

                <p className="mt-2 text-[11px] text-gray-400">Fall 2026</p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <Receipt size={18} />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Paid This Year
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-950">
                  PKR 241,000
                </h2>

                <p className="mt-2 text-[11px] text-gray-400">
                  4 successful payments
                </p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={18} />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Payment Status
                </p>

                <h2 className="mt-2 text-2xl font-bold text-emerald-600">
                  Active
                </h2>

                <p className="mt-2 text-[11px] text-gray-400">
                  No account restrictions
                </p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck size={18} />
              </div>
            </div>
          </Card>
        </div>

        {/* Outstanding Payment */}
        <Card className="mt-6 overflow-hidden border-amber-100">
          <div className="flex flex-col justify-between gap-5 bg-amber-50/50 p-6 lg:flex-row lg:items-center">
            <div className="flex gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-600">
                <AlertCircle size={20} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                  Payment Due
                </p>

                <h2 className="mt-1 text-lg font-bold text-gray-950">
                  Fall 2026 Outstanding Fee
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Your remaining balance is due before 30 September 2026.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] text-gray-400">Amount Due</p>
                <p className="text-xl font-bold text-gray-950">PKR 24,500</p>
              </div>

              <button
                onClick={() => setShowPayment(!showPayment)}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-indigo-700"
              >
                Pay Now
              </button>
            </div>
          </div>

          {showPayment && (
            <div className="border-t border-amber-100 p-6">
              <h3 className="text-sm font-bold text-gray-950">
                Select Payment Method
              </h3>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {[
                  "Online Banking",
                  "Debit / Credit Card",
                  "University Bank Account",
                ].map((method) => (
                  <button
                    key={method}
                    className="rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50/40"
                  >
                    <p className="text-sm font-semibold text-gray-800">
                      {method}
                    </p>

                    <p className="mt-1 text-[10px] text-gray-400">
                      Continue securely
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Main Content */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_400px]">
          {/* Transactions */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <div>
                <h2 className="text-base font-bold text-gray-950">
                  Payment History
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Your recent university payments
                </p>
              </div>

              <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                View All
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col gap-4 p-5 transition hover:bg-gray-50/60 sm:flex-row sm:items-center"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Receipt size={17} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-gray-900">
                      {transaction.description}
                    </h3>

                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-400">
                      <span>{transaction.id}</span>
                      <span>{transaction.date}</span>
                      <span>{transaction.method}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-5 sm:justify-end">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {transaction.amount}
                      </p>

                      <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                        <CheckCircle2 size={11} />
                        {transaction.status}
                      </span>
                    </div>

                    <button className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-indigo-600">
                      <Download size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Fee Breakdown */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-950">
                  Current Fee Breakdown
                </h2>

                <p className="mt-1 text-xs text-gray-400">Fall 2026 semester</p>
              </div>

              <Receipt size={18} className="text-gray-300" />
            </div>

            <div className="mt-6 space-y-4">
              {feeBreakdown.map((fee) => (
                <div
                  key={fee.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-500">{fee.label}</span>

                  <span className="font-semibold text-gray-800">
                    PKR {fee.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">
                  Total Semester Fee
                </span>

                <span className="text-lg font-bold text-indigo-600">
                  PKR {totalFee.toLocaleString()}
                </span>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex justify-between text-[10px]">
                  <span className="text-gray-400">Amount Paid</span>

                  <span className="font-semibold text-gray-600">
                    PKR 58,000
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: "70.3%" }}
                  />
                </div>

                <div className="mt-2 flex justify-between text-[10px] text-gray-400">
                  <span>70.3% paid</span>
                  <span>PKR 24,500 remaining</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPayment(true)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white transition hover:bg-indigo-700"
            >
              <CreditCard size={15} />
              Pay Outstanding Balance
            </button>
          </Card>
        </div>

        {/* Payment Schedule */}
        <Card className="mt-6 p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <CalendarDays size={18} />
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-950">
                Payment Schedule
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Important upcoming financial dates
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Current Balance Due
              </p>

              <p className="mt-2 text-sm font-bold text-gray-900">
                30 Sep 2026
              </p>

              <p className="mt-1 text-xs text-amber-600">PKR 24,500</p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Late Payment Period
              </p>

              <p className="mt-2 text-sm font-bold text-gray-900">
                01 – 07 Oct 2026
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Additional charges may apply
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Next Semester
              </p>

              <p className="mt-2 text-sm font-bold text-gray-900">Jan 2027</p>

              <p className="mt-1 text-xs text-gray-400">
                Registration fee schedule pending
              </p>
            </div>
          </div>
        </Card>

        <p className="mt-5 px-2 text-center text-[10px] text-gray-400">
          All payment information shown is for demonstration purposes.
        </p>
      </div>
    </AppShell>
  );
}
