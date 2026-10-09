# BACKEND_PLAN.md — University Super App

**Phase 1 deliverable (inspection only). No application code was modified.**
Prepared: 2026-10-09. Status: **AWAITING APPROVAL — do not implement yet.**

---

## 0. Critical discovery (read first)

**Authoritative source (verified 2026-10-09):** the GitHub repository
`https://github.com/zaynebdi/University-Super-App.git`.

I performed a **fresh clone of the remote and compared it byte-for-byte** with the local working copy:

| Item | Finding |
|---|---|
| Remote | `https://github.com/zaynebdi/University-Super-App.git` |
| Default branch | `main` @ `a2a0437` — *"Fix formatting in Future Scope section"*, 2026-09-29 |
| All branches | `main` @ `a2a0437`, `Client/Frontend` @ `85880a9` (older), `Project/Docs` @ `b214374` (older) |
| Structure | `client/` (Next.js App Router frontend), `server/` (**empty — `.gitkeep` only, on every branch**), `docs/` (SRS + ERD) |
| Backend code | **None** — no `app/api/**`, no auth, no Mongoose on any branch |
| Local copy | `C:\Users\SIC\University-Super-App` — **byte-identical** to remote `main` (only difference is this new `BACKEND_PLAN.md`) |
| SRS | `docs/SRS_University_Super_App.md` |
| ERD/API doc | `docs/ERD_and_API_List.md` |

**Conclusion:** the remote "updated version" is the **same code this plan is based on** — there is no
newer backend on GitHub. If you intended to push additional work (e.g. a backend), it is **not present
on the remote**; please push it and tell me, otherwise the plan below already matches `origin/main`.

The opencode workspace you opened (`C:\Users\SIC\3D Objects\3d\MicroInformatics Full Stack Development`)
contains **only `notes.txt`** and is not the project. A **separate, unrelated Express.js skeleton** also
exists as `C:\Users\SIC\3D Objects\3d\MicroInformatics Full Stack Development.rar`
(`src/app.js` + empty `config/controllers/middleware/models/routes`, deps `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`).
It is **not** in this git repo and should **not** be used as the backend (see O-2).

All decisions below are based on the GitHub repo `origin/main` (`a2a0437`) and its local clone.

---

## A. Current project architecture

**Frontend (`client/`) — the only non-empty app in the repo.**

