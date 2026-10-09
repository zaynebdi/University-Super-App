import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Sign in | UniStride",
  description: "Sign in to your UniStride account",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-white">
            <GraduationCap className="h-6 w-6" />
          </span>
          <h1 className="text-xl font-semibold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500">Sign in to UniStride to continue</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
