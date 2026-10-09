# BACKEND_PLAN.md — University Super App

**Status:** Approved plan — decisions incorporated. Awaiting implementation.
**Prepared:** 2026-10-09.
**Base commit:** `origin/main` @ `a2a0437` — *"Fix formatting in Future Scope section"*.
**Working branch:** `feature/backend-plan-v2`.

**Primary sources of truth (verified on GitHub):**
- `docs/SRS_University_Super_App.md` — `main`, blob `ddd2048`.
- `docs/ERD_and_API_List.md` — `main`, blob `b4f2b69`.

**Relationship to earlier work:** this document is a full rewrite that **replaces** the previous `BACKEND_PLAN.md` and **supersedes** the discarded `feature/backend-plan` and `feature/backend-foundation` branches/PRs. No backend code is carried over; the backend is built fresh from this plan.

> **Editing note:** only this document is changed here. All documentation follow-ups (SRS and ERD text corrections) are listed in §12 and left for you to apply separately. No application code, schemas, packages, or other docs were modified.

---

## 0. Scope

MVP per SRS §1.2: **authentication, profiles, courses, timetable, announcements, attendance, results**, with role-based access for **Student, Teacher, Admin**.

Explicitly **out of scope for v1** (SRS §1.2 / §9): fees, assignment submission, notifications, chat, mobile app, library, transport. Frontend pages for these stay as view-only mock data — no backend is built for them.

---

## 1. Repository & branch status (verified on GitHub)

