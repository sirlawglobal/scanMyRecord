import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/programmes", label: "Programmes" },
  { href: "/admin/fundraising", label: "Fundraising" },
  { href: "/admin/qr-codes", label: "QR Codes" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/administrators", label: "Administrators" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("smr_session")?.value;

  if (!sessionToken) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-6">
        <aside className="hidden w-72 shrink-0 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-elevated lg:block">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">Scan My Record</p>
            <h2 className="mt-2 font-display text-xl font-semibold text-slate-900">Admin</h2>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 border-t border-slate-200 pt-4">
            <LogoutButton />
          </div>
        </aside>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
