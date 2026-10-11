import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Department, Field, Course } from "@/lib/models";
import { getAdminScope } from "@/lib/admin-scope";
import {
  successResponse,
  forbiddenResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { buildAcademicSeedData } from "@/scripts/academic-data";
import { Types } from "mongoose";

interface Counts {
  created: number;
  existed: number;
}

type AnyModel = {
  findOne: (
    filter: Record<string, unknown>
  ) => {
    collation: (
      options: Record<string, unknown>
    ) => { lean: () => Promise<unknown> };
  };
  create: (doc: Record<string, unknown>) => Promise<{ _id: Types.ObjectId }>;
};

/**
 * Idempotent upsert by unique code: never overwrites an existing record, never
 * deletes or touches other data. Returns { created, existed }.
 */
async function upsertByCode(
  model: AnyModel,
  filter: Record<string, unknown>,
  data: Record<string, unknown>,
  counts: Counts
) {
  const existing = await model
    .findOne(filter)
    .collation({ locale: "en", strength: 2 })
    .lean();
  if (existing) {
    counts.existed += 1;
    return existing as { _id: Types.ObjectId };
  }
  try {
    const created = await model.create(data);
    counts.created += 1;
    return created;
  } catch (error) {
    // A concurrent insert won the race — treat it as already existing.
    if (
      typeof error === "object" &&
      error !== null &&
      (error as { code?: number }).code === 11000
    ) {
      counts.existed += 1;
      const winner = await model
        .findOne(filter)
        .collation({ locale: "en", strength: 2 })
        .lean();
      if (!winner) throw error;
      return winner as { _id: Types.ObjectId };
    }
    throw error;
  }
}

export async function POST() {
  try {
    const session = await auth();
    const scope = getAdminScope(session);
    if (!scope) return forbiddenResponse("Admin only");
    if (!scope.isSuper) return forbiddenResponse("Super admin only");

    await dbConnect();

    const { departments, summary } = buildAcademicSeedData();
    const departmentsCounts: Counts = { created: 0, existed: 0 };
    const fieldsCounts: Counts = { created: 0, existed: 0 };
    const coursesCounts: Counts = { created: 0, existed: 0 };

    for (const department of departments) {
      const departmentDoc = await upsertByCode(
        Department as unknown as AnyModel,
        { code: department.code },
        {
          name: department.name,
          code: department.code,
          isActive: true,
        },
        departmentsCounts
      );

      for (const field of department.fields) {
        const fieldDoc = await upsertByCode(
          Field as unknown as AnyModel,
          { code: field.code },
          {
            name: field.name,
            code: field.code,
            departmentId: departmentDoc._id,
            isActive: true,
          },
          fieldsCounts
        );

        for (const course of field.courses) {
          await upsertByCode(
            Course as unknown as AnyModel,
            { code: course.code },
            {
              code: course.code,
              title: course.title,
              teacherId: null,
              departmentId: departmentDoc._id,
              fieldId: fieldDoc._id,
              semester: course.semester,
              creditHours: course.creditHours,
            },
            coursesCounts
          );
        }
      }
    }

    return successResponse({
      created: {
        departments: departmentsCounts.created,
        fields: fieldsCounts.created,
        courses: coursesCounts.created,
      },
      existed: {
        departments: departmentsCounts.existed,
        fields: fieldsCounts.existed,
        courses: coursesCounts.existed,
      },
      total: {
        departments: summary.departmentCount,
        fields: summary.fieldCount,
        courses: summary.courseCount,
      },
    });
  } catch (error) {
    console.error("POST /api/academic-data error:", error);
    return serverErrorResponse();
  }
}