import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Compass,
  Inbox,
  Package as PackageIcon,
  Star,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import {
  allInquiries,
  allPackages,
  allReviews,
  allTours,
  integrityCheck,
} from "@/lib/store/repo";

/**
 * Admin dashboard: the state of the whole CMS at a glance — content counts,
 * the review moderation queue, the booking pipeline and the data-integrity
 * audit (orphans, duplicates, missing media, drafts, missing prices).
 */

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [tours, packages, reviews, inquiries, issues] = [
    allTours(),
    allPackages(),
    allReviews(),
    allInquiries(),
    integrityCheck(),
  ];

  const drafts = tours.filter((t) => t.status === "draft");
  const unverified = tours.filter((t) => !t.verified);
  const pendingReviews = reviews.filter((r) => r.status === "pending");
  const approvedReviews = reviews.filter((r) => r.status === "approved");
  const newInquiries = inquiries.filter((i) => i.status === "new");
  const openInquiries = inquiries.filter(
    (i) => !["completed", "cancelled"].includes(i.status),
  );

  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");

  const stats = [
    {
      label: "Published tours",
      value: tours.length - drafts.length,
      sub: `${drafts.length} draft${drafts.length === 1 ? "" : "s"} hidden from the site`,
      href: "/admin/tours",
      icon: Compass,
    },
    {
      label: "Custom packages",
      value: packages.filter((p) => p.status === "published").length,
      sub: `${packages.filter((p) => p.status === "draft").length} drafts`,
      href: "/admin/packages",
      icon: PackageIcon,
    },
    {
      label: "Reviews awaiting approval",
      value: pendingReviews.length,
      sub: `${approvedReviews.length} approved & live`,
      href: "/admin/reviews",
      icon: Star,
    },
    {
      label: "New booking requests",
      value: newInquiries.length,
      sub: `${openInquiries.length} open in the pipeline`,
      href: "/admin/inquiries",
      icon: Inbox,
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-stone-400 mt-1">
          Everything on the site is served live from this store — edits appear
          immediately, no rebuild needed.
        </p>
      </header>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="group bg-[#101c1f] border border-white/10 rounded-2xl p-5 hover:border-teal-500/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-stone-400">
                  {s.label}
                </span>
                <Icon className="size-4 text-teal-500/70" />
              </div>
              <p className="mt-3 text-3xl font-bold text-white">{s.value}</p>
              <p className="mt-1 text-[11px] text-stone-500">{s.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Integrity audit */}
      <section className="bg-[#101c1f] border border-white/10 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            {errors.length ? (
              <AlertTriangle className="size-5 text-red-400" />
            ) : (
              <CheckCircle2 className="size-5 text-teal-400" />
            )}
            <h2 className="text-sm font-semibold text-white">
              Data integrity audit
            </h2>
          </div>
          <span className="text-xs text-stone-400">
            {errors.length} error{errors.length === 1 ? "" : "s"} · {warnings.length}{" "}
            warning{warnings.length === 1 ? "" : "s"}
          </span>
        </div>
        {issues.length === 0 ? (
          <p className="px-5 py-6 text-sm text-stone-400">
            No problems found: no orphaned records, no duplicate slugs, all
            published tours have images and prices.
          </p>
        ) : (
          <ul className="divide-y divide-white/5 max-h-80 overflow-y-auto">
            {issues.map((issue, i) => (
              <li key={i} className="flex items-start gap-3 px-5 py-3">
                <span
                  className={`mt-0.5 size-2 shrink-0 rounded-full ${
                    issue.level === "error" ? "bg-red-400" : "bg-amber-400"
                  }`}
                />
                <div>
                  <p className="text-xs font-semibold text-stone-300">{issue.where}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{issue.message}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Attention list */}
      {(unverified.length > 0 || pendingReviews.length > 0 || newInquiries.length > 0) && (
        <section className="grid gap-4 md:grid-cols-3">
          {pendingReviews.length > 0 ? (
            <AttentionCard
              title={`${pendingReviews.length} review${pendingReviews.length === 1 ? "" : "s"} to moderate`}
              body="Nothing a customer submits is public until you approve it."
              href="/admin/reviews"
            />
          ) : null}
          {newInquiries.length > 0 ? (
            <AttentionCard
              title={`${newInquiries.length} new booking request${newInquiries.length === 1 ? "" : "s"}`}
              body="Move each one through contacted → confirmed → completed."
              href="/admin/inquiries"
            />
          ) : null}
          {unverified.length > 0 ? (
            <AttentionCard
              title={`${unverified.length} tour${unverified.length === 1 ? "" : "s"} unverified`}
              body="Commercial details still awaiting operations sign-off — the site shows a notice on these."
              href="/admin/tours"
            />
          ) : null}
        </section>
      )}
    </div>
  );
}

function AttentionCard({
  title,
  body,
  href,
}: {
  title: string;
  body: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-amber-500/[0.06] border border-amber-500/20 rounded-2xl p-5 hover:border-amber-500/40 transition-colors"
    >
      <p className="text-sm font-semibold text-amber-200">{title}</p>
      <p className="mt-1.5 text-xs text-stone-400 leading-relaxed">{body}</p>
      <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300">
        Open <ArrowRight className="size-3" />
      </span>
    </Link>
  );
}
