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

/* Expected catalog (Department -> Field -> 5 courses each), per the spec. */
const EXPECTED_DEPARTMENTS: Array<{ name: string; code: string; fields: string[] }> = [
  {
    name: "Computer Science",
    code: "CS",
    fields: [
      "Computer Science",
      "Software Engineering",
      "Data Science",
      "Artificial Intelligence",
      "Cyber Security",
    ],
  },
  {
    name: "Electrical Engineering",
    code: "EE",
    fields: [
      "Power Systems",
      "Electronics",
      "Telecommunication",
      "Computer Engineering",
    ],
  },
  {
    name: "Civil Engineering",
    code: "CE",
    fields: [
      "Structural Engineering",
      "Transportation Engineering",
      "Geotechnical Engineering",
      "Water Resources Engineering",
    ],
  },
  {
    name: "Business Administration",
    code: "BBA",
    fields: ["Marketing", "Finance", "Human Resource Management", "Accounting"],
  },
  {
    name: "Allied Health Sciences",
    code: "AHS",
    fields: [
      "Nursing",
      "Medical Laboratory Technology",
      "Physical Therapy",
      "Medical Imaging Technology",
    ],
  },
  {
    name: "Pharmacy",
    code: "PHARM",
    fields: [
      "Pharmaceutics",
      "Pharmacology",
      "Pharmaceutical Chemistry",
      "Clinical Pharmacy",
    ],
  },
  {
    name: "Law",
    code: "LAW",
    fields: ["Criminal Law", "Corporate Law", "International Law"],
  },
];

/* Courses that must carry 1 credit hour (applied/practical). */
const EXPECTED_LAB_COURSES = new Set([
  // CS — Computer Science
  "CS-CS-001",
  "CS-CS-003",
  // CS — Software Engineering
  "CS-SE-003",
  "CS-SE-004",
  // CS — Data Science
  "CS-DS-004",
  "CS-DS-005",
  // CS — Artificial Intelligence
  "CS-AI-002",
  "CS-AI-005",
  // CS — Cyber Security
  "CS-CYB-004",
  "CS-CYB-005",
  // EE — Power Systems
  "EE-PWR-001",
  // EE — Electronics
  "EE-ELX-002",
  "EE-ELX-003",
  // EE — Telecommunication
  "EE-TEL-003",
  // EE — Computer Engineering
  "EE-CPE-001",
  "EE-CPE-004",
  // CE — Structural Engineering
  "CE-STR-002",
  // CE — Transportation Engineering
  "CE-TRN-001",
  // CE — Geotechnical Engineering
  "CE-GEO-002",
  // CE — Water Resources Engineering
  "CE-WRE-001",
  // BBA — Marketing
  "BBA-MKT-003",
  // BBA — Human Resource Management
  "BBA-HRM-004",
  // AHS — Nursing
  "AHS-NUR-002",
  // AHS — Medical Laboratory Technology
  "AHS-MLT-001",
  "AHS-MLT-002",
  "AHS-MLT-003",
  "AHS-MLT-004",
  "AHS-MLT-005",
  // AHS — Physical Therapy
  "AHS-DPT-003",
  "AHS-DPT-004",
  // AHS — Medical Imaging Technology
  "AHS-MIT-003",
  "AHS-MIT-004",
  // PHARM — Pharmaceutics
  "PHARM-PCS-004",
  // PHARM — Pharmaceutical Chemistry
  "PHARM-PCH-005",
]);

describe("academic-data builder", () => {
  it("builds 7 departments, 28 fields and 140 courses", () => {
    expect(seed.summary.departmentCount).toBe(7);
    expect(seed.summary.fieldCount).toBe(28);
    expect(seed.summary.courseCount).toBe(140);
    expect(seed.departments).toHaveLength(7);

    const fields = seed.departments.flatMap((d) => d.fields);
    expect(fields).toHaveLength(28);
    expect(fields.every((f) => f.courses.length > 0)).toBe(true);
    expect(fields.flatMap((f) => f.courses)).toHaveLength(140);
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
            /^[A-Z]{1,6}-[A-Z]{1,6}-\d{3}$/
          );
        });
        expect(field.courses).toHaveLength(5);
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

    expect(courseCodes).toHaveLength(140);
    expect(labs).toHaveLength(seed.summary.labCourseCount);
    expect(seed.summary.labCourseCount).toBe(EXPECTED_LAB_COURSES.size);
    expect(theory.length + labs.length).toBe(140);

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
        expect(semesters).toHaveLength(5);
        expect(new Set(semesters).size).toBe(5); // all distinct
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

  it("is deterministic and idempotent across repeated builds", () => {
    const again = data.buildAcademicSeedData();
    expect(again.departments).toEqual(seed.departments);
    expect(again.summary).toEqual(seed.summary);
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
  it("evenly spreads 5 courses across semesters 1–8 (in order)", () => {
    expect(data.semesterForCourse(0, 5)).toBe(1);
    expect(data.semesterForCourse(1, 5)).toBe(3);
    expect(data.semesterForCourse(2, 5)).toBe(5);
    expect(data.semesterForCourse(3, 5)).toBe(6);
    expect(data.semesterForCourse(4, 5)).toBe(8);
  });

  it("handles the single-course edge case", () => {
    expect(data.semesterForCourse(0, 1)).toBe(1);
  });

  it("rejects invalid arguments", () => {
    expect(() => data.semesterForCourse(-1, 5)).toThrow();
    expect(() => data.semesterForCourse(0, 0)).toThrow();
    expect(() => data.semesterForCourse(5, 5)).toThrow();
    expect(() => data.semesterForCourse(1.5, 5)).toThrow();
  });
});

describe("buildCourseCode", () => {
  it("formats DEPTCODE-FIELDCODE-NNN with zero-padded numbers", () => {
    expect(data.buildCourseCode("CS", "AI", 0)).toBe("CS-AI-001");
    expect(data.buildCourseCode("CS", "AI", 4)).toBe("CS-AI-005");
    expect(data.buildCourseCode("AHS", "MLT", 3)).toBe("AHS-MLT-004");
    expect(data.buildCourseCode("PHARM", "PCS", 2)).toBe("PHARM-PCS-003");
  });

  it("normalises lower-case codes to upper case", () => {
    expect(data.buildCourseCode("cs", "ai", 0)).toBe("CS-AI-001");
  });
});