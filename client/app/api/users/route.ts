import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { User, Student, Teacher } from "@/lib/models";
import { getAdminScope } from "@/lib/admin-scope";
import { successResponse, errorResponse, forbiddenResponse, serverErrorResponse } from "@/lib/api/response";
import { z } from "zod";
import { Types } from "mongoose";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const querySchema = z.object({
  role: z.enum(["student", "teacher", "admin"]).optional(),
  search: z.string().trim().max(100).optional(),
  department: z.string().regex(objectIdRegex).optional(),
  isActive: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

function escapeRegex(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface LeanUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: string;
  phone?: string;
  photo?: string;
  isActive: boolean;
  assignedDepartment?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

interface LeanStudent {
  userId: Types.ObjectId;
  rollNo: string;
  department?: string;
  departmentId?: Types.ObjectId | null;
  fieldId?: Types.ObjectId | null;
  semester: number;
}

interface LeanTeacher {
  userId: Types.ObjectId;
  department?: string;
  departmentId?: Types.ObjectId | null;
  designation?: string;
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const scope = getAdminScope(session);
    if (!scope) return forbiddenResponse("Admin only");

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      role: searchParams.get("role") || undefined,
      search: searchParams.get("search") || undefined,
      department: searchParams.get("department") || undefined,
      isActive: searchParams.get("isActive") || undefined,
      page: searchParams.get("page") || undefined,
      pageSize: searchParams.get("pageSize") || undefined,
    });
    if (!parsed.success) return errorResponse("Invalid query", 400);

    let role = parsed.data.role;
    if (scope.assignedDepartment && role === "admin") {
      return forbiddenResponse("Department admins cannot view admins");
    }
    if (scope.assignedDepartment) {
      // Department admins see students + teachers of their own department only.
      role = role ?? undefined;
    }

    if (parsed.data.department && role === "admin") {
      return errorResponse("Admins do not have an assigned department", 400);
    }

    let departmentFilter = parsed.data.department;
    if (scope.assignedDepartment) {
      if (departmentFilter && departmentFilter !== scope.assignedDepartment) {
        return forbiddenResponse("You can only view your own department");
      }
      departmentFilter = scope.assignedDepartment;
    }

    await dbConnect();

    const filter: Record<string, unknown> = {};
    if (scope.assignedDepartment) {
      filter.role = role ? role : { $in: ["student", "teacher"] };
    } else if (role) {
      filter.role = role;
    }

    if (parsed.data.isActive !== undefined) {
      filter.isActive = parsed.data.isActive === "true";
    }

    const and: Record<string, unknown>[] = [];

    if (parsed.data.search) {
      const rx = { $regex: escapeRegex(parsed.data.search), $options: "i" };
      const or: Record<string, unknown>[] = [{ name: rx }, { email: rx }];
      const studentIds = (await Student.find({ rollNo: rx })
        .select("userId")
        .lean()) as unknown as { userId: Types.ObjectId }[];
      if (studentIds.length > 0) {
        or.push({ _id: { $in: studentIds.map((s) => s.userId) } });
      }
      and.push({ $or: or });
    }

    const rolesToCheck = role ? [role] : ["student", "teacher"];
    if (departmentFilter) {
      const ids: Types.ObjectId[] = [];
      if (rolesToCheck.includes("student")) {
        const students = (await Student.find({ departmentId: departmentFilter })
          .select("userId")
          .lean()) as unknown as { userId: Types.ObjectId }[];
        ids.push(...students.map((s) => s.userId));
      }
      if (rolesToCheck.includes("teacher")) {
        const teachers = (await Teacher.find({ departmentId: departmentFilter })
          .select("userId")
          .lean()) as unknown as { userId: Types.ObjectId }[];
        ids.push(...teachers.map((t) => t.userId));
      }
      if (ids.length > 0) and.push({ _id: { $in: ids } });
      else and.push({ _id: { $in: [] } });
    }

    if (and.length > 0) filter.$and = and;

    const total = await User.countDocuments(filter);

    const users = (await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((parsed.data.page - 1) * parsed.data.pageSize)
      .limit(parsed.data.pageSize)
      .select("-password")
      .lean()) as unknown as LeanUser[];

    const userIds = users.map((u) => u._id);
    const [students, teachers] = await Promise.all([
      Student.find({ userId: { $in: userIds } }).lean() as unknown as Promise<LeanStudent[]>,
      Teacher.find({ userId: { $in: userIds } }).lean() as unknown as Promise<LeanTeacher[]>,
    ]);

    const studentByUser = new Map<string, LeanStudent>();
    for (const s of students) studentByUser.set(s.userId.toString(), s);
    const teacherByUser = new Map<string, LeanTeacher>();
    for (const t of teachers) teacherByUser.set(t.userId.toString(), t);

    const rows = users.map((u) => {
      const studentProfile = studentByUser.get(u._id.toString());
      const teacherProfile = teacherByUser.get(u._id.toString());
      const profile = studentProfile ?? teacherProfile;
      return {
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone,
        photo: u.photo,
        isActive: u.isActive,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        departmentId: profile?.departmentId ? profile.departmentId.toString() : null,
        department: profile?.department ?? "",
        fieldId: studentProfile?.fieldId ? studentProfile.fieldId.toString() : null,
        rollNo: studentProfile?.rollNo,
        semester: studentProfile?.semester,
        designation: teacherProfile?.designation,
        assignedDepartmentId: u.assignedDepartment ? u.assignedDepartment.toString() : null,
      };
    });

    return successResponse({
      users: rows,
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / parsed.data.pageSize)),
    });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return serverErrorResponse();
  }
}