| Aspect | Value |
|---|---|
| Framework | **Next.js `16.3.6`**, App Router (`app/`) |
| React | `19.2.8` (`react`, `react-dom`) |
| Language | TypeScript `^5`, `strict: true`, path alias `@/*` → `./*` |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`), `lucide-react` icons |
| Lint | ESLint 9 + `eslint-config-next` (flat config `eslint.config.mjs`) |
| Scripts | `dev: next dev`, `build: next build`, `start: next start`, `lint: eslint` |
| App dirs | `app/student/**`, `app/faculty/**`, `app/page.tsx` (redirects to `/student/dashboard`), `app/layout.tsx` |
| Install state | **`client/node_modules` is NOT installed; no `.next` build exists** |
| Env | root `.env.example` is **empty** (2 bytes); `client/.gitignore` ignores `.env*` |

**Backend: none.**
- No `app/api/**` route handlers exist.
- No `middleware.ts`, no auth, no session, no DB, no Mongoose, no API client (`fetch`/`axios`) anywhere.
- `mongoose`, `next-auth`, `bcryptjs`, `zod` are **not** in `client/package.json` and must be added.
- `server/` contains only `.gitkeep` → currently a placeholder.

**Data/state today:** every page renders module-level hardcoded constants ("mock data") and local `useState`. There is no cross-page persistence.

**Architecture decision (per your directive, and confirmed by `docs/ERD_and_API_List.md`):**
Use Next.js App Router **Route Handlers** as the API layer — **no separate Express server.**
Target: `App Router → Route Handlers (app/api/**/route.ts) → service/business logic → Mongoose → MongoDB Atlas`. Auth via **Auth.js/NextAuth (Credentials provider)**, passwords hashed with **bcryptjs**.

> Note: `docs/ERD_and_API_List.md` already states *"all API endpoints below are implemented as Next.js Route Handlers under `client/app/api/`, not a separate Express server."* This matches your directive and the actual stack. See conflict O-3 (SRS §2.1 vs §5.3).

---

## B. Existing frontend features

### B.1 Shared shell / layout
| File | Role |
|---|---|
| `components/layout/AppShell.tsx` | Student shell (Sidebar + Topbar + mobile drawer) |
| `components/layout/FacultyAppShell.tsx` | Faculty shell |
| `components/layout/Sidebar.tsx` | Student nav (pathname active state, **non-functional "Sign out"**) |
| `components/layout/FacultySidebar.tsx` | Faculty nav (many dead links) |
| `components/layout/Topbar.tsx` | Student header — **hardcoded user "Abdullah Muhammad / Software Engineering / AM"**, dead search + bell + profile |
| `components/layout/FacultyTopbar.tsx` | Faculty header — **hardcoded "Dr. Ahmed / Software Engineering / DA"** |
| `components/ui/Card.tsx`, `StatCard.tsx` | Presentational |
| `app/faculty/layout.tsx` | Wraps faculty in `FacultyAppShell` |
| `app/student/layout.tsx` | **Does not exist** — student pages import `AppShell` individually |

### B.2 Student pages (`app/student/**`) — 17 pages
`dashboard`, `courses`, `courses/[courseId]`, `timetable`, `attendance`, `grades`, `annoucements` *(misspelled)*, `assignments`, `assignments/[assignmentId]`, `events`, `fees`, `career`, `campus`, `complaints`, `resources`, `settings`, `ai-copilot`.

**In MVP scope (SRS):** dashboard, courses, courses/[courseId], timetable, attendance, grades, annoucements.
**Out of MVP scope (UI exists, no SRS support):** assignments(+detail), events, fees, career, campus, complaints, resources, ai-copilot, settings (partly MVP via change-password/profile).

### B.3 Faculty pages (`app/faculty/**`) — 13 pages
`dashboard`, `courses`, `courses/[courseId]`, `students`, `students/[studentId]`, `timetable`, `attendance`, `grades`, `annoucements` *(misspelled)*, `assignments`, `assignments/[assignmentId]`, `events`, `profile`.

**In MVP scope:** dashboard, courses, courses/[courseId], students, students/[studentId], timetable, attendance, grades, annoucements, profile.
**Out of MVP:** assignments(+detail), events.

### B.4 Notable frontend issues found
- **No login page, no Admin UI, no role guard, no route protection.** SRS requires Student/Teacher/**Admin**; only Student + Faculty UIs exist.
- **Route typo:** folders are `annoucements`, but sidebars link to `/student/announcements` and `/faculty/announcements` → **broken links**.
- **Dead faculty links:** `/faculty/resources`, `/faculty/analytics`, `/faculty/ai-assistant`, `/faculty/student-insights`, `/faculty/help`, `/faculty/settings` have no pages.
- **Duplicate files (MD5-identical):**
  - `faculty/students/page.tsx` == `faculty/courses/[courseId]/page.tsx`
  - `faculty/grades/page.tsx` == `faculty/assignments/[assignmentId]/page.tsx`
- **Duplicate CSS:** `.form-select` defined twice in `app/globals.css`.

---

## C. Backend requirements discovered from the frontend

The frontend needs real data for the following (derived from the actual mock shapes and the "future API" comments embedded in pages):

| # | UI need | Where | Proposed endpoint(s) |
|---|---|---|---|
| C-1 | Current user identity (name, role, initials, department) | both Topbars (hardcoded) | `GET /api/auth/me` |
| C-2 | Session + sign out | sidebars | Auth.js `signIn`/`signOut` |
| C-3 | Change password | `student/settings`, `faculty/profile` | `POST /api/auth/change-password` |
| C-4 | Student profile (roll no, dept, semester, GPA, credits) | dashboard, settings | `GET /api/users/:id`, `GET /api/students/:id` |
| C-5 | Student courses list + detail | `student/courses`, `[courseId]` | `GET /api/students/:id/courses`, `GET /api/courses/:id` |
| C-6 | Student timetable (weekly grid, day/time/room/instructor) | `student/timetable` | `GET /api/timetable/me` |
| C-7 | Student attendance per course + % + <75% warning | `student/attendance` | `GET /api/attendance/student/:id` |
| C-8 | Student results / GPA / CGPA | `student/grades` | `GET /api/results/student/:id` |
| C-9 | Student announcements feed (category, pin, unread) | `student/annoucements` | `GET /api/announcements` |
| C-10 | Faculty assigned courses + metrics | `faculty/courses`, dashboard | `GET /api/courses?teacherId=me` |
| C-11 | Faculty course roster (students) | `faculty/courses/[courseId]`, `students` | `GET /api/courses/:id/students` |
| C-12 | Faculty student profile (academic, attendance, courses) | `faculty/students/[studentId]` | `GET /api/faculty/students/{id}` (+ academic/attendance/courses) — see O-5 |
| C-13 | Faculty timetable CRUD | `faculty/timetable` | `GET/POST/PUT/DELETE /api/timetable` |
| C-14 | Mark/save attendance per course+date+session | `faculty/attendance` | `POST /api/attendance`, `GET /api/attendance/course/:courseId` |
| C-15 | Enter/edit marks & grades | `faculty/grades` | `POST /api/results`, `PUT /api/results/:id` |
| C-16 | Publish/edit/delete announcements | `faculty/annoucements` | `POST/PUT/DELETE /api/announcements` |
| C-17 | Faculty profile (dept, designation, office hours, skills) | `faculty/profile` | `GET/PUT /api/users/:id` (+ teacher profile) |
| C-18 | Admin: manage users | *(no UI yet)* | `/api/users` |
| C-19 | Admin: courses + assign teacher + enroll students | *(no UI yet)* | `/api/courses`, `/api/courses/:id/enroll` |
| C-20 | Admin: timetable + announcements | *(no UI yet)* | `/api/timetable`, `/api/announcements` |

**Out-of-scope UI (do NOT build backend for MVP):** assignments & submissions, events, fees, complaints, resources, career, campus, ai-copilot. These pages contain aspirational endpoint comments (`/api/faculty/assignments`, `/api/faculty/submissions`, `/api/faculty/attendance/session`, etc.) that are **richer than the SRS** and must be deferred (see O-5).

---

## D. SRS requirements that must be implemented

Source: `docs/SRS_University_Super_App.md`.

**Functional (MVP):**
- **FR-1 Auth** — login (email+password); Admin creates Student/Teacher accounts; bcrypt hashing; JWT on protected routes; RBAC; logout + change password.
- **FR-2 Profile** — student views profile (name, rollNo, department, semester); user edits phone/photo; Admin view/edit/deactivate any user.
- **FR-3 Courses** — Admin CRUD course (code, title, creditHours, semester); assign teacher; enroll students; student views enrolled courses; teacher views assigned courses + enrolled students.
- **FR-4 Timetable** — Admin create/edit entries (course, day, time, room); students/teachers view weekly timetable; prevent room + teacher clashes.
- **FR-5 Announcements** — Admin + teachers post (title, body); students view newest-first; author edits/deletes own.
- **FR-6 Attendance** — teacher marks present/absent per course per date; student views % per course; highlight <75%.
- **FR-7 Results** — teacher enters marks/grade for own course; student views results; calculate GPA.

**Non-functional:** bcrypt + JWT protected routes + input validation + env secrets (NFR-2); responsive (NFR-3); graceful errors (NFR-4); modular + ESLint/Prettier (NFR-5); stateless REST (NFR-6); data integrity — references must point to valid student/course (NFR-8).

**Explicitly out of scope for v1 (§1.2/§9):** fees, assignments, chat, mobile, notifications, library, transport.

---

## E. Database schema / design

Stack: **Mongoose + MongoDB Atlas**. All refs are `ObjectId`. Passwords select-disabled by default.

### User
```ts
{
  name: string;               // required
  email: string;              // required, unique, lowercase, indexed
  password: string;           // required, hashed (bcrypt), select:false
  role: "student"|"teacher"|"admin"; // required, enum, indexed
  phone?: string;             // FR-2.2
  photo?: string;             // FR-2.2 (URL/string)
  isActive: boolean;          // FR-2.3 deactivate, default true
  createdAt/updatedAt        // timestamps
}
```
Indexes: `email` unique; `role`.

### Student (profile, 1:1 with User where role=student)
```ts
{ userId: ObjectId ref User (unique), rollNo: string (unique, indexed), department: string, semester: number }
```

### Teacher (profile, 1:1 with User where role=teacher) — see O-4
```ts
{ userId: ObjectId ref User (unique), department: string, designation?: string, office?: string, officeHours?: string }
```

### Course
```ts
{ code: string (unique, indexed), title: string, teacherId: ObjectId ref User(role=teacher) | null, semester: number, creditHours: number }
```
Index: `code` unique; `teacherId`; `semester`.

### Enrollment (join)
```ts
{ studentId: ObjectId ref User(role=student), courseId: ObjectId ref Course, enrolledAt: Date }
```
Index: **compound unique `{ studentId, courseId }`** (prevents duplicate enrollment); `courseId`.

### Timetable
```ts
{ courseId: ObjectId ref Course, day: "Monday"|...("Saturday"), startTime: string "HH:mm", endTime: string "HH:mm", room: string }
```
Indexes: `courseId`; `{day, startTime, endTime}`; `room` (clash checks); plus teacher lookups via course.

### Announcement
```ts
{ title: string, body: string, postedBy: ObjectId ref User, createdAt: Date }
```
Index: `createdAt` (desc, newest-first). *Optional* UI fields (category/priority/audience/status/pin) are not in SRS — defer (O-6).

### Attendance
```ts
{ courseId: ObjectId ref Course, studentId: ObjectId ref User(role=student), date: Date (day-granularity), status: "present"|"absent" }
```
Index: **compound unique `{ courseId, studentId, date }`** (one record per student/course/day — idempotent upsert); `courseId`; `studentId`.

### Result
```ts
{ studentId: ObjectId ref User(role=student), courseId: ObjectId ref Course, marks: number, grade: string }
```
Index: **compound unique `{ studentId, courseId }`**; `studentId`.

**GPA mapping (needed by FR-7.3 — currently undefined, see O-8):** standard 4.0 scale (A/A+ = 4.0, A- = 3.7, B+ = 3.3, B = 3.0, B- = 2.7, C+ = 2.3, C = 2.0, D = 1.0, F = 0.0), weighted by `course.creditHours`.

**Deletion policy (integrity):** deleting a User/Student cascades or blocks on Enrollment/Attendance/Result; deleting a Course removes its Enrollments/Timetable/Attendance/Results. All refs validated before insert (NFR-8).

---

## F. API / Route Handler list

Canonical list (from `docs/ERD_and_API_List.md`, aligned to the frontend). All under `client/app/api/.../route.ts`, JSON `{ success, data|message }`.

**Auth**
| Method | Route | Access |
|---|---|---|
| GET/POST | `/api/auth/[...nextauth]` | public (Auth.js) |
| POST | `/api/auth/register` | Admin |
| GET | `/api/auth/me` | authenticated |
| POST | `/api/auth/change-password` | authenticated |

**Users / Profile**
| Method | Route | Access |
|---|---|---|
| GET | `/api/users` | Admin (`?role=`) |
| GET | `/api/users/:id` | self or Admin |
| PUT | `/api/users/:id` | self (phone/photo) or Admin (all) |
| DELETE | `/api/users/:id` | Admin (deactivate/delete) |

**Students / Teachers (profiles)**
| Method | Route | Access |
|---|---|---|
| GET | `/api/students/:id` | self or Admin |
| GET | `/api/students/:id/courses` | self or Admin |
| GET | `/api/teachers` | Admin |
| GET | `/api/teachers/:id` | self or Admin |

**Courses**
| Method | Route | Access |
|---|---|---|
| GET | `/api/courses` | all (`?semester=`, `?teacherId=`) |
| POST | `/api/courses` | Admin |
| GET | `/api/courses/:id` | all |
| PUT | `/api/courses/:id` | Admin |
| DELETE | `/api/courses/:id` | Admin |
| POST | `/api/courses/:id/enroll` | Admin |
| GET | `/api/courses/:id/students` | Teacher(owner) or Admin |

**Timetable**
| Method | Route | Access |
|---|---|---|
| GET | `/api/timetable/me` | Student/Teacher |
| POST | `/api/timetable` | Admin |
| PUT | `/api/timetable/:id` | Admin |
| DELETE | `/api/timetable/:id` | Admin |

**Announcements**
| Method | Route | Access |
|---|---|---|
| GET | `/api/announcements` | all (`?page=`, newest first) |
| POST | `/api/announcements` | Teacher/Admin |
| PUT | `/api/announcements/:id` | author (Admin override) |
| DELETE | `/api/announcements/:id` | author or Admin |

**Attendance**
| Method | Route | Access |
|---|---|---|
| POST | `/api/attendance` | Teacher (own course) — body `{ courseId, date, records:[{studentId,status}] }` |
| GET | `/api/attendance/course/:courseId` | Teacher(owner)/Admin (`?date=`) |
| GET | `/api/attendance/student/:studentId` | self/Admin → per-course % |

**Results**
| Method | Route | Access |
|---|---|---|
| POST | `/api/results` | Teacher (own course) |
| PUT | `/api/results/:id` | Teacher (own course) |
| GET | `/api/results/student/:studentId` | self/Admin → results + GPA |

Every handler: validate input (zod or manual), authenticate via `auth()`, authorize by role/ownership, verify referenced IDs exist, return consistent JSON, never leak `password`.

---

## G. Authentication architecture

- **Auth.js / NextAuth v5 (beta)** with the **Credentials** provider, `client/app/api/auth/[...nextauth]/route.ts` + central `auth.ts`.
- **Password hashing:** `bcryptjs` (SRS says bcrypt; `bcryptjs` is pure-JS and Vercel-friendly). Hash on create/change; `password` field `select:false`.
- **Session strategy:** JWT (stateless — NFR-6). Callbacks inject `id` and `role` into the token/session.
- **Secrets/env:** `AUTH_SECRET` (a.k.a. `NEXTAUTH_SECRET`), `AUTH_URL`/`NEXTAUTH_URL`, `AUTH_TRUST_HOST=true` for Vercel.
- **Route protection:** `client/middleware.ts` guarding `/student/**`, `/faculty/**`, `/admin/**`, `/api/**` (except public auth routes), redirecting unauthenticated users to `/login`.
- **Role routing:** after login → student → `/student/dashboard`; teacher → `/faculty/dashboard`; admin → `/admin/dashboard`.
- **Account creation:** Admin-only `POST /api/auth/register` (Student/Teacher). **No public self-registration** (FR-1.2).
- **Change password:** verify old password, re-hash new.
- **Logout:** Auth.js `signOut()` wired to the sidebars' existing "Sign out" button.
- **Login UI:** a new `app/login/page.tsx` must be created (none exists) — minimal, matching existing Tailwind style. This is required to test any role.

> Auth.js is compatible with Next 16 / React 19 on the App Router and is exactly what the repo's ERD doc and SRS §5.3 specify.

---

## H. Student permissions

- Login / logout / change own password; view + edit own phone/photo.
- View **own** profile, enrolled courses, course details, weekly timetable, announcements (newest first), own attendance (% per course, <75% warning), own results + GPA.
- **Cannot** create/edit/delete courses, timetable, announcements, attendance, results, or other users. Server enforces ownership on `/students/:id/*`, `/attendance/student/:id`, `/results/student/:id`. Out-of-scope pages remain view-only mock.

## I. Teacher permissions

- Login / logout / change own password; view/edit own profile.
- View **own assigned courses** and their enrolled students.
- Create/edit/delete **own** announcements (Admin may override).
- Mark attendance for **own** courses only (`course.teacherId == session.id`); view course attendance.
- Enter/update marks & grades for **own** courses only.
- View own weekly timetable.
- **Cannot** manage users, create courses, assign teachers, enroll students, or edit timetable entries.

## J. Admin permissions

- Full user management: create Student/Teacher accounts, list/filter by role, edit, deactivate/delete.
- CRUD courses; assign/reassign teacher; enroll/unenroll students.
- CRUD timetable entries (with clash prevention).
- Post/manage **all** announcements (override delete).
- View any student attendance/results; view all courses.
- Admin UI pages (`/admin/**`) **do not exist** and must be created (minimum: dashboard, users, courses, timetable, announcements, enrollments). This is the largest frontend gap.

---

## K. Frontend → API integration points

Minimum-change plan (no UI redesign). Every page currently holds mock constants in local `useState`/module scope — replace the **data source** only, keep JSX.

| Frontend location | Change |
|---|---|
| **NEW** `app/login/page.tsx` | Credentials login form → `signIn()` |
| **NEW** `app/admin/**` | Admin dashboard, users, courses, enrollments, timetable, announcements |
| **NEW** `client/middleware.ts` | Protect routes by role |
| **NEW** `app/api/**` + `lib/db.ts` + `lib/models/**` + `lib/services/**` | Backend |
| `components/layout/Sidebar.tsx` | Wire "Sign out" → `signOut()`; fix `announcements` link; hide links by role if needed |
| `components/layout/FacultySidebar.tsx` | Wire "Sign out"; fix/hide dead links |
| `components/layout/Topbar.tsx` / `FacultyTopbar.tsx` | Replace hardcoded name/initials/role with session data; wire search or leave |
| `app/page.tsx` | Redirect by role (currently always `/student/dashboard`) |
| `app/student/{dashboard,courses,courses/[courseId],timetable,attendance,grades,annoucements}` | Fetch real data (server components where possible; client fetch where stateful) |
| `app/faculty/{dashboard,courses,courses/[courseId],students,students/[studentId],timetable,attendance,grades,annoucements,profile}` | Fetch real data; wire faculty timetable CRUD, attendance save, grade save, announcement CRUD, profile save |
| `lib/data.ts` | Retire mock `courses`; keep/align `Course` type with API DTO |
| Out-of-scope pages | **Leave as-is (mock)** for MVP; document as deferred |

Loading states / API error handling: add only where a real fetch occurs (spinner / error text), no redesign.

---

## L. Existing mock/static data that must become real

| Mock (current) | Location | Becomes |
|---|---|---|
| `courses` array (6) | `lib/data.ts`; dashboard; courses/[courseId] | `/api/students/:id/courses`, `/api/courses/:id` |
| `schedule` (dashboard) | `student/dashboard` | `/api/timetable/me` |
| `schedule` grid | `student/timetable` | `/api/timetable/me` |
| `attendanceData`, `recentRecords` | `student/attendance` | `/api/attendance/student/:id` |
| `courses`, `semesterPerformance` | `student/grades` | `/api/results/student/:id` |
| `announcements` | `student/annoucements` | `/api/announcements` |
| GPA/attendance/credits stat strings | `student/dashboard`, `Topbar` | derived from API + `/api/auth/me` |
| `facultyCourses` | `faculty/courses` | `/api/courses?teacherId=me` |
| `course` + `students[]` | `faculty/courses/[courseId]`, `faculty/students` | `/api/courses/:id`, `/api/courses/:id/students` |
| `studentData` (3 students) | `faculty/students/[studentId]` | `/api/students/:id` (+ attendance/courses) |
| `initialSessions` | `faculty/timetable` | `/api/timetable` CRUD |
| `initialStudents` | `faculty/attendance` | `/api/courses/:id/students`; save → `/api/attendance` |
| `initialSubmissions` | `faculty/grades` | `/api/results` (per student/course) |
| `initialAnnouncements` | `faculty/annoucements` | `/api/announcements` |
| `profile`, `initialSkills` | `faculty/profile` | `/api/users/:id`, `/api/teachers/:id` |
| `stats/schedule/gradingQueue/activities` | `faculty/dashboard` | `/api/courses`, `/api/timetable/me` |

**Deferred (no backend in MVP):** assignments, submissions, events, fees, complaints, resources, career, campus, ai-copilot. Keep their mock data.

---

## M. Required environment variables

Root `.env.example` is empty and must be populated (values not committed):

```
# Database
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority

# Auth.js / NextAuth
AUTH_SECRET=<random 32+ byte secret>       # generate: npx auth secret  (or NEXTAUTH_SECRET)
AUTH_URL=http://localhost:3000             # NEXTAUTH_URL in prod
AUTH_TRUST_HOST=true                       # required on Vercel

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Notes: `client/.gitignore` already ignores `.env*`. Never hardcode secrets (NFR-2). For Vercel, set the same vars in Project → Settings → Environment Variables. `AUTH_URL` should be the deployment URL.

---

## N. Implementation order

1. **Foundation:** `npm install` in `client/`; add `mongoose`, `next-auth@beta`, `bcryptjs` (+ `@types/bcryptjs`), optional `zod`; create `lib/db.ts` (cached connection), `lib/models/*`, `lib/api/response.ts` helpers.
2. **Auth & RBAC:** `auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `/api/auth/register`, `/api/auth/me`, `/api/auth/change-password`, `middleware.ts`, `/login` page, role redirect.
3. **Users/Profile:** `/api/users*`, `/api/students/:id*`, `/api/teachers*`.
4. **Courses & Enrollments:** `/api/courses*`, enroll, `:id/students`.
5. **Timetable:** `/api/timetable*` with room + teacher clash validation.
6. **Announcements:** `/api/announcements*`.
7. **Attendance:** `/api/attendance*` with upsert + percentage calc.
8. **Results:** `/api/results*` + GPA.
9. **Admin UI:** `/admin/**` (dashboard, users, courses, enrollments, timetable, announcements).
10. **Frontend integration:** wire student pages, then faculty pages, then shared shell (identity/logout/link fixes). Minimum changes only.
11. **Testing (Phase 7):** per-role flows + security matrix.
12. **Production readiness (Phase 8):** `tsc`, `eslint`, `next build`, run locally, verify Vercel + Atlas.

---

## O. Potential conflicts or missing information

**O-1 — Repo/source verification (resolved).** Authoritative source is GitHub `origin/main` @ `a2a0437`, freshly cloned and verified byte-identical to the local copy `C:\Users\SIC\University-Super-App`. The opencode workspace holds only `notes.txt`. **Plan written to the local repo root**, which mirrors `origin/main`. No newer backend exists on the remote — if you expected one, it was not pushed.

**O-2 — Unrelated Express skeleton.** `MicroInformatics Full Stack Development.rar` is an Express/Mongoose/JWT scaffold with empty folders — not in git, not part of this app. **Recommendation: ignore/remove it**; do not treat it as the backend. It is confirmed absent from all three GitHub branches.

**O-3 — SRS internal contradiction (resolved).** SRS §2.1 says *"React frontend, Node.js/Express REST backend"*; SRS §5.3 and `docs/ERD_and_API_List.md` say *Next.js App Router full-stack with Route Handlers + Auth.js*. Actual code is Next.js 16 App Router; `server/` is empty. **Decision: Next.js Route Handlers + Auth.js** (satisfies your directive, the ERD doc, and preserves the working frontend). No Express.

**O-4 — Teacher collection: ERD vs Phase 2 list.** ERD defines a `Teacher` profile; Phase 2's model list omits it (only Student profile). The faculty profile page expects department/designation/officeHours. **Recommendation: include a lightweight `Teacher` profile collection** (mirrors Student). Alternative: store those fields on `User`. Needs your decision; default = include.

**O-5 — Frontend endpoint vocabulary is richer than SRS/ERD.** Faculty pages comment endpoints like `/api/faculty/attendance/session`, `/api/faculty/assignments/{id}/submissions`, `/api/faculty/submissions/{id}/grade`. The SRS/ERD define a simpler `/api/attendance`, `/api/results`. **Decision: implement the SRS/ERD endpoints**; the "session/submission" richness belongs to out-of-scope assignments. Frontend pages will be minimally adapted to the MVP contract.

**O-6 — Announcement fields.** SRS model = `title, body, postedBy, createdAt`. Faculty UI has category/priority/audience/status/publishAt/reads/pinned. **Recommendation: persist only SRS fields in MVP**; UI-only fields keep local defaults (or are added later). Not silently dropped — deferred.

**O-7 — User profile fields.** SRS FR-2.2 mentions phone/photo; Phase 2 User list is only name/email/password/role. **Recommendation: add optional `phone`, `photo`, `isActive` to User** (needed for FR-2.2/FR-2.3).

**O-8 — GPA scale undefined.** SRS says "calculate GPA" but no grade-point mapping/4.0 scale is specified. **Need confirmation of the mapping** (proposed standard 4.0 mapping in §E). Frontend shows GPA 3.72 / CGPA / credits.

**O-9 — "Frontend ~90% complete" is overstated for MVP roles.** There is **no login page and no Admin UI**, and several MVP pages only exist as static mock. Student/faculty visual coverage is high; auth + admin are ~0%. This affects the schedule.

**O-10 — Sidebar route bugs.** `annoucements` folder vs `announcements` link (both roles) → currently 404. Must fix during integration (rename folder or link).

**O-11 — Dead links & duplicate page files.** Faculty sidebar links to 6+ non-existent pages; two pairs of files are byte-identical (`students`/`courses[cid]`, `grades`/`assignments[aid]`). **Recommendation: leave duplication untouched for now** (do not rewrite working frontend); fix only dead links that block testing.

**O-12 — Dependency versions.** Next `16.3.6` / React `19.2.8` are ahead of most tutorials; Auth.js must be a Next-16-compatible release. `node_modules` is not installed. **Need Node ≥ 18 (SRS) — verify local Node version** and that `next-auth` beta supports Next 16; fallback is a custom JWT cookie auth if Auth.js proves incompatible.

**O-13 — Attendance "session" granularity.** SRS marks attendance per **course per date**; faculty UI implies multiple **sessions** per date. **Recommendation: MVP = one record per (course, student, date)** via unique index (O-5 covers the richer model).

**O-14 — "Result" deletion/cascade & deactivation semantics** (what happens to a deactivated user's data) are unspecified. Proposed safe defaults in §E; flag for confirmation.

**O-15 — Root `.env.example` empty; no `.env` present.** Atlas connection string and secrets are **missing** — required before any DB/auth testing.

---

## STOP

Phase 1 complete. **No source files were modified** — only this `BACKEND_PLAN.md` was created (at `C:\Users\SIC\University-Super-App\BACKEND_PLAN.md`).

**Awaiting approval and decisions on:** O-1 (repo location), O-2 (ignore Express skeleton?), O-4 (Teacher collection?), O-8 (GPA scale), O-12 (Node/Auth.js version). On approval, proceed to Phase 2.
