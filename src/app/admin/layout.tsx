import AdminShell from "@/components/admin/AdminShell";
import { isAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/store/repo";

/**
 * Admin layout — a server component. It reads the (already server-verified)
 * session so the shell can label the signed-in account, but every admin page
 * ALSO calls requireAdmin() itself and every /api/admin route re-checks the
 * session: the layout is presentation, not the security boundary.
 */

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdmin();
  const adminEmail = authed ? getSettings().admin.email : null;

  return (
    <AdminShell adminEmail={adminEmail}>{children}</AdminShell>
  );
}
