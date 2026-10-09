import { auth } from "@/auth";
import { ok, unauthorized } from "@/lib/api/response";

export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorized();
  return ok(session.user);
}
