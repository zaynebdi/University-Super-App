import { describe, it, expect } from "vitest";
import seedData from "@/scripts/academic-data";

interface CourseSeed {
  code: string;
  title: string;
  semester: number;
  creditHours: number;
  teacherId: null;
}
interface FieldSeed {
  name: string;
  code: string;
  courses: CourseSeed[];
}
interface DepartmentSeed {
  name: string;
  code: string;
  fields: FieldSeed[];
}
interface AcademicSeed {
  departments: DepartmentSeed[];
  summary: {
    departmentCount: number;
    fieldCount: number;
    courseCount: number;
    labCourseCount: number;
  };
}

interface AcademicDataModule {
  DEPARTMENTS: DepartmentSeed[];
  SEMESTER_MIN: number;
  SEMESTER_MAX: number;
  THEORY_CREDIT_HOURS: number;
  LAB_CREDIT_HOURS: number;
  semesterForCourse: (index: number, totalCourses: number) => number;
  buildCourseCode: (
    departmentCode: string,
    fieldCode: string,
    index: number
  ) => string;
  buildAcademicSeedData: () => AcademicSeed;
}

const data = seedData as unknown as AcademicDataModule;
const seed = data.buildAcademicSeedData();

/* Expected catalog (Department -> Field -> 6 courses each), matching the spec. */
const EXPECTED_DEPARTMENTS: Array<{ name: string; code: string; fields: string[] }> = [
  {
    name: "Computer Science",
    code: "CS",
    fields: [
      "Software Engineering",
      "Artificial Intelligence",
      "Cyber Security",
      "Information Technology",
    ],
  },
  {
    name: "Electrical Engineering",
    code: "EE",
    fields: ["Power Systems", "Electronics", "Telecommunication"],
  },
  {
    name: "Business Administration",
    code: "BBA",
    fields: ["Marketing", "Finance", "Human Resource Management"],
  },
  {
    name: "Law",
    code: "LAW",
    fields: ["Criminal Law", "Corporate Law", "International Law"],
  },
  {
    name: "Allied Health Sciences",
    code: "AHS",
    fields: ["Nursing", "Medical Laboratory Technology", "Physical Therapy"],
  },
];

/* Courses that must carry 1 credit hour (applied/practical). */
const EXPECTED_LAB_COURSES = new Set([
  // CS — Software Engineering
  "CS-SE-006",
  // CS — Artificial Intelligence
  "CS-AI-002",
  "CS-AI-003",
  "CS-AI-005",
  "CS-AI-006",
  // CS — Cyber Security
  "CS-CYB-002",
  "CS-CYB-004",
  "CS-CYB-005",
  "CS-CYB-006",
  // CS — Information Technology
  "CS-IT-001",
  "CS-IT-002",
  "CS-IT-003",
  "CS-IT-004",
  "CS-IT-005",
  "CS-IT-006",
  // EE — Power Systems
  "EE-PS-001",
  "EE-PS-002",
  "EE-PS-004",
  // EE — Electronics
  "EE-ELE-001",
  "EE-ELE-002",
  "EE-ELE-003",
  "EE-ELE-004",
  "EE-ELE-005",
  "EE-ELE-006",
  // EE — Telecommunication
  "EE-TC-003",
  // BBA — Marketing
  "BBA-MKT-005",
  // BBA — Finance
  "BBA-FIN-003",
  // BBA — Human Resource Management
  "BBA-HRM-004",
  // LAW — Criminal Law
  "LAW-CRIM-006",
  // AHS — Nursing
  "AHS-NUR-001",
  "AHS-NUR-002",
  // AHS — Medical Laboratory Technology
  "AHS-MLT-001",
  "AHS-MLT-002",
  "AHS-MLT-003",
  "AHS-MLT-004",
  "AHS-MLT-005",
  "AHS-MLT-006",
  // AHS — Physical Therapy
  "AHS-PT-001",
  "AHS-PT-003",
  "AHS-PT-004",
  "AHS-PT-005",
  "AHS-PT-006",
]);

