import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/models", () => ({
  RollNumberCounter: {
    findOneAndUpdate: vi.fn(),
  },
  Student: {
    create: vi.fn(),
  },
}));

import {
  formatRollNumber,
  nextRollNumber,
  createStudentWithRollNumber,
} from "@/lib/roll-number";
import { RollNumberCounter, Student } from "@/lib/models";

const mockCounter = vi.mocked(RollNumberCounter);
const mockStudent = vi.mocked(Student);

const DEPARTMENT_ID = "222222222222222222222222";
const USER_ID = "333333333333333333333333";

describe("formatRollNumber", () => {
  it("formats as CODE-YEAR-SEQ with a zero-padded sequence", () => {
    expect(formatRollNumber("CS", 2026, 1)).toBe("CS-2026-001");
    expect(formatRollNumber("CS", 2026, 42)).toBe("CS-2026-042");
    expect(formatRollNumber("CS", 2026, 999)).toBe("CS-2026-999");
  });

  it("uppercases the code and strips whitespace", () => {
    expect(formatRollNumber("se", 2026, 1)).toBe("SE-2026-001");
    expect(formatRollNumber("Software Engineering", 2026, 2)).toBe(
      "SOFTWAREENGINEERING-2026-002"
    );
  });
});

describe("nextRollNumber", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the formatted sequence from the counter", async () => {
    (mockCounter.findOneAndUpdate as ReturnType<typeof vi.fn>).mockResolvedValue({
      seq: 7,
    });

    const rollNo = await nextRollNumber(DEPARTMENT_ID as any, "CS", 2026);
    expect(rollNo).toBe("CS-2026-007");
    expect(mockCounter.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: DEPARTMENT_ID },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
  });

  it("uses the current year by default", async () => {
    (mockCounter.findOneAndUpdate as ReturnType<typeof vi.fn>).mockResolvedValue({
      seq: 1,
    });
    const year = new Date().getFullYear();
    const rollNo = await nextRollNumber(DEPARTMENT_ID as any, "CS");
    expect(rollNo).toBe(`CS-${year}-001`);
  });

  it("returns distinct roll numbers for concurrent creations in the same department", async () => {
    let seq = 0;
    (mockCounter.findOneAndUpdate as ReturnType<typeof vi.fn>).mockImplementation(
      async () => ({ seq: ++seq })
    );

    const [first, second] = await Promise.all([
      nextRollNumber(DEPARTMENT_ID as any, "CS", 2026),
      nextRollNumber(DEPARTMENT_ID as any, "CS", 2026),
    ]);

    expect(first).not.toBe(second);
    expect([first, second]).toContain("CS-2026-001");
    expect([first, second]).toContain("CS-2026-002");
  });
});

describe("createStudentWithRollNumber", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates the student profile with a generated roll number", async () => {
    (mockCounter.findOneAndUpdate as ReturnType<typeof vi.fn>).mockResolvedValue({
      seq: 1,
    });
    (mockStudent.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      _id: "student-id",
    });

    const result = await createStudentWithRollNumber(
      USER_ID as any,
      DEPARTMENT_ID as any,
      "CS",
      "Computer Science",
      3,
      2026
    );

    expect(result).toEqual({ studentId: "student-id", rollNo: "CS-2026-001" });
    expect(mockStudent.create).toHaveBeenCalledWith({
      userId: USER_ID,
      rollNo: "CS-2026-001",
      department: "Computer Science",
      departmentId: DEPARTMENT_ID,
      semester: 3,
    });
  });

  it("retries with the next sequence when the roll number collides", async () => {
    (mockCounter.findOneAndUpdate as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ seq: 1 })
      .mockResolvedValueOnce({ seq: 2 });
    (mockStudent.create as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce({ code: 11000 })
      .mockResolvedValueOnce({ _id: "student-id" });

    const result = await createStudentWithRollNumber(
      USER_ID as any,
      DEPARTMENT_ID as any,
      "CS",
      "Computer Science",
      3,
      2026
    );

    expect(result.rollNo).toBe("CS-2026-002");
    expect(mockStudent.create).toHaveBeenCalledTimes(2);
  });

  it("throws when a unique roll number cannot be generated", async () => {
    (mockCounter.findOneAndUpdate as ReturnType<typeof vi.fn>).mockResolvedValue({
      seq: 0,
    });
    (mockStudent.create as ReturnType<typeof vi.fn>).mockRejectedValue({
      code: 11000,
    });

    await expect(
      createStudentWithRollNumber(
        USER_ID as any,
        DEPARTMENT_ID as any,
        "CS",
        "Computer Science",
        3,
        2026
      )
    ).rejects.toThrow("Could not generate a unique roll number");
  });

  it("rethrows non-duplicate-key errors", async () => {
    (mockCounter.findOneAndUpdate as ReturnType<typeof vi.fn>).mockResolvedValue({
      seq: 1,
    });
    (mockStudent.create as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("validation failed")
    );

    await expect(
      createStudentWithRollNumber(
        USER_ID as any,
        DEPARTMENT_ID as any,
        "CS",
        "Computer Science",
        3,
        2026
      )
    ).rejects.toThrow("validation failed");
  });
});