import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string }).role;
  if (role === "student") redirect("/student/dashboard");
  if (role === "teacher") redirect("/faculty/dashboard");
  redirect("/admin");
}