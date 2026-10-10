import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse, serverErrorResponse } from "@/lib/api/response";
import { z } from "zod";
import { Types } from "mongoose";

const updateSelfSchema = z
  .object({
    phone: z.string().trim().optional(),
    photo: z.string().url().optional(),
  })
  .strict();

const updateAdminSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    email: z.email().optional(),
    role: z.enum(["student", "teacher", "admin"]).optional(),
    phone: z.string().trim().optional(),
    photo: z.string().url().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

async function validateId(id: string) {
  return Types.ObjectId.isValid(id);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const { id } = await params;
    if (!(await validateId(id))) return errorResponse("Invalid user ID", 400);

    const sessionUser = session.user as { id: string; role: string };
    const isSelf = sessionUser.id === id;
    const isAdmin = sessionUser.role === "admin";

    if (!isSelf && !isAdmin) return forbiddenResponse("Access denied");

    await dbConnect();
    const user = await User.findById(id).select("-password").lean();
    if (!user) return notFoundResponse("User not found");

    return successResponse({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      photo: user.photo,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("GET /api/users/:id error:", error);
    return serverErrorResponse();
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const { id } = await params;
    if (!(await validateId(id))) return errorResponse("Invalid user ID", 400);

    const sessionUser = session.user as { id: string; role: string };
    const isSelf = sessionUser.id === id;
    const isAdmin = sessionUser.role === "admin";

    if (!isSelf && !isAdmin) return forbiddenResponse("Access denied");

    const body = await req.json();
    const schema = isAdmin ? updateAdminSchema : updateSelfSchema;
    const parsed = schema.safeParse(body);
    if (!parsed.success) return errorResponse("Invalid input", 400);

    await dbConnect();

    if (isAdmin) {
      const adminData = parsed.data as { email?: string };
      if (adminData.email) {
        const existing = await User.findOne({ email: adminData.email, _id: { $ne: id } });
        if (existing) return errorResponse("Email already in use", 409);
      }
    }

    const updateData = { ...parsed.data };
    if (isAdmin) {
      const adminData = updateData as { email?: string };
      if (adminData.email) adminData.email = adminData.email.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true, select: "-password" }).lean();
    if (!user) return notFoundResponse("User not found");

    return successResponse({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      photo: user.photo,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("PUT /api/users/:id error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (role !== "admin") return forbiddenResponse("Admin only");

    const { id } = await params;
    if (!(await validateId(id))) return errorResponse("Invalid user ID", 400);

    await dbConnect();

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true, select: "-password" }
    ).lean();

    if (!user) return notFoundResponse("User not found");

    return successResponse({ message: "User deactivated successfully" });
  } catch (error) {
    console.error("DELETE /api/users/:id error:", error);
    return serverErrorResponse();
  }
}
