import { requireAdmin } from "@/lib/auth";
import { SettingsForm } from "@/components/admin/SettingsForm";

/**
 * Site settings — contact details, social links (the single source of truth
 * the whole site reads), announcement bar, admin-confirmed trust claims,
 * currency rules and email notifications. SMTP credentials are env-only and
 * never appear here.
 *
 * Server-guarded like every other CMS screen: requireAdmin() runs before any
 * markup is produced, so an anonymous visitor never receives the admin shell.
 */

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  return <SettingsForm />;
}
