import { auth } from "@/lib/auth-server";
import { successResponse, unauthorizedResponse } from "@/lib/api/response";

export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  return successResponse({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    assignedDepartment: session.user.assignedDepartment ?? null,
  });
}