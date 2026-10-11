/**
 * Shared server-side helpers for admin department scope (RBAC).
 *
 * Permissions come ONLY from the role and `assignedDepartment` (never from the
 * designation text). An admin whose `assignedDepartment` is set is a department
 * admin: they may only manage students/teachers/courses/fields/enrollments of
 * that department and may not create admins. Admins without an
 * `assignedDepartment` are super admins.
 */

export type AdminScope = {
  userId: string;
  assignedDepartment: string | null;
  /** True when the admin has no department scope (super admin). */
  isSuper: boolean;
};

/**
 * Extracts the admin scope from a session. Returns null when the caller is not
 * an admin (or not authenticated), so routes can 403 immediately.
 */
export function getAdminScope(
  session: { user?: unknown } | null | undefined
): AdminScope | null {
  const user = (session?.user ?? null) as
    | { id?: string; role?: string; assignedDepartment?: string | null }
    | null;
  if (!user || user.role !== "admin" || !user.id) return null;
  const assignedDepartment = user.assignedDepartment ?? null;
  return {
    userId: user.id,
    assignedDepartment,
    isSuper: !assignedDepartment,
  };
}

/**
 * True for an admin that is limited to exactly one department.
 */
export function isDepartmentAdmin(scope: AdminScope | null): boolean {
  return !!scope && !scope.isSuper;
}

/**
 * Compares a target's departmentId against the admin's scope and returns false
 * (forbidden) when a department admin tries to touch another department.
 */
export function canManageDepartment(
  scope: AdminScope | null,
  departmentId: string | null | undefined
): boolean {
  if (!scope) return false;
  if (scope.isSuper) return true;
  return !!departmentId && departmentId.toString() === scope.assignedDepartment;
}