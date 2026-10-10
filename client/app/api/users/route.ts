import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models";
import { successResponse, errorResponse, forbiddenResponse, serverErrorResponse } from "@/lib/api/response";
import { z } from "zod";

const querySchema = z.object({
  role: z.enum(["student", "teacher", "admin"]).optional(),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (role !== "admin") return forbiddenResponse("Admin only");

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({ role: searchParams.get("role") || undefined });
    if (!parsed.success) return errorResponse("Invalid query", 400);

    await dbConnect();

    const filter = parsed.data.role ? { role: parsed.data.role } : {};
    const users = await User.find(filter).select("-password").lean();

    return successResponse(users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      photo: u.photo,
      isActive: u.isActive,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    })));
  } catch (error) {
    console.error("GET /api/users error:", error);
    return serverErrorResponse();
  }
}
