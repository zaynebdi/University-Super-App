import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/models", () => ({
  Field: { findById: vi.fn() },
  Course: { find: vi.fn() },
  Student: { find: vi.fn() },
  Enrollment: { updateOne: vi.fn() },
}));

import {
  enrollFieldStudents,
  FieldNotFoundError,
  InactiveFieldError,
  StudentNotFoundError,
} from "@/lib/enroll-field";
import { Field, Course, Student, Enrollment } from "@/lib/models";

const mockField = vi.mocked(Field);
const mockCourse = vi.mocked(Course);
const mockStudent = vi.mocked(Student);
const mockEnrollment = vi.mocked(Enrollment);

const FIELD_ID = "111111111111111111111111";
const S1 = "aaaaaaaaaaaaaaaaaaaaaaaa";
const S2 = "bbbbbbbbbbbbbbbbbbbbbbbb";
const S3 = "cccccccccccccccccccccccc";
const C1 = "dddddddddddddddddddddddd";
const C2 = "eeeeeeeeeeeeeeeeeeeeeeee";
const C3 = "ffffffffffffffffffffffff";

function studentsChain(value: unknown) {
  return {
    select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(value) }),
  } as any;
}

describe("enrollFieldStudents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws FieldNotFoundError when the field does not exist", async () => {
    mockField.findById.mockReturnValue({ lean: vi.fn().mockResolvedValue(null) } as any);
    await expect(enrollFieldStudents(FIELD_ID, [S1])).rejects.toBeInstanceOf(
      FieldNotFoundError
    );
  });

  it("throws InactiveFieldError when the field is inactive", async () => {
    mockField.findById.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: FIELD_ID, isActive: false }),
    } as any);
    await expect(enrollFieldStudents(FIELD_ID, [S1])).rejects.toBeInstanceOf(
      InactiveFieldError
    );
  });

  it("throws StudentNotFoundError when no students match", async () => {
    mockField.findById.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: FIELD_ID, isActive: true }),
    } as any);
    mockStudent.find.mockReturnValue(studentsChain([]));

    await expect(enrollFieldStudents(FIELD_ID, [S1])).rejects.toBeInstanceOf(
      StudentNotFoundError
    );
    expect(mockEnrollment.updateOne).not.toHaveBeenCalled();
  });

  it("enrolls students only in courses of their own semester", async () => {
    mockField.findById.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: FIELD_ID, isActive: true }),
    } as any);
    mockStudent.find.mockReturnValue(
      studentsChain([
        { _id: S1, semester: 3 },
        { _id: S2, semester: 8 },
      ])
    );
    mockCourse.find.mockReturnValue(
      studentsChain([
        { _id: C1, semester: 3 },
        { _id: C2, semester: 3 },
        { _id: C3, semester: 8 },
      ])
    );
    mockEnrollment.updateOne.mockResolvedValue({ upsertedCount: 1 } as never);

    const result = await enrollFieldStudents(FIELD_ID, [S1, S2]);
    expect(result).toEqual({ enrolled: 3, alreadyEnrolled: 0 });

    const called: unknown[] = [];
    const updateCalls = mockEnrollment.updateOne.mock.calls as unknown as [
      { studentId: string; courseId: string }
    ][];
    for (const call of updateCalls) {
      called.push({ studentId: call[0].studentId, courseId: call[0].courseId });
    }
    expect(called).toEqual([
      { studentId: S1, courseId: C1 },
      { studentId: S1, courseId: C2 },
      { studentId: S2, courseId: C3 },
    ]);
    // Never cross-semester enrollments.
    expect(mockEnrollment.updateOne).not.toHaveBeenCalledWith(
      { studentId: S1, courseId: C3 },
      expect.anything(),
      expect.anything()
    );
  });

  it("counts existing enrollments as alreadyEnrolled", async () => {
    mockField.findById.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: FIELD_ID, isActive: true }),
    } as any);
    mockStudent.find.mockReturnValue(studentsChain([{ _id: S1, semester: 3 }]));
    mockCourse.find.mockReturnValue(
      studentsChain([
        { _id: C1, semester: 3 },
        { _id: C2, semester: 3 },
      ])
    );
    mockEnrollment.updateOne
      .mockResolvedValueOnce({ upsertedCount: 1 } as never)
      .mockResolvedValueOnce({ upsertedCount: 0 } as never);

    const result = await enrollFieldStudents(FIELD_ID, [S1]);
    expect(result).toEqual({ enrolled: 1, alreadyEnrolled: 1 });
    expect(mockEnrollment.updateOne).toHaveBeenCalledWith(
      { studentId: S1, courseId: C1 },
      expect.objectContaining({ $setOnInsert: expect.objectContaining({ studentId: S1 }) }),
      { upsert: true }
    );
  });

  it("deduplicates repeated student ids so nothing is double counted", async () => {
    mockField.findById.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: FIELD_ID, isActive: true }),
    } as any);
    mockStudent.find.mockReturnValue(studentsChain([{ _id: S1, semester: 1 }]));
    mockCourse.find.mockReturnValue(studentsChain([{ _id: C1, semester: 1 }]));
    mockEnrollment.updateOne.mockResolvedValue({ upsertedCount: 1 } as never);

    const result = await enrollFieldStudents(FIELD_ID, [S1, S1, S1]);
    expect(result).toEqual({ enrolled: 1, alreadyEnrolled: 0 });
    expect(mockEnrollment.updateOne).toHaveBeenCalledTimes(1);
    expect(mockStudent.find).toHaveBeenCalledWith({ _id: { $in: [S1] } });
  });

  it("skips unknown student ids (not in the database)", async () => {
    mockField.findById.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: FIELD_ID, isActive: true }),
    } as any);
    mockStudent.find.mockReturnValue(studentsChain([{ _id: S1, semester: 2 }]));
    mockCourse.find.mockReturnValue(studentsChain([{ _id: C2, semester: 2 }]));
    mockEnrollment.updateOne.mockResolvedValue({ upsertedCount: 1 } as never);

    const result = await enrollFieldStudents(FIELD_ID, [S1, S3]);
    expect(result).toEqual({ enrolled: 1, alreadyEnrolled: 0 });
    expect(mockEnrollment.updateOne).toHaveBeenCalledTimes(1);
  });
});