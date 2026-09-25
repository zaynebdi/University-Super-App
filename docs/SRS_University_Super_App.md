# Software Requirements Specification (SRS)
## University Super App

**Version:** 1.0 | **Status:** Draft | **Team Lead:** Zain ul Abidin | **Team:** Abdullah Muhammad, Minahil Fatima

---

## 1. Introduction

### 1.1 Purpose
This document defines the requirements of the University Super App, a web application that brings core university services (profiles, courses, timetable, announcements, attendance, results) into one platform. It is the reference for design, development and testing.

### 1.2 Scope
The system provides role-based access for Students, Teachers and Admins. Version 1 (MVP) covers authentication, profiles, courses, timetable, announcements, attendance and results. Fee management, assignments, chat and mobile apps are out of scope for v1.

### 1.3 Definitions
| Term | Meaning |
|---|---|
| MVP | Minimum Viable Product, the first usable release |
| JWT | JSON Web Token, used for authentication |
| REST API | HTTP-based interface between frontend and backend |
| RBAC | Role-Based Access Control |

### 1.4 Intended Audience
Development team, mentor, and testers.

---

## 2. Overall Description

### 2.1 Product Perspective
A standalone client-server web app: React frontend, Node.js/Express REST backend, MongoDB database.

### 2.2 User Classes
| User | Description |
|---|---|
| Student | Views profile, courses, timetable, announcements, own attendance and results |
| Teacher | Manages assigned courses, marks attendance, uploads results, posts announcements |
| Admin | Manages users, courses, enrollments, timetable and all announcements |

### 2.3 Operating Environment
Modern browsers (Chrome, Edge, Firefox, Safari), desktop and mobile screens. Server: Node.js 18+. Database: MongoDB Atlas.

### 2.4 Assumptions and Dependencies
- Users have internet access.
- Admin creates the initial student and teacher records.
- Free-tier hosting (Vercel, Render, MongoDB Atlas) is available.

### 2.5 Constraints
- Internship timeline and a team of 3 members.
- Free-tier infrastructure limits.
- Team must follow the Git branch and pull-request workflow.

---

## 3. Functional Requirements

### 3.1 Authentication and Authorization
| ID | Requirement |
|---|---|
| FR-1.1 | The system shall allow users to log in with email and password. |
| FR-1.2 | The system shall allow the Admin to create Student and Teacher accounts. |
| FR-1.3 | The system shall hash passwords before storing them. |
| FR-1.4 | The system shall issue a JWT on login and validate it on protected routes. |
| FR-1.5 | The system shall restrict features according to user role (RBAC). |
| FR-1.6 | The system shall allow users to log out and change their password. |

### 3.2 Profile Management
| ID | Requirement |
|---|---|
| FR-2.1 | A student shall be able to view their profile (name, roll no, department, semester). |
| FR-2.2 | A user shall be able to edit limited profile fields (phone, photo). |
| FR-2.3 | The Admin shall be able to view, edit and deactivate any user. |

### 3.3 Course Management
| ID | Requirement |
|---|---|
| FR-3.1 | The Admin shall create, update and delete courses (code, title, credit hours, semester). |
| FR-3.2 | The Admin shall assign a teacher to a course. |
| FR-3.3 | The Admin shall enroll students in courses. |
| FR-3.4 | A student shall view their enrolled courses. |
| FR-3.5 | A teacher shall view their assigned courses and enrolled students. |

### 3.4 Timetable
| ID | Requirement |
|---|---|
| FR-4.1 | The Admin shall create and edit timetable entries (course, day, time, room). |
| FR-4.2 | Students and teachers shall view their weekly timetable. |
| FR-4.3 | The system shall prevent room and teacher time clashes. |

### 3.5 Announcements
| ID | Requirement |
|---|---|
| FR-5.1 | Admin and teachers shall post announcements (title, body). |
| FR-5.2 | Students shall view announcements, newest first. |
| FR-5.3 | The poster shall be able to edit or delete their own announcement. |

### 3.6 Attendance
| ID | Requirement |
|---|---|
| FR-6.1 | A teacher shall mark attendance (present/absent) per course per date. |
| FR-6.2 | A student shall view their attendance per course with a percentage. |
| FR-6.3 | The system shall highlight courses with attendance below 75%. |

### 3.7 Results
| ID | Requirement |
|---|---|
| FR-7.1 | A teacher shall enter marks and grades for their course. |
| FR-7.2 | A student shall view their results per course. |
| FR-7.3 | The system shall calculate the student's GPA. |

---

## 4. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-1 | Performance | Pages shall load within 3 seconds; API responses within 1 second under normal load. |
| NFR-2 | Security | Passwords hashed with bcrypt; JWT-protected routes; input validation on all endpoints; secrets kept in environment variables. |
| NFR-3 | Usability | Responsive UI usable on mobile and desktop; clear error messages. |
| NFR-4 | Reliability | Target availability of 99% during demo period; graceful error handling. |
| NFR-5 | Maintainability | Modular code structure, ESLint/Prettier, README with setup steps. |
| NFR-6 | Scalability | Stateless REST backend so it can scale horizontally. |
| NFR-7 | Compatibility | Latest two versions of major browsers. |
| NFR-8 | Data integrity | Enrollment, attendance and results must reference valid students and courses. |

---

## 5. External Interface Requirements

### 5.1 User Interface
Pages: Login, Dashboard (per role), Profile, Courses, Timetable, Announcements, Attendance, Results, Admin panel.

### 5.2 Software Interface
- Frontend communicates with backend via REST APIs (JSON over HTTPS).
- Backend communicates with MongoDB via Mongoose.

### 5.3 Technology Stack
| Layer | Technology |
|---|---|
| Frontend | React.js, Vite, React Router, Axios |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| Tools | Git, GitHub, Postman, ESLint, Prettier |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas |

---

## 6. Data Requirements

| Collection | Main Fields |
|---|---|
| User | name, email, password, role |
| Student | userId, rollNo, department, semester |
| Course | code, title, teacherId, semester, creditHours |
| Enrollment | studentId, courseId |
| Timetable | courseId, day, startTime, endTime, room |
| Announcement | title, body, postedBy, createdAt |
| Attendance | courseId, studentId, date, status |
| Result | studentId, courseId, marks, grade |

---

## 7. Use Cases (Summary)

| Actor | Use Case |
|---|---|
| All | Login, Logout, Change password |
| Student | View profile, courses, timetable, announcements, attendance, results |
| Teacher | Mark attendance, enter results, post announcements, view course students |
| Admin | Manage users, courses, enrollments, timetable, announcements |

---

## 8. Project Plan (High Level)

| Phase | Deliverable |
|---|---|
| 1 | Setup, SRS, database design, API list |
| 2 | Backend: auth, users, courses |
| 3 | Backend: timetable, announcements, attendance, results |
| 4 | Frontend integration |
| 5 | Testing and bug fixing |
| 6 | Deployment, documentation, demo |

---

## 9. Future Scope (v2)
Fee management, assignment submission, notifications (email/push), chat, mobile app, library and transport modules.
