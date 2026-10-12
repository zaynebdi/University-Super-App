import { Types } from "mongoose";
import { RollNumberCounter, Student } from "@/lib/models";

/**
 * Builds a roll number string in the DEPTCODE-YEAR-SEQ format, e.g. "CS-2026-001".
 * The department code is uppercased and stripped of whitespace so it stays a
 * clean prefix, and the sequence is zero-padded to three digits.
 */
export function formatRollNumber(code: string, year: number, seq: number): string {
  const prefix = code
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${prefix}-${year}-${String(seq).padStart(3, "0")}`;
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: number }).code === 11000
  );
}

/**
 * Atomically reserves the next sequence number for a department and returns the
 * formatted roll number. The counter document is keyed by the Department ObjectId
 * and incremented with $inc inside findOneAndUpdate, so concurrent calls in the
 * same department always receive distinct sequence numbers.
 */
export async function nextRollNumber(
  departmentId: Types.ObjectId | string,
  code: string,
  year = new Date().getFullYear()
): Promise<string> {
  const counter = await RollNumberCounter.findOneAndUpdate(
    { _id: departmentId },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return formatRollNumber(code, year, counter.seq);
}

const MAX_ROLL_NUMBER_ATTEMPTS = 5;

/**
 * Creates a student profile with a server-generated roll number. If the roll
 * number collides with an existing one (legacy records or a rare race), the
 * creation is retried with the next sequence value. This keeps the generated
 * numbers unique even when two students are created at the same time.
 */
export async function createStudentWithRollNumber(
  userId: Types.ObjectId,
  departmentId: Types.ObjectId,
  departmentCode: string,
  departmentName: string,
  semester: number,
  year?: number,
  fieldId?: Types.ObjectId | null
): Promise<{ studentId: Types.ObjectId; rollNo: string }> {
  for (let attempt = 0; attempt < MAX_ROLL_NUMBER_ATTEMPTS; attempt++) {
    const rollNo = await nextRollNumber(departmentId, departmentCode, year);
    try {
      const student = await Student.create({
        userId,
        rollNo,
        department: departmentName,
        departmentId,
        ...(fieldId ? { fieldId } : {}),
        semester,
      });
      return { studentId: student._id, rollNo };
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;
      // Roll number already taken — bump the counter and try the next sequence.
    }
  }
  throw new Error("Could not generate a unique roll number");
}