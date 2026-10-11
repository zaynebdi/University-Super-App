import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { User, Student, Teacher } from "@/lib/models";
import { getAdminScope } from "@/lib/admin-scope";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, conflictResponse, notFoundResponse, serverErrorResponse } from "@/lib/api/response";
import { z } from "zod";
import { Types } from "mongoose";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

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
    assignedDepartment: z.string().regex(objectIdRegex).nullable().optional(),
    phone: z.string().trim().optional(),
    photo: z.string().url().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

async function validateId(id: string) {
  return Types.ObjectId.isValid(id);
}

interface LeanUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: string;
  assignedDepartment?: Types.ObjectId | null;
  phone?: string;
  photo?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toUserDTO(user: LeanUser) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    photo: user.photo,
    isActive: user.isActive,
    assignedDepartmentId: user.assignedDepartment ? user.assignedDepartment.toString() : null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function isSuper(role: string, assignedDepartment: Types.ObjectId | null | undefined): boolean {
  return role === "admin" && !assignedDepartment;
}

async function profileDepartment(userId: Types.ObjectId): Promise<string | null> {
  const [student, teacher] = await Promise.all([
    Student.findOne({ userId }).select("departmentId").lean() as unknown as Promise<{ departmentId?: Types.ObjectId | null } | null>,
    Teacher.findOne({ userId }).select("departmentId").lean() as unknown as Promise<{ departmentId?: Types.ObjectId | null } | null>,
  ]);
  const profile = student ?? teacher;
  return profile?.departmentId ? profile.departmentId.toString() : null;
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
    const scope = getAdminScope(session);
    const isSelf = sessionUser.id === id;
    if (!isSelf && !scope) return forbiddenResponse("Access denied");

    await dbConnect();
    const user = (await User.findById(id).select("-password").lean()) as unknown as LeanUser | null;
    if (!user) return notFoundResponse("User not found");

    if (!isSelf && scope?.assignedDepartment) {
      const departmentId = await profileDepartment(user._id);
      if (user.role === "admin" || !departmentId || departmentId !== scope.assignedDepartment) {
        return forbiddenResponse("You can only view users of your own department");
      }
    }

    return successResponse(toUserDTO(user));
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
    const scope = getAdminScope(session);
    const isSelf = sessionUser.id === id;
    const isAdmin = !!scope;

    if (!isSelf && !isAdmin) return forbiddenResponse("Access denied");

    const body = await req.json().catch(() => null);
    const schema = isAdmin ? updateAdminSchema : updateSelfSchema;
    const parsed = schema.safeParse(body);
    if (!parsed.success) return errorResponse("Invalid input", 400);

    await dbConnect();

    const target = (await User.findById(id).select("-password").lean()) as unknown as LeanUser | null;
    if (!target) return notFoundResponse("User not found");

    if (isAdmin) {
      const adminData = parsed.data as {
        email?: string;
        role?: string;
        assignedDepartment?: string | null;
        isActive?: boolean;
      };

      if (scope!.assignedDepartment) {
        // Department admins may only edit students/teachers of their own department.
        if (target.role === "admin") {
          return forbiddenResponse("You cannot modify admin accounts");
        }
        const departmentId = await profileDepartment(target._id);
        if (!departmentId || departmentId !== scope!.assignedDepartment) {
          return forbiddenResponse("You can only edit users of your own department");
        }
        if (adminData.role !== undefined || adminData.assignedDepartment !== undefined) {
          return errorResponse("Department admins cannot change roles or department scope", 400);
        }
      }

      if (isSelf) {
        if (adminData.isActive === false) {
          return errorResponse("You cannot deactivate your own account", 400);
        }
        if (adminData.role !== undefined && adminData.role !== target.role) {
          return errorResponse("You cannot change your own role", 400);
        }
        if (adminData.assignedDepartment !== undefined) {
          const next = adminData.assignedDepartment ?? null;
          const current = target.assignedDepartment ? target.assignedDepartment.toString() : null;
          if (next !== current) {
            return errorResponse("You cannot change your own department scope", 400);
          }
        }
      }

      // Protecting the last active super admin from deactivation/demotion.
      if (
        target.isActive &&
        isSuper(target.role, target.assignedDepartment) &&
        (adminData.isActive === false ||
          (adminData.role !== undefined && adminData.role !== "admin") ||
          (adminData.assignedDepartment !== undefined &&
            adminData.assignedDepartment !== null))
      ) {
        const superAdminCount = (await User.countDocuments({
          role: "admin",
          isActive: true,
          $or: [{ assignedDepartment: { $exists: false } }, { assignedDepartment: null }],
        })) as number;
        if (superAdminCount <= 1) {
          return conflictResponse("You cannot deactivate or demote the last active super admin");
        }
      }

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

    const updated = (await User.findByIdAndUpdate(id, updateData, { new: true })
      .select("-password")
      .lean()) as unknown as LeanUser;

    return successResponse(toUserDTO(updated));
  } catch (error) {
    if (typeof error === "object" && error !== null && (error as { code?: number }).code === 11000) {
      return errorResponse("Email already in use", 409);
    }
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
    const scope = getAdminScope(session);
    if (!scope) return forbiddenResponse("Admin only");

    const { id } = await params;
    if (!(await validateId(id))) return errorResponse("Invalid user ID", 400);

    if (scope.userId === id) {
      return errorResponse("You cannot deactivate your own account", 400);
    }

    await dbConnect();

    const target = (await User.findById(id).select("-password").lean()) as unknown as LeanUser | null;
    if (!target) return notFoundResponse("User not found");

    if (scope.assignedDepartment) {
      if (target.role === "admin") {
        return forbiddenResponse("You cannot deactivate admin accounts");
      }
      const departmentId = await profileDepartment(target._id);
      if (!departmentId || departmentId !== scope.assignedDepartment) {
        return forbiddenResponse("You can only deactivate users of your own department");
      }
    }

    if (
      target.isActive &&
      isSuper(target.role, target.assignedDepartment)
    ) {
      const superAdminCount = (await User.countDocuments({
        role: "admin",
        isActive: true,
        $or: [{ assignedDepartment: { $exists: false } }, { assignedDepartment: null }],
      })) as number;
      if (superAdminCount <= 1) {
        return conflictResponse("You cannot deactivate the last active super admin");
      }
    }

    await User.findByIdAndUpdate(id, { isActive: false });

    return successResponse({ message: "User deactivated successfully" });
  } catch (error) {
    console.error("DELETE /api/users/:id error:", error);
    return serverErrorResponse();
  }
}