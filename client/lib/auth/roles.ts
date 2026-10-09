import { USER_ROLES, type UserRole } from "@/lib/constants";

export const ROLE_HOME: Record<UserRole, string> = {
  student: "/student/dashboard",
  teacher: "/faculty/dashboard",
  admin: "/admin",
};

export function homeForRole(role: UserRole): string {
  return ROLE_HOME[role];
}

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && (USER_ROLES as readonly string[]).includes(value);
}

export function canAccess(role: UserRole, pathname: string): boolean {
  if (role === "admin") return true;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return false;
  if (pathname === "/student" || pathname.startsWith("/student/")) return role === "student";
  if (pathname === "/faculty" || pathname.startsWith("/faculty/")) return role === "teacher";
  return true;
}
