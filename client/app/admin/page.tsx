import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { homeForRole } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "Admin | UniStride",
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect(homeForRole(session.user.role));

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-slate-100 px-4 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Admin console</h1>
      <p className="max-w-md text-sm text-slate-500">
        Signed in as {session.user.email}. The admin dashboard and account management UI land in a
        later phase.
      </p>
    </main>
  );
}
