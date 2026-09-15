export type UserRole = "ADMIN" | "SUPER_ADMIN";

export function canAccess(
  userRole: UserRole | undefined,
  allowedRoles: UserRole[],
): boolean {
  if (!userRole) {
    return false;
  }

  return allowedRoles.includes(userRole);
}
