"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Lock, X } from "lucide-react";

import { api, ApiError } from "@/lib/api-client";

const inputClass =
  "h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-indigo-400";

export default function ChangePasswordModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (form.newPassword === form.currentPassword) {
      setError("New password must be different from the current password.");
      return;
    }

    setBusy(true);
    try {
      await api.auth.changePassword(form.currentPassword, form.newPassword);
      setDone(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to change password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <Lock size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Change password</h2>
              <p className="mt-0.5 text-xs text-gray-400">
                Update the password for your account.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {done ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <CheckCircle2 size={18} className="mt-0.5 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">
                    Password changed
                  </p>
                  <p className="mt-1 text-xs leading-5 text-emerald-700/80">
                    Your password has been updated. Your current session stays
                    active — use it until you sign out.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Current password
                </span>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={form.currentPassword}
                  onChange={(e) =>
                    setForm({ ...form, currentPassword: e.target.value })
                  }
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-600">
                  New password
                </span>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm({ ...form, newPassword: e.target.value })
                  }
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Confirm new password
                </span>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  className={inputClass}
                />
              </label>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {busy && <Loader2 size={14} className="animate-spin" />}
                  Update password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