| Item | State |
|---|---|
| Repository | `zaynebdi/University-Super-App` (public) |
| Default branch | `main` @ `a2a0437` |
| Other remote branches | `Client/Frontend` @ `85880a9`, `Project/Docs` @ `b214374` (older, not used) |
| `client/` | Next.js `16.3.6` App Router frontend (the app) |
| `server/` | Placeholder only (`.gitkeep`) — reserved, **unused**; no Express server |
| `docs/` | SRS + ERD/API documentation |
| Backend code on `main` | **None** — no `app/api/**`, no auth, no Mongoose |
| Discarded | `feature/backend-plan` (PR #4) and `feature/backend-foundation` (PR #5) |

The backend is built fresh on this branch per the decisions below.

---

## 2. Architecture (decided)

`Next.js App Router → Route Handlers (client/app/api/**/route.ts) → service/business layer → Mongoose → MongoDB Atlas`

- **API layer:** Next.js Route Handlers — **no Express**, no separate `server/` process.
- **Auth:** Auth.js (NextAuth) Credentials provider + `bcryptjs`.
- **Sessions:** stateless JWT (NFR-6), read server-side via `auth()`.
- **Response contract:** `{ "success": true, "data": … }` / `{ "success": false, "message": … }`.

**SRS §2.1 conflict (resolved):** SRS §2.1 states *"React frontend, Node.js/Express REST backend, MongoDB database"*, which contradicts SRS §5.3 (Next.js App Router full-stack) and the ERD ("all API endpoints … implemented as Next.js Route Handlers … not a separate Express server"). **Decision: Next.js Route Handlers + Auth.js.** The SRS §2.1 sentence should be corrected (follow-up, §12).

---

## 3. Technology stack & dependency compatibility (verified)

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | `16.3.6` |
| React | react / react-dom | `19.2.8` |
| Language | TypeScript (strict, alias `@/* → ./*`) | `^5` |
| Styling | Tailwind CSS v4, `lucide-react` | — |
| Lint | ESLint 9 + `eslint-config-next` (flat config) | `16.3.6` |
| Database | MongoDB Atlas + Mongoose | `mongoose ^9.11.1` |
| Auth | Auth.js / NextAuth | `next-auth ^5.0.0-beta.32` |
| Hashing | bcryptjs | `^3.0.3` |
| Validation | zod | `^4.6.5` |

Compatibility notes (confirmed against the installed packages):
- **Auth.js `5.0.0-beta.32` works with Next `16.3.6`** on the App Router (Credentials provider, JWT sessions, route handlers and `auth()` in server components verified). **No custom-JWT fallback is needed.**
- **`bcryptjs` v3 ships its own TypeScript types** — do **not** add `@types/bcryptjs`.
- **Next 16 renamed the `middleware` convention to `proxy.ts`.** The RBAC file must be `client/proxy.ts` (not `middleware.ts`).
- The Auth.js `JWT` interface is declared in **`@auth/core/jwt`** (the `next-auth/jwt` module only re-exports it). Type augmentation for `id`/`role` targets `@auth/core/jwt`.

---

## 4. Data model (Mongoose + MongoDB Atlas)

Conventions: all references are `ObjectId`; every schema uses `timestamps: true`. `User.password` is `required` with `select: false`.

**Reference targets (decided):** `Enrollment`, `Attendance`, and `Result` reference the **`Student` profile** (`Student._id`); `Course` references the **`Teacher` profile** (`Teacher._id`). `Student` and `Teacher` each reference `User`. `Announcement.postedBy` references `User` (admins and teachers are users).

### User
```ts
{
  name: string;                      // required
  email: string;                     // required, unique, lowercase, trimmed (indexed)
  password: string;                  // required, bcrypt hash, select:false
  role: "student" | "teacher" | "admin";  // required, enum, indexed
  phone?: string;                    // FR-2.2
  photo?: string;                    // FR-2.2 (URL)
  isActive: boolean;                 // FR-2.3 soft-deactivate, default true
  createdAt / updatedAt
}
```
Indexes: `email` (unique), `role`.

### Student (profile, 1:1 with User where role = student)
```ts
{ userId: ObjectId → User (unique), rollNo: string (unique), department: string, semester: number (1..12) }
```

### Teacher (profile, 1:1 with User where role = teacher)
```ts
{ userId: ObjectId → User (unique), department: string, designation?: string }
```

### Course
```ts
{ code: string (unique), title: string, teacherId: ObjectId → Teacher | null, semester: number, creditHours: number }
```
Indexes: `code` (unique), `teacherId`, `semester`.

### Enrollment (join: Student ↔ Course)
```ts
{ studentId: ObjectId → Student, courseId: ObjectId → Course, enrolledAt: Date }
```
Index: **compound unique `{ studentId, courseId }`** (prevents duplicate enrollment); `courseId`.

### Timetable
```ts
{ courseId: ObjectId → Course, day: "Monday".."Saturday", startTime: "HH:mm", endTime: "HH:mm", room: string }
```
Indexes: `courseId`; `{ day, startTime, endTime }`; `room`. Clash checks (FR-4.3) use the course's `teacherId` and `room`.

### Announcement
```ts
{ title: string, body: string, postedBy: ObjectId → User, createdAt: Date }
```
Index: `createdAt` (descending, newest-first).

### Attendance
```ts
{ courseId: ObjectId → Course, studentId: ObjectId → Student, date: Date (day granularity, UTC midnight), status: "present" | "absent" }
```
Index: **compound unique `{ courseId, studentId, date }`** — **one record per (course, student, date)**; plus `courseId`, `studentId`.

### Result
```ts
{ studentId: ObjectId → Student, courseId: ObjectId → Course, marks: number (0..100), grade: string }
```
Index: **compound unique `{ studentId, courseId }`**; `studentId`.

### GPA (FR-7.3 — decided)
Standard **4.0 scale**, **credit-weighted**: `GPA = Σ(gradePoint × creditHours) / Σ(creditHours)`.
Mapping: `A+/A 4.0, A- 3.7, B+ 3.3, B 3.0, B- 2.7, C+ 2.3, C 2.0, C- 1.7, D+ 1.3, D 1.0, F 0.0`.

### Attendance rules (decided)
One record per **(course, student, date)** (enforced by the unique index). Percentage per course = `present / total × 100`; courses below **75%** are highlighted (FR-6.3).

### Delete / integrity policy
- **`DELETE /api/users/:id` is a soft delete** — set `isActive: false`. Never hard-delete users.
- Inactive users cannot log in and are rejected by `auth()`.
- Referenced `Student` / `Teacher` / `Course` IDs must exist before insert (NFR-8).
- Deleting a `Course` (admin) removes its dependent Enrollments, Timetable slots, Attendance and Results.

---

## 5. API endpoints (Next.js Route Handlers under `client/app/api/`)

Base path `/api`. Protected handlers authenticate via `auth()` — the browser sends no manual token.

### 5.1 Auth
| Method | Route | Access |
|---|---|---|
| GET/POST | `/api/auth/[...nextauth]` | Public (Auth.js) |
| POST | `/api/auth/register` | Admin |
| GET | `/api/auth/me` | Authenticated |
| POST | `/api/auth/change-password` | Authenticated |

### 5.2 Users / Profile
| Method | Route | Access |
|---|---|---|
| GET | `/api/users` | Admin (`?role=`) |
| GET | `/api/users/:id` | Self or Admin |
| PUT | `/api/users/:id` | Self (phone/photo) or Admin (all fields) |
| DELETE | `/api/users/:id` | Admin — **soft delete** (`isActive: false`) |

### 5.3 Students / Teachers
| Method | Route | Access | Notes |
|---|---|---|---|
| GET | `/api/students/:id` | Self or Admin | **Added (not in current ERD)** |
| GET | `/api/students/:id/courses` | Self or Admin | |
| GET | `/api/teachers` | Admin | **Added (not in current ERD)** |
| GET | `/api/teachers/:id` | Self or Admin | **Added (not in current ERD)** |

### 5.4 Courses
| Method | Route | Access |
|---|---|---|
| GET | `/api/courses` | All (`?semester=`, `?teacherId=`) |
| POST | `/api/courses` | Admin |
| GET | `/api/courses/:id` | All |
| PUT | `/api/courses/:id` | Admin |
| DELETE | `/api/courses/:id` | Admin |
| POST | `/api/courses/:id/enroll` | Admin |
| GET | `/api/courses/:id/students` | Teacher (owner) or Admin |

### 5.5 Timetable
| Method | Route | Access |
|---|---|---|
| GET | `/api/timetable/me` | Student, Teacher |
| POST | `/api/timetable` | Admin |
| PUT | `/api/timetable/:id` | Admin |
| DELETE | `/api/timetable/:id` | Admin |

### 5.6 Announcements
| Method | Route | Access |
|---|---|---|
| GET | `/api/announcements` | All (`?page=`, newest first) |
| POST | `/api/announcements` | Teacher, Admin |
| PUT | `/api/announcements/:id` | Author (owner) |
| DELETE | `/api/announcements/:id` | Author **or Admin (override)** |

> Per decision: **Admin may delete any announcement**, not only their own. `PUT` remains owner-only.

### 5.7 Attendance
| Method | Route | Access | Body / Params |
|---|---|---|---|
| POST | `/api/attendance` | Teacher (own course) | `{ courseId, date, records: [{ studentId, status }] }` |
| GET | `/api/attendance/course/:courseId` | Teacher (owner) or Admin | `?date=` |
| GET | `/api/attendance/student/:studentId` | Student (self) or Admin | `?courseId=` → percentage per course |

### 5.8 Results
| Method | Route | Access |
|---|---|---|
| POST | `/api/results` | Teacher (own course) |
| PUT | `/api/results/:id` | Teacher (own course) |
| GET | `/api/results/student/:studentId` | Student (self) or Admin → results + GPA |

Every handler: validate input (zod), authenticate with `auth()`, authorize by role/ownership, verify referenced IDs exist, return the standard JSON contract, and never leak `password`.

---

## 6. Authentication & authorization (RBAC)

- **Provider:** Auth.js Credentials. `authorize` → validate (zod) → load `User` by email with `+password` → reject if missing or `isActive === false` → `bcrypt.compare` → return `{ id, name, email, role }`.
- **Session:** JWT strategy; `jwt`/`session` callbacks inject `id` and `role`; types augmented via `@auth/core/jwt` and `next-auth`.
- **RBAC file:** `client/proxy.ts` (Next 16 convention) using Auth.js `authorized` callback:
  - Protect `/student/**`, `/faculty/**`, `/admin/**`, and `/api/**` (excluding `/api/auth`).
  - Unauthenticated page request → redirect to `/login?callbackUrl=<path>`.
  - Unauthenticated API request → `401` JSON.
  - Role mismatch → redirect to the role's home.
- **Role homes:** student → `/student/dashboard`; teacher → `/faculty/dashboard`; admin → `/admin`.
- **Account creation:** Admin-only `POST /api/auth/register` for Student/Teacher accounts. **No public self-registration** (FR-1.2).
- **Change password:** verify current password, re-hash the new one.
- **Logout:** Auth.js `signOut()` wired to the sidebar "Sign out" button.

### Permission matrix
| Capability | Student | Teacher | Admin |
|---|---|---|---|
| View/edit own profile (phone, photo) | ✔ | ✔ | ✔ |
| View own courses / timetable / announcements / attendance / results | ✔ | ✔ (own courses) | ✔ (any) |
| Mark attendance (own courses) | ✖ | ✔ | ✔ (any) |
| Enter/update results (own courses) | ✖ | ✔ | ✔ (any) |
| Post announcements | ✖ | ✔ | ✔ |
| Edit own announcement | ✖ | ✔ | ✔ |
| Delete announcement | ✖ | own only | own + **any** (override) |
| Manage users (create/edit/soft-delete) | ✖ | ✖ | ✔ |
| CRUD courses / assign teacher / enroll | ✖ | ✖ | ✔ |
| CRUD timetable | ✖ | ✖ | ✔ |

---

## 7. Validation, errors & security

- **Validation:** zod schema per route (body, params, query). Reject unknown/malformed input with `400`.
- **Error contract:** `{ success: false, message }`; JSON parse failures return `400`.
- **Status codes:** `200` ok, `201` created, `400` bad request/validation, `401` unauth, `403` forbidden, `404` not found, `409` conflict (duplicate email/enrollment), `500` server error.
- **Security (NFR-2):** bcrypt cost `12`; `password` `select:false` and never serialized; secrets only in env; ownership checks on every self-scoped route; ObjectId format validation before queries; generic 500 messages (no stack/internal detail).

---

## 8. Frontend → API integration points

Minimum-change approach (no UI redesign): keep existing JSX, replace only the data source. Pages currently hold module-level mock constants and local `useState`; there is **no `fetch`/`axios` anywhere** today.

| Frontend location | Change |
|---|---|
| **NEW** `app/login/page.tsx` | Credentials form → `signIn()` |
| **NEW** `app/admin/**` | Admin dashboard, users, courses, enrollments, timetable, announcements |
| **NEW** `client/proxy.ts` | Role-based route protection (Next 16) |
| **NEW** `app/api/**` + `lib/db.ts` + `lib/models/**` + `lib/services/**` | Backend |
| `components/layout/Sidebar.tsx` / `FacultySidebar.tsx` | Wire "Sign out" → `signOut()`; fix `announcements` link; hide dead links |
| `components/layout/Topbar.tsx` / `FacultyTopbar.tsx` | Replace hardcoded identity with session data |
| `app/page.tsx` | Redirect by role (currently always `/student/dashboard`) |
| Student MVP pages (`dashboard`, `courses`, `courses/[courseId]`, `timetable`, `attendance`, `grades`, `annoucements`) | Fetch real data |
| Faculty MVP pages (`dashboard`, `courses`, `courses/[courseId]`, `students`, `students/[studentId]`, `timetable`, `attendance`, `grades`, `annoucements`, `profile`) | Fetch real data; wire attendance save, grade save, announcement CRUD, profile save |
| `lib/data.ts` | Retire mock `courses`; align `Course` type with API DTO |
| Out-of-scope pages | Leave as-is (mock) |

---

## 9. Environment & deployment

- **Local env file:** the Next app is in `client/`, so it reads **`client/.env.local`**. (A root `.env.example` is **not** loaded by Next — any earlier reference to populating the root file is incorrect.)
- Keep `client/.gitignore` ignoring `.env*`; add a tracked **`client/.env.example`** documenting the keys.
- **Vercel (prod):** set the same variables in Project → Settings → Environment Variables. `AUTH_URL` = deployment URL; `AUTH_TRUST_HOST=true`.

**Required variables:**
```
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority
AUTH_SECRET=<random 32+ byte secret>          # generate: npx auth secret
AUTH_URL=http://localhost:3000                 # deployment URL in prod
AUTH_TRUST_HOST=true
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Deployment:** Vercel (frontend + Route Handlers) + MongoDB Atlas (free tier per SRS §2.4/§5.3). Stateless handlers for horizontal scale (NFR-6).

---

## 10. Implementation order (fresh build)

1. **Foundation:** install deps (`mongoose`, `next-auth@beta`, `bcryptjs`, `zod`); `lib/db.ts` (cached connection); `lib/models/**`; `lib/api/response.ts`; `lib/constants.ts`; GPA/attendance helpers.
2. **Auth & RBAC:** `auth.config.ts` (edge-safe), `auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `/api/auth/register`, `/api/auth/me`, `/api/auth/change-password`, `client/proxy.ts`, `/login`, role redirect.
3. **Users / Profile:** `/api/users*`, `/api/students/:id*`, `/api/teachers*`.
4. **Courses & Enrollments:** `/api/courses*`, `:id/enroll`, `:id/students`.
5. **Timetable:** `/api/timetable*` with room + teacher clash validation.
6. **Announcements:** `/api/announcements*` (owner edit, owner/admin delete).
7. **Attendance:** `/api/attendance*` with upsert + percentage calculation.
8. **Results:** `/api/results*` + GPA.
9. **Admin UI:** `/admin/**` (dashboard, users, courses, enrollments, timetable, announcements).
10. **Frontend integration:** student pages, then faculty pages, then shared shell (identity/logout/link fixes). Minimum changes only.
11. **Testing:** per-role flows + authorization matrix.
12. **Production readiness:** `tsc --noEmit`, `eslint`, `next build`, local run, Vercel + Atlas verification.

---

## 11. Existing issues relevant to backend integration

Frontend (verified on GitHub `main`):
- **No login page, no Admin UI, no route guard / route protection** — the largest gaps.
- **Route typo:** the folders are `client/app/student/annoucements` and `client/app/faculty/annoucements`, but sidebars link to `/…/announcements` → broken links.
- **Dead faculty links:** `/faculty/help`, `/faculty/settings` (and other sidebar entries) have no pages.
- **Duplicate page files:** `faculty/students/page.tsx` ≡ `faculty/courses/[courseId]/page.tsx`; `faculty/grades/page.tsx` ≡ `faculty/assignments/[assignmentId]/page.tsx`.
- **Hardcoded identity** in `Topbar.tsx` (`Abdullah Muhammad`) and `FacultyTopbar.tsx`; **non-functional "Sign out"** in both sidebars.
- **Duplicate CSS:** `.form-select` base rule defined twice in `app/globals.css`.
- **No API client:** no `fetch`/`axios` anywhere — every MVP page is static mock data.
- **Aspirational endpoints** in out-of-scope faculty pages (e.g. `/api/faculty/attendance/session`, `/api/faculty/assignments/{id}/submissions`) — richer than the SRS/ERD and **deferred** with the rest of the out-of-scope features.

Deferred (leave as mock): assignments/submissions, events, fees, career, campus, complaints, resources, ai-copilot.

---

## 12. Resolved decisions & follow-up documentation changes

### Resolved (incorporated into this plan)
1. Stack = Next.js Route Handlers + Auth.js only; **no Express**. SRS §2.1 is contradictory and will be corrected.
2. Add a separate **`Teacher`** collection (`userId`, `department`, `designation`) and extend **`User`** with `phone`, `photo`, `isActive`.
3. `studentId`/`teacherId` in Enrollment, Timetable (via course), Attendance, Result reference the **`Student`/`Teacher`** collections — not `User` directly.
4. GPA = standard **4.0**, credit-weighted. Attendance = **one record per (course, student, date)**.
5. `DELETE /api/users/:id` = **soft delete** (`isActive: false`), never hard delete.
6. **Admin override** on `DELETE /api/announcements/:id` (can delete anyone's post). Keep the extra endpoints `GET /api/students/:id`, `GET /api/teachers`, `GET /api/teachers/:id`.
7. Discard the old `feature/backend-plan` and `feature/backend-foundation` branches/PRs; build fresh on this branch.
8. Env file is `client/.env.local` (not root). RBAC file is `client/proxy.ts` (Next 16). No `@types/bcryptjs`. Auth.js `5.0.0-beta.32` works with Next 16 — no custom-JWT fallback.

### Follow-up documentation changes (NOT applied here — for you to update separately)
- **ERD doc (`docs/ERD_and_API_List.md`):**
  - Add the endpoints **`GET /api/students/:id`**, **`GET /api/teachers`**, **`GET /api/teachers/:id`** (these are the "added" endpoints referenced above).
  - Note that `User` includes `phone`, `photo`, `isActive`.
  - Note that `*Id` references target the `Student` / `Teacher` collections (not `User`).
- **SRS doc (`docs/SRS_University_Super_App.md`), §2.1:** correct the stack sentence to *"Next.js (App Router) full-stack: React frontend + Route Handlers backend, MongoDB database."*

---

## STOP

Plan rewritten and awaiting your review/approval. Only `BACKEND_PLAN.md` was added on this branch; no application code, schemas, packages, or other documentation were modified.
