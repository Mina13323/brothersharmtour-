"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Compass,
  Package,
  Inbox,
  Settings,
  LayoutDashboard,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  Star,
  Images,
  Tags,
} from "lucide-react";

/**
 * Admin chrome. Purely presentational — real authorization happens
 * server-side in every admin page (requireAdmin) and every /api/admin route
 * (isAdmin). This component contains no auth logic and no bypasses.
 */

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Tours & Pricing", href: "/admin/tours", icon: Compass },
  { name: "Custom Packages", href: "/admin/packages", icon: Package },
  { name: "Experience Categories", href: "/admin/experiences", icon: Tags },
  { name: "Inquiries & Bookings", href: "/admin/inquiries", icon: Inbox },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Media Library", href: "/admin/media", icon: Images },
  { name: "Site Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminShell({
  children,
  adminEmail,
}: {
  children: React.ReactNode;
  adminEmail: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  /*
   * The CMS is an English, left-to-right tool. The root layout derives <html dir>
   * from the visitor's language cookie, so without this an admin who browsed the
   * site in Arabic would get a mirrored CMS. Pin it here and restore on leave.
   */
  useEffect(() => {
    const html = document.documentElement;
    const prev = { dir: html.dir, lang: html.lang };
    html.dir = "ltr";
    html.lang = "en";
    return () => {
      html.dir = prev.dir;
      html.lang = prev.lang;
    };
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  if (isLoginPage) {
    return (
      <div dir="ltr" lang="en" className="admin-scope min-h-screen bg-stone-900 text-stone-100">
        {children}
      </div>
    );
  }

  return (
    <div dir="ltr" lang="en" className="admin-scope min-h-screen bg-[#0d1618] text-stone-100 flex flex-col md:flex-row antialiased font-sans">
      {/* ─── Mobile Header ─── */}
      <div className="md:hidden flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0a1214]">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold text-sm">
            BS
          </div>
          <div>
            <span className="font-bold text-sm text-white tracking-wide block">
              BROTHER SHARM
            </span>
            <span className="text-[10px] text-teal-400 font-medium tracking-wider uppercase">
              Admin Portal
            </span>
          </div>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-stone-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* ─── Sidebar Navigation (Desktop) ─── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a1214] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 overflow-y-auto">
          <Link
            href="/admin"
            className="flex items-center gap-3 group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500/30 to-emerald-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold text-base shadow-sm">
              BS
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-wide block group-hover:text-teal-400 transition-colors">
                Brother Sharm
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-teal-400 font-medium">
                <ShieldCheck className="size-3" />
                <span>Admin CMS</span>
              </div>
            </div>
          </Link>

          <nav className="mt-8 space-y-1.5">
            {navigation.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-xs"
                      : "text-stone-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className={`size-4 ${active ? "text-teal-400" : "text-stone-400"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer & Public Site Link */}
        <div className="p-5 border-t border-white/10 space-y-3 bg-black/20">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-stone-300 font-medium border border-white/10 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-teal-400" />
              Live Website
            </span>
            <ExternalLink className="size-3 text-stone-400" />
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="truncate max-w-[130px]">
              <p className="text-xs font-semibold text-white truncate">
                {adminEmail ?? "Admin"}
              </p>
              <p className="text-[10px] text-stone-400">Authenticated</p>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Canvas ─── */}
      <main className="flex-1 min-h-screen overflow-y-auto bg-[#0c1517] p-5 sm:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
