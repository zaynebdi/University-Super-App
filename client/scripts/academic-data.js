"use strict";

/**
 * Pure academic seed data + build logic. No DB access, no env access, no I/O.
 *
 * This module is shared by two consumers:
 *  - client/scripts/seed-academic-data.js  (the DB-writer seed script, git-ignored)
 *  - client/test/scripts/academic-data.test.ts (vitest, no DB)
 *
 * Keep every function here deterministic and side-effect free so the vitest
 * suite can lock the generated codes/credits/semesters down.
 *
 * Data shape: Department -> Field -> Courses.
 * Course codes are DEPTCODE-FIELDCODE-NNN (NNN = 001.. per field, in order).
 * Credits: theory courses 3; lab (applied/practical) courses 1.
 * Semesters: each field's 6 courses are spread across semesters 1..8 in list
 * order (the exact sequence produced by `semesterForCourse`).
 * No course assigns a teacher (teacherId stays null — the teacher is optional).
 */

const SEMESTER_MIN = 1;
const SEMESTER_MAX = 8;
const THEORY_CREDIT_HOURS = 3;
const LAB_CREDIT_HOURS = 1;

/**
 * Academic catalog: Department -> Field -> courses.
 * `lab: true` marks applied/practical courses that carry LAB_CREDIT_HOURS.
 */
const DEPARTMENTS = [
  {
    name: "Computer Science",
    code: "CS",
    fields: [
      {
        name: "Software Engineering",
        code: "SE",
        courses: [
          { title: "Software Engineering Fundamentals", lab: false },
          { title: "Software Requirements Engineering", lab: false },
          { title: "Software Design and Architecture", lab: false },
          { title: "Software Testing and Quality Assurance", lab: false },
          { title: "Software Project Management", lab: false },
          { title: "Web Engineering", lab: true },
        ],
      },
      {
        name: "Artificial Intelligence",
        code: "AI",
        courses: [
          { title: "Artificial Intelligence", lab: false },
          { title: "Machine Learning", lab: true },
          { title: "Deep Learning", lab: true },
          { title: "Natural Language Processing", lab: false },
          { title: "Computer Vision", lab: true },
          { title: "Data Mining", lab: true },
        ],
      },
      {
        name: "Cyber Security",
        code: "CYB",
        courses: [
          { title: "Information Security", lab: false },
          { title: "Network Security", lab: true },
          { title: "Cryptography", lab: false },
          { title: "Ethical Hacking and Penetration Testing", lab: true },
          { title: "Digital Forensics", lab: true },
          { title: "Secure Software Development", lab: true },
        ],
      },
      {
        name: "Information Technology",
        code: "IT",
        courses: [
          { title: "Database Systems", lab: true },
          { title: "Web Technologies", lab: true },
          { title: "Cloud Computing", lab: true },
          { title: "Mobile Application Development", lab: true },
          { title: "System Administration", lab: true },
          { title: "Computer Networks", lab: true },
        ],
      },
    ],
  },
  {
    name: "Electrical Engineering",
    code: "EE",
    fields: [
      {
        name: "Power Systems",
        code: "PS",
        courses: [
          { title: "Circuit Analysis", lab: true },
          { title: "Electrical Machines", lab: true },
          { title: "Power Generation and Transmission", lab: false },
          { title: "Power Electronics", lab: true },
          { title: "Power System Protection", lab: false },
          { title: "Renewable Energy Systems", lab: false },
        ],
      },
      {
        name: "Electronics",
        code: "ELE",
        courses: [
          { title: "Electronic Devices and Circuits", lab: true },
          { title: "Digital Logic Design", lab: true },
          { title: "Microprocessors and Microcontrollers", lab: true },
          { title: "Embedded Systems", lab: true },
          { title: "VLSI Design", lab: true },
          { title: "Analog Electronics", lab: true },
        ],
      },
      {
        name: "Telecommunication",
        code: "TC",
        courses: [
          { title: "Signals and Systems", lab: false },
          { title: "Communication Systems", lab: false },
          { title: "Digital Signal Processing", lab: true },
          { title: "Wireless Communication", lab: false },
          { title: "Antenna and Wave Propagation", lab: false },
          { title: "Mobile Communication", lab: false },
        ],
      },
    ],
  },
  {
    name: "Business Administration",
    code: "BBA",
    fields: [
      {
        name: "Marketing",
        code: "MKT",
        courses: [
          { title: "Principles of Marketing", lab: false },
          { title: "Consumer Behavior", lab: false },
          { title: "Digital Marketing", lab: false },
          { title: "Brand Management", lab: false },
          { title: "Marketing Research", lab: true },
          { title: "Sales Management", lab: false },
        ],
      },
      {
        name: "Finance",
        code: "FIN",
        courses: [
          { title: "Financial Accounting", lab: false },
          { title: "Corporate Finance", lab: false },
          { title: "Investment and Portfolio Management", lab: true },
          { title: "Financial Markets and Institutions", lab: false },
          { title: "Islamic Banking and Finance", lab: false },
          { title: "Risk Management", lab: false },
        ],
      },
      {
        name: "Human Resource Management",
        code: "HRM",
        courses: [
          { title: "Organizational Behavior", lab: false },
          { title: "Human Resource Management", lab: false },
          { title: "Recruitment and Selection", lab: false },
          { title: "Training and Development", lab: true },
          { title: "Compensation Management", lab: false },
          { title: "Industrial Relations", lab: false },
        ],
      },
    ],
  },
  {
    name: "Law",
    code: "LAW",
    fields: [
      {
        name: "Criminal Law",
        code: "CRIM",
        courses: [
          { title: "Pakistan Penal Code", lab: false },
          { title: "Law of Criminal Procedure", lab: false },
          { title: "Law of Evidence", lab: false },
          { title: "Criminology", lab: false },
          { title: "Juvenile Justice", lab: false },
          { title: "Cyber Crime Law", lab: true },
        ],
      },
      {
        name: "Corporate Law",
        code: "CORP",
        courses: [
          { title: "Law of Contract", lab: false },
          { title: "Company Law", lab: false },
          { title: "Commercial Law", lab: false },
          { title: "Intellectual Property Law", lab: false },
          { title: "Tax Law", lab: false },
          { title: "Banking Law", lab: false },
        ],
      },
      {
        name: "International Law",
        code: "INTL",
        courses: [
          { title: "Public International Law", lab: false },
          { title: "Human Rights Law", lab: false },
          { title: "International Humanitarian Law", lab: false },
          { title: "Constitutional Law of Pakistan", lab: false },
          { title: "Law of Treaties", lab: false },
          { title: "International Trade Law", lab: false },
        ],
      },
    ],
  },
  {
    name: "Allied Health Sciences",
    code: "AHS",
    fields: [
      {
        name: "Nursing",
        code: "NUR",
        courses: [
          { title: "Anatomy and Physiology", lab: true },
          { title: "Fundamentals of Nursing", lab: true },
          { title: "Medical-Surgical Nursing", lab: false },
          { title: "Pharmacology for Nurses", lab: false },
          { title: "Community Health Nursing", lab: false },
          { title: "Mental Health Nursing", lab: false },
        ],
      },
      {
        name: "Medical Laboratory Technology",
        code: "MLT",
        courses: [
          { title: "Clinical Biochemistry", lab: true },
          { title: "Hematology", lab: true },
          { title: "Medical Microbiology", lab: true },
          { title: "Histopathology", lab: true },
          { title: "Immunology and Serology", lab: true },
          { title: "Blood Banking", lab: true },
        ],
      },
      {
        name: "Physical Therapy",
        code: "PT",
        courses: [
          { title: "Human Anatomy", lab: true },
          { title: "Kinesiology and Biomechanics", lab: false },
          { title: "Therapeutic Exercise", lab: true },
          { title: "Electrotherapy", lab: true },
          { title: "Musculoskeletal Physical Therapy", lab: true },
          { title: "Neurological Rehabilitation", lab: true },
        ],
      },
    ],
  },
];

