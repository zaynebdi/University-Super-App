import { Field, Course, Student, Enrollment } from "@/lib/models";
import { Types } from "mongoose";

export class FieldNotFoundError extends Error {
  constructor(message = "Field not found") {
    super(message);
    this.name = "FieldNotFoundError";
  }
}

export class InactiveFieldError extends Error {
  constructor(message = "This field is inactive") {
    super(message);
    this.name = "InactiveFieldError";
  }
}

export class StudentNotFoundError extends Error {
  constructor(message = "No matching students found") {
    super(message);
    this.name = "StudentNotFoundError";
  }
}

/**
 * Enrolls students in every active course of a field, filtered by the
 * student's semester (courses carry a semester). Existing enrollments are
 * skipped — the unique (studentId, courseId) index plus the $setOnInsert
 * upsert guarantee no duplicates, even when called concurrently.
 *
 * Returns { enrolled, alreadyEnrolled } counts for a summary like
 * "Enrolled in 6 courses, 2 already enrolled".
 */
export async function enrollFieldStudents(
  fieldId: Types.ObjectId | string,
  studentIds: (Types.ObjectId | string)[]
): Promise<{ enrolled: number; alreadyEnrolled: number }> {
  const field = await Field.findById(fieldId).lean();
  if (!field) throw new FieldNotFoundError();
  if (field.isActive === false) throw new InactiveFieldError();

  // Deduplicate so a repeated id in the request never double-counts.
  const ids = [...new Set(studentIds.map((id) => id.toString()))];

  const students = (await Student.find({ _id: { $in: ids } })
    .select("semester")
    .lean()) as unknown as { _id: Types.ObjectId; semester: number }[];
  if (students.length === 0) throw new StudentNotFoundError();

  const studentBySemester = new Map<string, number>();
  for (const student of students) {
    studentBySemester.set(student._id.toString(), student.semester);
  }

  const courses = (await Course.find({ fieldId: field._id })
    .select("semester")
    .lean()) as unknown as { _id: Types.ObjectId; semester: number }[];

  const coursesBySemester = new Map<number, string[]>();
  for (const course of courses) {
    const list = coursesBySemester.get(course.semester) ?? [];
    list.push(course._id.toString());
    coursesBySemester.set(course.semester, list);
  }

  let enrolled = 0;
  let alreadyEnrolled = 0;

  for (const id of ids) {
    const semester = studentBySemester.get(id);
    if (semester === undefined) continue;
    const semesterCourses = coursesBySemester.get(semester) ?? [];
    for (const courseId of semesterCourses) {
      const result = await Enrollment.updateOne(
        { studentId: id, courseId },
        { $setOnInsert: { studentId: id, courseId, enrolledAt: new Date() } },
        { upsert: true }
      );
      if (result.upsertedCount === 1) {
        enrolled += 1;
      } else {
        alreadyEnrolled += 1;
      }
    }
  }

  return { enrolled, alreadyEnrolled };
}