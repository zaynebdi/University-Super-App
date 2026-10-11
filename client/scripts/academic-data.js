"use strict";

/**
 * Pure academic seed data + build logic. No DB access, no env access, no I/O.
 *
 * This module is shared by three consumers:
 *  - client/scripts/seed-academic-data.js  (the DB-writer seed script, git-ignored)
 *  - client/app/api/academic-data/route.ts (the "Load default academic data" admin API)
 *  - client/test/scripts/academic-data.test.ts (vitest, no DB)
 *
 * Keep every function here deterministic and side-effect free so the vitest
 * suite can lock the generated codes/credits/semesters down.
 *
 * Data shape: Department -> Field -> Courses.
 * Course codes are DEPTCODE-FIELDCODE-NNN (NNN = 001.. per field, in order).
 * Credits: theory courses 3; lab (applied/practical) courses 1.
 * Semesters: each field's 5 courses are spread across semesters 1..8 in list
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
 * Titles are taken verbatim from the task specification.
 */
const DEPARTMENTS = [
  {
    name: "Computer Science",
    code: "CS",
    fields: [
      {
        name: "Computer Science",
        code: "CS",
        courses: [
          { title: "Programming Fundamentals", lab: true },
          { title: "Data Structures and Algorithms", lab: false },
          { title: "Database Systems", lab: true },
          { title: "Operating Systems", lab: false },
          { title: "Computer Networks", lab: false },
        ],
      },
      {
        name: "Software Engineering",
        code: "SE",
        courses: [
          { title: "Software Requirements Engineering", lab: false },
          { title: "Software Design and Architecture", lab: false },
          { title: "Software Construction", lab: true },
          { title: "Software Testing and Quality Assurance", lab: true },
          { title: "Software Project Management", lab: false },
        ],
      },
      {
        name: "Data Science",
        code: "DS",
        courses: [
          { title: "Probability and Statistics", lab: false },
          { title: "Data Mining", lab: false },
          { title: "Big Data Analytics", lab: false },
          { title: "Data Visualization", lab: true },
          { title: "Machine Learning", lab: true },
        ],
      },
      {
        name: "Artificial Intelligence",
        code: "AI",
        courses: [
          { title: "Artificial Intelligence", lab: false },
          { title: "Machine Learning", lab: true },
          { title: "Deep Learning", lab: false },
          { title: "Natural Language Processing", lab: false },
          { title: "Computer Vision", lab: true },
        ],
      },
      {
        name: "Cyber Security",
        code: "CYB",
        courses: [
          { title: "Information Security", lab: false },
          { title: "Network Security", lab: false },
          { title: "Cryptography", lab: false },
          { title: "Digital Forensics", lab: true },
          { title: "Ethical Hacking and Penetration Testing", lab: true },
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
        code: "PWR",
        courses: [
          { title: "Circuit Analysis", lab: true },
          { title: "Electrical Machines", lab: false },
          { title: "Power Generation and Transmission", lab: false },
          { title: "Power Electronics", lab: false },
          { title: "Power System Protection", lab: false },
        ],
      },
      {
        name: "Electronics",
        code: "ELX",
        courses: [
          { title: "Electronic Devices and Circuits", lab: false },
          { title: "Digital Logic Design", lab: true },
          { title: "Microprocessors and Microcontrollers", lab: true },
          { title: "Embedded Systems", lab: false },
          { title: "VLSI Design", lab: false },
        ],
      },
      {
        name: "Telecommunication",
        code: "TEL",
        courses: [
          { title: "Signals and Systems", lab: false },
          { title: "Communication Systems", lab: false },
          { title: "Digital Signal Processing", lab: true },
          { title: "Wireless Communication", lab: false },
          { title: "Antenna and Wave Propagation", lab: false },
        ],
      },
      {
        name: "Computer Engineering",
        code: "CPE",
        courses: [
          { title: "Computer Organization and Assembly Language", lab: true },
          { title: "Digital System Design", lab: false },
          { title: "Computer Architecture", lab: false },
          { title: "Real-Time Systems", lab: true },
          { title: "Parallel and Distributed Computing", lab: false },
        ],
      },
    ],
  },
  {
    name: "Civil Engineering",
    code: "CE",
    fields: [
      {
        name: "Structural Engineering",
        code: "STR",
        courses: [
          { title: "Engineering Mechanics", lab: false },
          { title: "Mechanics of Materials", lab: true },
          { title: "Structural Analysis", lab: false },
          { title: "Reinforced Concrete Design", lab: false },
          { title: "Steel Structures", lab: false },
        ],
      },
      {
        name: "Transportation Engineering",
        code: "TRN",
        courses: [
          { title: "Surveying", lab: true },
          { title: "Highway Engineering", lab: false },
          { title: "Traffic Engineering", lab: false },
          { title: "Pavement Design", lab: false },
          { title: "Transportation Planning", lab: false },
        ],
      },
      {
        name: "Geotechnical Engineering",
        code: "GEO",
        courses: [
          { title: "Engineering Geology", lab: false },
          { title: "Soil Mechanics", lab: true },
          { title: "Foundation Engineering", lab: false },
          { title: "Earth Structures", lab: false },
          { title: "Ground Improvement", lab: false },
        ],
      },
      {
        name: "Water Resources Engineering",
        code: "WRE",
        courses: [
          { title: "Fluid Mechanics", lab: true },
          { title: "Hydrology", lab: false },
          { title: "Irrigation Engineering", lab: false },
          { title: "Hydraulic Structures", lab: false },
          { title: "Environmental Engineering", lab: false },
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
          { title: "Digital Marketing", lab: true },
          { title: "Brand Management", lab: false },
          { title: "Marketing Research", lab: false },
        ],
      },
      {
        name: "Finance",
        code: "FIN",
        courses: [
          { title: "Financial Accounting", lab: false },
          { title: "Corporate Finance", lab: false },
          { title: "Investment and Portfolio Management", lab: false },
          { title: "Financial Markets and Institutions", lab: false },
          { title: "Islamic Banking and Finance", lab: false },
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
        ],
      },
      {
        name: "Accounting",
        code: "ACC",
        courses: [
          { title: "Cost Accounting", lab: false },
          { title: "Intermediate Accounting", lab: false },
          { title: "Auditing", lab: false },
          { title: "Taxation", lab: false },
          { title: "Management Accounting", lab: false },
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
          { title: "Anatomy and Physiology", lab: false },
          { title: "Fundamentals of Nursing", lab: true },
          { title: "Medical-Surgical Nursing", lab: false },
          { title: "Pharmacology for Nurses", lab: false },
          { title: "Community Health Nursing", lab: false },
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
        ],
      },
      {
        name: "Physical Therapy",
        code: "DPT",
        courses: [
          { title: "Human Anatomy", lab: false },
          { title: "Kinesiology and Biomechanics", lab: false },
          { title: "Therapeutic Exercise", lab: true },
          { title: "Electrotherapy", lab: true },
          { title: "Musculoskeletal Physical Therapy", lab: false },
        ],
      },
      {
        name: "Medical Imaging Technology",
        code: "MIT",
        courses: [
          { title: "Radiographic Anatomy", lab: false },
          { title: "Radiation Physics", lab: false },
          { title: "Radiographic Techniques", lab: true },
          { title: "Ultrasound Imaging", lab: true },
          { title: "CT and MRI Technology", lab: false },
        ],
      },
    ],
  },
  {
    name: "Pharmacy",
    code: "PHARM",
    fields: [
      {
        name: "Pharmaceutics",
        code: "PCS",
        courses: [
          { title: "Physical Pharmacy", lab: false },
          { title: "Pharmaceutical Dosage Forms", lab: false },
          { title: "Biopharmaceutics and Pharmacokinetics", lab: false },
          { title: "Pharmaceutical Technology", lab: true },
          { title: "Pharmaceutical Quality Assurance", lab: false },
        ],
      },
      {
        name: "Pharmacology",
        code: "PHL",
        courses: [
          { title: "Human Physiology", lab: false },
          { title: "General Pharmacology", lab: false },
          { title: "Systemic Pharmacology", lab: false },
          { title: "Toxicology", lab: false },
          { title: "Clinical Pharmacology", lab: false },
        ],
      },
      {
        name: "Pharmaceutical Chemistry",
        code: "PCH",
        courses: [
          { title: "Organic Chemistry", lab: false },
          { title: "Medicinal Chemistry", lab: false },
          { title: "Pharmaceutical Analysis", lab: false },
          { title: "Natural Products Chemistry", lab: false },
          { title: "Instrumental Analysis", lab: true },
        ],
      },
      {
        name: "Clinical Pharmacy",
        code: "CLP",
        courses: [
          { title: "Pharmacy Practice", lab: false },
          { title: "Clinical Pharmacy", lab: false },
          { title: "Pharmacotherapeutics", lab: false },
          { title: "Drug Information and Pharmacovigilance", lab: false },
          { title: "Hospital Pharmacy", lab: false },
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
        code: "CRM",
        courses: [
          { title: "Pakistan Penal Code", lab: false },
          { title: "Law of Criminal Procedure", lab: false },
          { title: "Law of Evidence", lab: false },
          { title: "Criminology", lab: false },
          { title: "Juvenile Justice", lab: false },
        ],
      },
      {
        name: "Corporate Law",
        code: "COR",
        courses: [
          { title: "Law of Contract", lab: false },
          { title: "Company Law", lab: false },
          { title: "Commercial Law", lab: false },
          { title: "Intellectual Property Law", lab: false },
          { title: "Banking Law", lab: false },
        ],
      },
      {
        name: "International Law",
        code: "INT",
        courses: [
          { title: "Public International Law", lab: false },
          { title: "Human Rights Law", lab: false },
          { title: "International Humanitarian Law", lab: false },
          { title: "Constitutional Law of Pakistan", lab: false },
          { title: "International Trade Law", lab: false },
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