"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, EyeOff, RotateCcw, Trash2, BadgeCheck } from "lucide-react";

export interface AdminReview {
  id: string;
  tourSlug: string | null;
  tourTitle: string | null;
  name: string;
  email: string;
  country: string | null;
  rating: number;
  title: string | null;
  body: string;
  bookingRef: string | null;
  photos: string[];
  status: "pending" | "approved" | "rejected" | "hidden";
  verified: boolean;
  adminNotes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  publishedAt: string | null;
}

const FILTERS = ["pending", "approved", "hidden", "rejected", "all"] as const;

const STATUS_STYLE: Record<AdminReview["status"], string> = {
  pending: "text-amber-300 bg-amber-500/10 border-amber-500/20",
  approved: "text-teal-300 bg-teal-500/10 border-teal-500/20",
  rejected: "text-red-300 bg-red-500/10 border-red-500/20",
  hidden: "text-stone-400 bg-white/5 border-white/10",
};

export function ReviewQueue({ initialReviews }: { initialReviews: AdminReview[] }) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visible = reviews.filter((r) => filter === "all" || r.status === filter);

  async function act(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? "Action failed.");
        return;
      }
      setReviews((list) => list.map((r) => (r.id === id ? data.review : r)));
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviews((list) => list.filter((r) => r.id !== id));
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  }

  const counts = FILTERS.reduce<Record<string, number>>((acc, f) => {
    acc[f] = f === "all" ? reviews.length : reviews.filter((r) => r.status === f).length;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
              filter === f
                ? "bg-teal-600 text-white"
                : "bg-white/5 text-stone-400 hover:text-white border border-white/10"
            }`}
          >
            {f} · {counts[f] ?? 0}
          </button>
        ))}
      </div>

      {error ? (
        <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
          {error}
        </p>
      ) : null}

      {visible.length === 0 ? (
        <div className="bg-[#101c1f] border border-white/10 rounded-2xl px-6 py-10 text-center">
          <p className="text-sm text-stone-400">
            {filter === "pending"
              ? "Nothing waiting for moderation — the public review form feeds this queue."
              : `No ${filter} reviews.`}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {visible.map((review) => (
            <li
              key={review.id}
              className="bg-[#101c1f] border border-white/10 rounded-2xl p-5 space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white">{review.name}</span>
                    {review.country ? (
                      <span className="text-[11px] text-stone-500">{review.country}</span>
                    ) : null}
                    <span className="text-amber-400 text-sm" aria-label={`${review.rating} of 5`}>
                      {"★".repeat(review.rating)}
                      <span className="text-stone-700">{"★".repeat(5 - review.rating)}</span>
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 border ${STATUS_STYLE[review.status]}`}
                    >
                      {review.status}
                    </span>
                    {review.verified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-300 bg-teal-500/10 border border-teal-500/20 rounded-full px-2 py-0.5">
                        <BadgeCheck className="size-3" /> verified booking
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    {review.tourTitle ?? "General operator review"} · submitted{" "}
                    {new Date(review.submittedAt).toLocaleString("en-GB")}
                    {review.bookingRef ? ` · ref ${review.bookingRef}` : ""} · {review.email}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {review.status !== "approved" ? (
                    <ActionButton
                      onClick={() => act(review.id, { status: "approved" })}
                      disabled={busyId === review.id}
                      title="Approve — makes the review public"
                      tone="go"
                    >
                      <Check className="size-3.5" /> Approve
                    </ActionButton>
                  ) : null}
                  {review.status !== "rejected" ? (
                    <ActionButton
                      onClick={() => act(review.id, { status: "rejected" })}
                      disabled={busyId === review.id}
                      title="Reject — never shown publicly"
                      tone="stop"
                    >
                      <X className="size-3.5" /> Reject
                    </ActionButton>
                  ) : null}
                  {review.status === "approved" ? (
                    <ActionButton
                      onClick={() => act(review.id, { status: "hidden" })}
                      disabled={busyId === review.id}
                      title="Temporarily hide from the site"
                    >
                      <EyeOff className="size-3.5" /> Hide
                    </ActionButton>
                  ) : null}
                  {review.status !== "pending" ? (
                    <ActionButton
                      onClick={() => act(review.id, { status: "pending" })}
                      disabled={busyId === review.id}
                      title="Back to the moderation queue"
                    >
                      <RotateCcw className="size-3.5" /> Re-open
                    </ActionButton>
                  ) : null}
                  <ActionButton
                    onClick={() => act(review.id, { verified: !review.verified })}
                    disabled={busyId === review.id}
                    title="Mark the booking as verified against an inquiry"
                  >
                    <BadgeCheck className="size-3.5" /> {review.verified ? "Unverify" : "Verify"}
                  </ActionButton>
                  <ActionButton
                    onClick={() => remove(review.id)}
                    disabled={busyId === review.id}
                    title="Delete permanently (removes uploaded photos too)"
                    tone="stop"
                  >
                    <Trash2 className="size-3.5" />
                  </ActionButton>
                </div>
              </div>

              {review.title ? (
                <p className="font-semibold text-stone-200 text-sm">{review.title}</p>
              ) : null}
              <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-line">
                {review.body}
              </p>
              {review.photos.length ? (
                <div className="flex gap-2">
                  {review.photos.map((src) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={src}
                      src={src}
                      alt="Customer photo"
                      className="size-16 object-cover rounded-lg border border-white/10"
                    />
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  title,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  tone?: "go" | "stop";
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center gap-1 text-[11px] font-semibold rounded-lg px-2.5 py-1.5 border transition-colors disabled:opacity-40 ${
        tone === "go"
          ? "text-teal-300 border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20"
          : tone === "stop"
            ? "text-red-300 border-red-500/30 bg-red-500/10 hover:bg-red-500/20"
            : "text-stone-300 border-white/10 bg-white/5 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}