describe("academic-data builder", () => {
  it("builds 5 departments, 16 fields and 96 courses", () => {
    expect(seed.summary.departmentCount).toBe(5);
    expect(seed.summary.fieldCount).toBe(16);
    expect(seed.summary.courseCount).toBe(96);
    expect(seed.departments).toHaveLength(5);

    const fields = seed.departments.flatMap((d) => d.fields);
    expect(fields).toHaveLength(16);
    expect(fields.every((f) => f.courses.length > 0)).toBe(true);
    expect(fields.flatMap((f) => f.courses)).toHaveLength(96);
  });

  it("matches the expected department/field catalog exactly, in order", () => {
    const actual = seed.departments.map((d) => ({
      name: d.name,
      code: d.code,
      fields: d.fields.map((f) => f.name),
    }));
    expect(actual).toEqual(EXPECTED_DEPARTMENTS);
  });

  it("keeps every code unique and upper-cased", () => {
    expect(seed.departments.map((d) => d.code)).toHaveLength(
      new Set(seed.departments.map((d) => d.code)).size
    );

    const fieldCodes = seed.departments.flatMap((d) => d.fields.map((f) => f.code));
    expect(fieldCodes).toHaveLength(new Set(fieldCodes).size);

    const courseCodes = seed.departments.flatMap((d) =>
      d.fields.flatMap((f) => f.courses.map((c) => c.code))
    );
    expect(courseCodes).toHaveLength(new Set(courseCodes).size);
    expect(courseCodes.every((c) => c === c.toUpperCase())).toBe(true);
  });

  it("formats course codes as DEPTCODE-FIELDCODE-NNN sequential per field", () => {
    for (const department of seed.departments) {
      for (const field of department.fields) {
        field.courses.forEach((course, index) => {
          const expectedCode = `${department.code}-${field.code}-${String(
            index + 1
          ).padStart(3, "0")}`;
          expect(course.code).toBe(expectedCode);
          expect(course.code).toMatch(
            /^[A-Z]{2,4}-[A-Z]{2,4}-\d{3}$/
          );
        });
        expect(field.courses).toHaveLength(6);
      }
    }
  });

  it("assigns 3 credit hours to theory courses and 1 to lab courses", () => {
    const courseCodes = seed.departments.flatMap((d) =>
      d.fields.flatMap((f) => f.courses)
    );

    const labs = courseCodes.filter((c) => c.creditHours === data.LAB_CREDIT_HOURS);
    const theory = courseCodes.filter(
      (c) => c.creditHours === data.THEORY_CREDIT_HOURS
    );

    expect(courseCodes).toHaveLength(96);
    expect(labs).toHaveLength(seed.summary.labCourseCount);
    expect(seed.summary.labCourseCount).toBe(EXPECTED_LAB_COURSES.size);
    expect(theory.length + labs.length).toBe(96);

    for (const course of courseCodes) {
      const expected = EXPECTED_LAB_COURSES.has(course.code)
        ? data.LAB_CREDIT_HOURS
        : data.THEORY_CREDIT_HOURS;
      expect(course.creditHours).toBe(expected);
      expect(course.creditHours).toBeGreaterThanOrEqual(1);
    }
  });

  it("spreads each field's courses across semesters 1–8 in list order", () => {
    for (const department of seed.departments) {
      for (const field of department.fields) {
        const semesters = field.courses.map((c) => c.semester);
        expect(semesters).toHaveLength(6);
        expect(new Set(semesters).size).toBe(6); // all distinct
        expect(semesters[0]).toBe(data.SEMESTER_MIN);
        expect(semesters[semesters.length - 1]).toBe(data.SEMESTER_MAX);
        // Strictly ascending and within range.
        for (let i = 1; i < semesters.length; i += 1) {
          expect(semesters[i]).toBeGreaterThan(semesters[i - 1]);
        }
        expect(semesters.every((s) => s >= 1 && s <= 8)).toBe(true);
      }
    }
  });

  it("assigns no teacher to any course (the teacher is optional)", () => {
    for (const department of seed.departments) {
      for (const field of department.fields) {
        for (const course of field.courses) {
          expect(course.teacherId).toBeNull();
        }
      }
    }
  });

  it("only uses valid semester/credit values across the whole dataset", () => {
    for (const department of seed.departments) {
      for (const field of department.fields) {
        for (const course of field.courses) {
          expect(course.creditHours).toBeGreaterThanOrEqual(
            data.LAB_CREDIT_HOURS
          );
          expect(course.creditHours).toBeLessThanOrEqual(
            data.THEORY_CREDIT_HOURS
          );
          expect(course.semester).toBeGreaterThanOrEqual(data.SEMESTER_MIN);
          expect(course.semester).toBeLessThanOrEqual(data.SEMESTER_MAX);
        }
      }
    }
  });
});

describe("semesterForCourse", () => {
  it("evenly spreads 6 courses across semesters 1–8 (in order)", () => {
    expect(data.semesterForCourse(0, 6)).toBe(1);
    expect(data.semesterForCourse(1, 6)).toBe(2);
    expect(data.semesterForCourse(2, 6)).toBe(4);
    expect(data.semesterForCourse(3, 6)).toBe(5);
    expect(data.semesterForCourse(4, 6)).toBe(7);
    expect(data.semesterForCourse(5, 6)).toBe(8);
  });

  it("handles the single-course edge case", () => {
    expect(data.semesterForCourse(0, 1)).toBe(1);
  });

  it("rejects invalid arguments", () => {
    expect(() => data.semesterForCourse(-1, 6)).toThrow();
    expect(() => data.semesterForCourse(0, 0)).toThrow();
    expect(() => data.semesterForCourse(6, 6)).toThrow();
    expect(() => data.semesterForCourse(1.5, 6)).toThrow();
  });
});

describe("buildCourseCode", () => {
  it("formats DEPTCODE-FIELDCODE-NNN with zero-padded numbers", () => {
    expect(data.buildCourseCode("CS", "AI", 0)).toBe("CS-AI-001");
    expect(data.buildCourseCode("CS", "AI", 5)).toBe("CS-AI-006");
    expect(data.buildCourseCode("AHS", "MLT", 3)).toBe("AHS-MLT-004");
  });

  it("normalises lower-case codes to upper case", () => {
    expect(data.buildCourseCode("cs", "ai", 0)).toBe("CS-AI-001");
  });
});