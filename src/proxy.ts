import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";
import { canAccess, type UserRole } from "@/lib/auth/rbac";

const SUPER_ADMIN_ONLY_PREFIXES = ["/admin/administrators"];

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    if (token) {
      response.cookies.delete(SESSION_COOKIE);
    }
    return response;
  }

  const requiresSuperAdmin = SUPER_ADMIN_ONLY_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );

  if (requiresSuperAdmin && !canAccess(session.role as UserRole, ["SUPER_ADMIN"])) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
