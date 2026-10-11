export type ApiEnvelope<T> =
  | { success: true; data: T }
  | { success: false; message: string };

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!res.ok || !body || body.success === false) {
    const message =
      body && body.success === false
        ? body.message
        : `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return res.status === 204 ? (undefined as T) : body.data;
}

export type UserRole = "student" | "teacher" | "admin";

export type UserDTO = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  photo?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type DepartmentDTO = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  courseCount: number;
  courses: { id: string; code: string; title: string }[];
  createdAt?: string;
  updatedAt?: string;
};

export type CourseDepartmentDTO = {
  id: string;
  name: string;
  code: string;
} | null;

export type StudentProfileDTO = {
  id: string;
  userId: string;
  rollNo: string;
  department: string;
  departmentId?: string | null;
  semester: number;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TeacherProfileDTO = {
  id: string;
  userId: string;
  department: string;
  departmentId?: string | null;
  designation?: string;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CourseTeacherDTO = {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string | null;
};

export type CourseDTO = {
  id: string;
  code: string;
  title: string;
  semester: number;
  creditHours: number;
  teacher: CourseTeacherDTO | null;
  department: CourseDepartmentDTO;
  createdAt?: string;
  updatedAt?: string;
};

export type EnrolledCourseDTO = {
  id: string;
  code: string;
  title: string;
  semester: number;
  creditHours: number;
  teacher: CourseTeacherDTO | null;
  department: CourseDepartmentDTO;
  enrolledAt: string;
};

export type CourseStudentDTO = {
  id: string;
  rollNo: string;
  department: string;
  departmentId?: string | null;
  semester: number;
  name: string;
  email: string;
};

export type TimetableEntryDTO = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  courseId: string | null;
  course: { code: string; title: string } | null;
};

export type AnnouncementDTO = {
  id: string;
  title: string;
  body: string;
  author: { id: string; name: string; email: string; role: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type AttendanceStatus = "present" | "absent";

export type AttendanceRecordDTO = {
  id: string;
  courseId: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
};

export type CourseAttendanceDTO = {
  id: string;
  courseId: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  student?: { id: string; rollNo: string; department: string; name: string; email: string };
};

export type StudentAttendanceSummaryDTO = {
  courseId: string;
  course: { id: string; code: string; title: string };
  present: number;
  total: number;
  percentage: number;
  belowThreshold: boolean;
};

export type ResultDTO = {
  id: string;
  studentId: string;
  courseId: string;
  marks: number;
  grade: string;
};

export type StudentResultsDTO = {
  results: {
    id: string;
    courseId: string | null;
    course: { id: string; code: string; title: string; creditHours: number } | null;
    marks: number;
    grade: string;
  }[];
  gpa: number;
};

export type CreateUserInput =
  | {
      name: string;
      email: string;
      password: string;
      role: "student";
      departmentId: string;
      semester: number;
    }
  | {
      name: string;
      email: string;
      password: string;
      role: "teacher";
      departmentId: string;
      designation?: string;
      courseIds?: string[];
    };

export type RegisteredUserDTO = UserDTO & { rollNo?: string };

export type CreateCourseInput = {
  code: string;
  title: string;
  teacherId?: string | null;
  departmentId?: string | null;
  semester: number;
  creditHours: number;
};

export type CreateTimetableInput = {
  courseId: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
};

export type SaveAttendanceInput = {
  courseId: string;
  date: string;
  records: { studentId: string; status: AttendanceStatus }[];
};

export const api = {
  auth: {
    me: () => apiFetch<UserDTO>("/api/auth/me"),
    changePassword: (currentPassword: string, newPassword: string) =>
      apiFetch<{ message: string }>("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
    register: (input: CreateUserInput) =>
      apiFetch<RegisteredUserDTO>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  },
  users: {
    list: (role?: string) =>
      apiFetch<UserDTO[]>(`/api/users${role ? `?role=${role}` : ""}`),
    get: (id: string) => apiFetch<UserDTO>(`/api/users/${id}`),
    update: (id: string, input: Partial<UserDTO>) =>
      apiFetch<UserDTO>(`/api/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    remove: (id: string) =>
      apiFetch<{ message: string }>(`/api/users/${id}`, { method: "DELETE" }),
  },
  students: {
    me: () => apiFetch<StudentProfileDTO>("/api/students/me"),
    get: (id: string) => apiFetch<StudentProfileDTO>(`/api/students/${id}`),
    list: (params?: { department?: string; departmentId?: string }) => {
      const q = new URLSearchParams();
      if (params?.department) q.set("department", params.department);
      if (params?.departmentId) q.set("departmentId", params.departmentId);
      const qs = q.toString();
      return apiFetch<StudentProfileDTO[]>(`/api/students${qs ? `?${qs}` : ""}`);
    },
    courses: (id: string) =>
      apiFetch<EnrolledCourseDTO[]>(`/api/students/${id}/courses`),
  },
  teachers: {
    me: () => apiFetch<TeacherProfileDTO>("/api/teachers/me"),
    list: () => apiFetch<TeacherProfileDTO[]>("/api/teachers"),
    get: (id: string) => apiFetch<TeacherProfileDTO>(`/api/teachers/${id}`),
  },
  departments: {
    list: (activeOnly = false) =>
      apiFetch<DepartmentDTO[]>(`/api/departments${activeOnly ? "?activeOnly=true" : ""}`),
    create: (input: { name: string; code: string; isActive?: boolean }) =>
      apiFetch<DepartmentDTO>("/api/departments", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    update: (id: string, input: { name?: string; code?: string; isActive?: boolean }) =>
      apiFetch<DepartmentDTO>(`/api/departments/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    remove: (id: string) =>
      apiFetch<{ message: string }>(`/api/departments/${id}`, { method: "DELETE" }),
  },
  courses: {
    list: (params?: { semester?: number; teacherId?: string; departmentId?: string }) => {
      const q = new URLSearchParams();
      if (params?.semester) q.set("semester", String(params.semester));
      if (params?.teacherId) q.set("teacherId", params.teacherId);
      if (params?.departmentId) q.set("departmentId", params.departmentId);
      const qs = q.toString();
      return apiFetch<CourseDTO[]>(`/api/courses${qs ? `?${qs}` : ""}`);
    },
    get: (id: string) => apiFetch<CourseDTO>(`/api/courses/${id}`),
    create: (input: CreateCourseInput) =>
      apiFetch<CourseDTO>("/api/courses", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    update: (id: string, input: Partial<CreateCourseInput>) =>
      apiFetch<CourseDTO>(`/api/courses/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    remove: (id: string) =>
      apiFetch<{ message: string }>(`/api/courses/${id}`, { method: "DELETE" }),
    enroll: (id: string, studentId: string) =>
      apiFetch<{ id: string; studentId: string; courseId: string; enrolledAt: string }>(
        `/api/courses/${id}/enroll`,
        { method: "POST", body: JSON.stringify({ studentId }) }
      ),
    students: (id: string) =>
      apiFetch<CourseStudentDTO[]>(`/api/courses/${id}/students`),
  },
  timetable: {
    me: () => apiFetch<TimetableEntryDTO[]>("/api/timetable/me"),
    list: () => apiFetch<TimetableEntryDTO[]>("/api/timetable"),
    create: (input: CreateTimetableInput) =>
      apiFetch<TimetableEntryDTO>("/api/timetable", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    update: (id: string, input: Partial<CreateTimetableInput>) =>
      apiFetch<TimetableEntryDTO>(`/api/timetable/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    remove: (id: string) =>
      apiFetch<{ message: string }>(`/api/timetable/${id}`, { method: "DELETE" }),
  },
  announcements: {
    list: (page = 1) => apiFetch<AnnouncementDTO[]>(`/api/announcements?page=${page}`),
    create: (input: { title: string; body: string }) =>
      apiFetch<AnnouncementDTO>("/api/announcements", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    update: (id: string, input: { title?: string; body?: string }) =>
      apiFetch<AnnouncementDTO>(`/api/announcements/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    remove: (id: string) =>
      apiFetch<{ message: string }>(`/api/announcements/${id}`, { method: "DELETE" }),
  },
  attendance: {
    save: (input: SaveAttendanceInput) =>
      apiFetch<AttendanceRecordDTO[]>("/api/attendance", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    byCourse: (courseId: string, date?: string) =>
      apiFetch<CourseAttendanceDTO[]>(
        `/api/attendance/course/${courseId}${date ? `?date=${encodeURIComponent(date)}` : ""}`
      ),
    byStudent: (studentId: string, courseId?: string) =>
      apiFetch<StudentAttendanceSummaryDTO[]>(
        `/api/attendance/student/${studentId}${courseId ? `?courseId=${courseId}` : ""}`
      ),
  },
  results: {
    create: (input: { studentId: string; courseId: string; marks: number; grade: string }) =>
      apiFetch<ResultDTO>("/api/results", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    update: (id: string, input: { marks?: number; grade?: string }) =>
      apiFetch<ResultDTO>(`/api/results/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    byStudent: (studentId: string) =>
      apiFetch<StudentResultsDTO>(`/api/results/student/${studentId}`),
  },
};

export function gradeFromMarks(marks: number): string {
  if (marks >= 90) return "A+";
  if (marks >= 85) return "A";
  if (marks >= 80) return "A-";
  if (marks >= 75) return "B+";
  if (marks >= 70) return "B";
  if (marks >= 65) return "B-";
  if (marks >= 60) return "C+";
  if (marks >= 55) return "C";
  if (marks >= 50) return "C-";
  if (marks >= 45) return "D+";
  if (marks >= 40) return "D";
  return "F";
}
