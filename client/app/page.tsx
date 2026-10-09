import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { homeForRole } from "@/lib/auth/roles";

export default async function Home() {
  const session = await auth();
  if (session?.user?.role) {
    redirect(homeForRole(session.user.role));
  }
  redirect("/login");
}
