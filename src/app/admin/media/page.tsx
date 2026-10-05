import { requireAdmin } from "@/lib/auth";
import { MediaLibrary } from "@/components/admin/MediaLibrary";

/**
 * Media library — uploads are written to the runtime uploads directory and are
 * referenced from tour/package editors by their /uploads/... URL. Validation
 * (type, size, magic bytes) happens server-side in lib/uploads.
 *
 * Server-guarded like every other CMS screen: requireAdmin() runs before any
 * markup is produced, so an anonymous visitor never receives the admin shell.
 */

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  await requireAdmin();
  return <MediaLibrary />;
}
