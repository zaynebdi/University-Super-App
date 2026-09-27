"use client";

import { useState } from "react";
import {
  Bell,
  ShieldCheck,
  Lock,
  Monitor,
  Moon,
  Sun,
  Globe,
  Smartphone,
  Mail,
  MessageSquare,
  Eye,
  EyeOff,
  LogOut,
  Trash2,
  Check,
  ChevronRight,
  Laptop,
  MapPin,
} from "lucide-react";
import Card from "@/components/ui/Card";

type ToggleProps = {
  enabled: boolean;
  onChange: () => void;
};

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-label="Toggle setting"
      className={[
        "relative h-6 w-11 rounded-full transition",
        enabled ? "bg-indigo-600" : "bg-gray-200",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition",
          enabled ? "left-6" : "left-1",
        ].join(" ")}
      />
    </button>
  );
}

const sessions = [
  {
    id: 1,
    device: "Windows PC",
    browser: "Chrome · Windows 11",
    location: "Lahore, Pakistan",
    time: "Active now",
    current: true,
    icon: Laptop,
  },
  {
    id: 2,
    device: "iPhone",
    browser: "Safari · iOS",
    location: "Lahore, Pakistan",
    time: "2 hours ago",
    current: false,
    icon: Smartphone,
  },
];

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    assignmentReminders: true,
    attendanceAlerts: true,
    announcementAlerts: true,
    eventNotifications: false,
    aiRecommendations: true,
    profileVisibility: true,
    twoFactor: false,
    darkMode: false,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
    setSaved(false);
  };

  const saveChanges = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="mx-auto max-w-375">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-600">
            <ShieldCheck size={13} />
            Account & Security
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-950">
            Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Manage your account, notifications, privacy and security
            preferences.
          </p>
        </div>

        <button
          onClick={saveChanges}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
        >
          {saved ? <Check size={17} /> : null}
          {saved ? "Changes Saved" : "Save Changes"}
        </button>
      </div>

      {/* Account Overview */}
      <Card className="mb-6 overflow-hidden">
        <div className="bg-linear-to-r from-gray-950 via-gray-900 to-indigo-950 p-6 text-white lg:p-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-lg font-bold shadow-xl">
                AM
              </div>

              <div>
                <h2 className="text-lg font-bold">Abdullah Muhammad</h2>
                <p className="mt-1 text-sm text-white/55">
                  SE-2022-104 · Software Engineering
                </p>

                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Account Active
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-3">
                <p className="text-[10px] uppercase tracking-wider text-white/35">
                  Last Login
                </p>
                <p className="mt-1 text-sm font-semibold">Today</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-3">
                <p className="text-[10px] uppercase tracking-wider text-white/35">
                  Security
                </p>
                <p className="mt-1 text-sm font-semibold text-amber-300">
                  2FA Off
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          {/* Notifications */}
          <Card className="overflow-hidden">
            <div className="border-b border-gray-100 p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Bell size={18} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-950">Notifications</h2>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Choose what you want to be notified about.
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              <div className="flex items-center justify-between gap-5 p-5">
                <div className="flex items-start gap-3">
                  <Mail size={17} className="mt-0.5 text-gray-400" />

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Email notifications
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Receive important university updates by email.
                    </p>
                  </div>
                </div>

                <Toggle
                  enabled={settings.emailNotifications}
                  onChange={() => toggle("emailNotifications")}
                />
              </div>

              <div className="flex items-center justify-between gap-5 p-5">
                <div className="flex items-start gap-3">
                  <Bell size={17} className="mt-0.5 text-gray-400" />

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Assignment reminders
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Get reminded before assignments are due.
                    </p>
                  </div>
                </div>

                <Toggle
                  enabled={settings.assignmentReminders}
                  onChange={() => toggle("assignmentReminders")}
                />
              </div>

              <div className="flex items-center justify-between gap-5 p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={17} className="mt-0.5 text-gray-400" />

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Attendance alerts
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Alert me when attendance needs attention.
                    </p>
                  </div>
                </div>

                <Toggle
                  enabled={settings.attendanceAlerts}
                  onChange={() => toggle("attendanceAlerts")}
                />
              </div>

              <div className="flex items-center justify-between gap-5 p-5">
                <div className="flex items-start gap-3">
                  <MessageSquare size={17} className="mt-0.5 text-gray-400" />

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Announcement alerts
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Receive alerts for important university announcements.
                    </p>
                  </div>
                </div>

                <Toggle
                  enabled={settings.announcementAlerts}
                  onChange={() => toggle("announcementAlerts")}
                />
              </div>

              <div className="flex items-center justify-between gap-5 p-5">
                <div className="flex items-start gap-3">
                  <Bell size={17} className="mt-0.5 text-gray-400" />

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Event notifications
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Get updates about registered campus events.
                    </p>
                  </div>
                </div>

                <Toggle
                  enabled={settings.eventNotifications}
                  onChange={() => toggle("eventNotifications")}
                />
              </div>
            </div>
          </Card>

          {/* Privacy */}
          <Card className="overflow-hidden">
            <div className="border-b border-gray-100 p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
                  <Eye size={18} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-950">Privacy</h2>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Control how your information is used.
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              <div className="flex items-center justify-between gap-5 p-5">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Profile visibility
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Allow classmates and faculty to view your basic profile.
                  </p>
                </div>

                <Toggle
                  enabled={settings.profileVisibility}
                  onChange={() => toggle("profileVisibility")}
                />
              </div>

              <div className="flex items-center justify-between gap-5 p-5">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    AI recommendations
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Use your academic activity to personalize recommendations.
                  </p>
                </div>

                <Toggle
                  enabled={settings.aiRecommendations}
                  onChange={() => toggle("aiRecommendations")}
                />
              </div>
            </div>
          </Card>

          {/* Appearance */}
          <Card className="overflow-hidden">
            <div className="border-b border-gray-100 p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
                  {settings.darkMode ? <Moon size={18} /> : <Sun size={18} />}
                </div>

                <div>
                  <h2 className="font-semibold text-gray-950">Appearance</h2>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Customize your UniSphere experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() =>
                    setSettings((previous) => ({
                      ...previous,
                      darkMode: false,
                    }))
                  }
                  className={[
                    "flex items-center gap-3 rounded-xl border p-4 text-left transition",
                    !settings.darkMode
                      ? "border-indigo-200 bg-indigo-50/50"
                      : "border-gray-200 hover:bg-gray-50",
                  ].join(" ")}
                >
                  <Sun
                    size={18}
                    className={
                      !settings.darkMode ? "text-indigo-600" : "text-gray-400"
                    }
                  />

                  <div>
                    <p className="text-sm font-semibold text-gray-900">Light</p>
                    <p className="text-[11px] text-gray-400">
                      Default appearance
                    </p>
                  </div>

                  {!settings.darkMode && (
                    <Check size={16} className="ml-auto text-indigo-600" />
                  )}
                </button>

                <button
                  onClick={() =>
                    setSettings((previous) => ({
                      ...previous,
                      darkMode: true,
                    }))
                  }
                  className={[
                    "flex items-center gap-3 rounded-xl border p-4 text-left transition",
                    settings.darkMode
                      ? "border-indigo-200 bg-indigo-50/50"
                      : "border-gray-200 hover:bg-gray-50",
                  ].join(" ")}
                >
                  <Moon
                    size={18}
                    className={
                      settings.darkMode ? "text-indigo-600" : "text-gray-400"
                    }
                  />

                  <div>
                    <p className="text-sm font-semibold text-gray-900">Dark</p>
                    <p className="text-[11px] text-gray-400">Coming soon</p>
                  </div>

                  {settings.darkMode && (
                    <Check size={16} className="ml-auto text-indigo-600" />
                  )}
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Security */}
          <Card className="overflow-hidden">
            <div className="border-b border-gray-100 p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Lock size={18} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-950">Security</h2>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Protect your account.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Two-factor authentication
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-400">
                      Add an extra layer of security to your account.
                    </p>
                  </div>

                  <Toggle
                    enabled={settings.twoFactor}
                    onChange={() => toggle("twoFactor")}
                  />
                </div>

                <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-amber-600">
                  <ShieldCheck size={14} />
                  {settings.twoFactor
                    ? "2FA is enabled"
                    : "Recommended for your account"}
                </div>
              </div>

              <button className="mt-4 flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                <span>Change password</span>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            </div>
          </Card>

          {/* Sessions */}
          <Card className="overflow-hidden">
            <div className="border-b border-gray-100 p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <Monitor size={18} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-950">
                    Active Sessions
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Devices currently signed into your account.
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {sessions.map((session) => {
                const Icon = session.icon;

                return (
                  <div key={session.id} className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gray-100 text-gray-500">
                        <Icon size={16} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {session.device}
                          </p>

                          {session.current && (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-600">
                              Current
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-[11px] text-gray-400">
                          {session.browser}
                        </p>

                        <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400">
                          <MapPin size={12} />
                          {session.location}
                        </div>

                        <p className="mt-1 text-[10px] text-gray-400">
                          {session.time}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-100 p-4">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50">
                <LogOut size={14} />
                Sign out all other sessions
              </button>
            </div>
          </Card>

          {/* Language */}
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gray-100 text-gray-500">
                <Globe size={18} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Language</p>
                <p className="mt-1 text-xs text-gray-400">
                  Choose your preferred language.
                </p>
              </div>

              <select className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 outline-none focus:border-indigo-400">
                <option>English</option>
                <option>Urdu</option>
              </select>
            </div>
          </Card>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-red-100 text-red-600">
                <Trash2 size={16} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-red-900">
                  Danger Zone
                </h3>

                <p className="mt-1 text-xs leading-5 text-red-600/70">
                  Account deletion is permanently destructive and requires
                  university verification.
                </p>

                <button className="mt-4 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50">
                  Request Account Deletion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backend note */}
      <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-100 text-indigo-600">
            <ShieldCheck size={16} />
          </div>

          <div>
            <p className="text-sm font-semibold text-indigo-950">
              Backend-ready settings architecture
            </p>

            <p className="mt-1 text-xs leading-5 text-indigo-700/70">
              These controls currently use local state. During backend
              integration, they will connect to user settings, notification
              preferences, security settings and session APIs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