/**
 * Maps a course position within its field to a semester in [SEMESTER_MIN,
 * SEMESTER_MAX], evenly spread across the whole range so the courses of a
 * field stay in list order (an index of 0 is always SEMESTER_MIN and the last
 * index is always SEMESTER_MAX).
 */
function semesterForCourse(index, totalCourses) {
  if (!Number.isInteger(index) || index < 0) {
    throw new Error("semesterForCourse: index must be a non-negative integer");
  }
  if (!Number.isInteger(totalCourses) || totalCourses <= 0) {
    throw new Error("semesterForCourse: totalCourses must be a positive integer");
  }
  if (index >= totalCourses) {
    throw new Error("semesterForCourse: index must be less than totalCourses");
  }
  if (totalCourses === 1) return SEMESTER_MIN;
  const step = (SEMESTER_MAX - SEMESTER_MIN) / (totalCourses - 1);
  return SEMESTER_MIN + Math.round(index * step);
}

/** DEPTCODE-FIELDCODE-NNN with NNN zero-padded, sequential per field. */
function buildCourseCode(departmentCode, fieldCode, index) {
  return `${departmentCode.toUpperCase()}-${fieldCode.toUpperCase()}-${String(
    index + 1
  ).padStart(3, "0")}`;
}

/**
 * Builds the full seed dataset deterministically. Returns:
 *  - departments: ready-to-seed records (fields carry name/code/courses)
 *  - summary:    { departmentCount, fieldCount, courseCount, labCourseCount }
 *
 * No database access; purely derived from the catalog above.
 */
function buildAcademicSeedData() {
  let courseCount = 0;
  let labCourseCount = 0;

  const departments = DEPARTMENTS.map((department) => ({
    name: department.name,
    code: department.code,
    fields: department.fields.map((field) => ({
      name: field.name,
      code: field.code,
      courses: field.courses.map((course, index) => {
        courseCount += 1;
        const lab = course.lab === true;
        if (lab) labCourseCount += 1;
        return {
          code: buildCourseCode(department.code, field.code, index),
          title: course.title,
          semester: semesterForCourse(index, field.courses.length),
          creditHours: lab ? LAB_CREDIT_HOURS : THEORY_CREDIT_HOURS,
          teacherId: null,
        };
      }),
    })),
  }));

  const fieldCount = departments.reduce(
    (sum, department) => sum + department.fields.length,
    0
  );

  return {
    departments,
    summary: {
      departmentCount: departments.length,
      fieldCount,
      courseCount,
      labCourseCount,
    },
  };
}

module.exports = {
  DEPARTMENTS,
  SEMESTER_MIN,
  SEMESTER_MAX,
  THEORY_CREDIT_HOURS,
  LAB_CREDIT_HOURS,
  semesterForCourse,
  buildCourseCode,
  buildAcademicSeedData,
};