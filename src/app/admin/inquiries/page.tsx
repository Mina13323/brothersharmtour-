import { requireAdmin } from "@/lib/auth";
import { allInquiries, allTours } from "@/lib/store/repo";
import { InquiryTable } from "@/components/admin/InquiryTable";

/**
 * Booking pipeline. Each inquiry carries the full lifecycle
 * NEW → CONTACTED → CONFIRMED → COMPLETED (or CANCELLED), the email delivery
 * outcome, and the currency the guest was viewing when they submitted.
 */

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  await requireAdmin();
  const inquiries = allInquiries();
  const tourTitles = new Map(allTours().map((t) => [t.slug, t.title]));

  const serialisable = inquiries
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((i) => ({
      id: i.id,
      tourSlug: i.tourSlug,
      tourTitle: i.tourTitle ?? (i.tourSlug ? (tourTitles.get(i.tourSlug) ?? null) : null),
      guestName: i.guestName,
      guestEmail: i.guestEmail,
      guestPhone: i.guestPhone,
      preferredDate: i.preferredDate,
      adults: i.adults,
      children: i.children,
      hotel: i.hotel ?? null,
      roomNumber: i.roomNumber ?? null,
      notes: i.notes ?? null,
      source: i.source,
      currency: i.currency ?? null,
      status: i.status,
      adminNotes: i.adminNotes ?? null,
      emailStatus: i.emailStatus ?? null,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Inquiries &amp; Bookings</h1>
        <p className="text-sm text-stone-400 mt-1">
          Every booking request from the site lands here. Move each one through
          contacted → confirmed → completed as you work it.
        </p>
      </header>
      <InquiryTable initialInquiries={serialisable} />
    </div>
  );
}
