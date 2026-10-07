"use client";

import { useState } from "react";
import { Select } from "@/components/Select";
import { useRouter } from "next/navigation";
import { Trash2, ChevronDown } from "lucide-react";

export interface AdminInquiry {
  id: string;
  tourSlug: string | null;
  tourTitle: string | null;
  guestName: string;
  guestEmail: string | null;
  guestPhone: string;
  preferredDate: string | null;
  adults: number;
  children: number;
  hotel: string | null;
  roomNumber: string | null;
  notes: string | null;
  source: string;
  currency: string | null;
  status: "new" | "contacted" | "confirmed" | "completed" | "cancelled";
  adminNotes: string | null;
  emailStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUSES: AdminInquiry["status"][] = [
  "new",
  "contacted",
  "confirmed",
  "completed",
  "cancelled",
];

const STATUS_STYLE: Record<AdminInquiry["status"], string> = {
  new: "text-amber-300 bg-amber-500/10 border-amber-500/20",
  contacted: "text-sky-300 bg-sky-500/10 border-sky-500/20",
  confirmed: "text-teal-300 bg-teal-500/10 border-teal-500/20",
  completed: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  cancelled: "text-stone-400 bg-white/5 border-white/10",
};

export function InquiryTable({ initialInquiries }: { initialInquiries: AdminInquiry[] }) {
  const router = useRouter();
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [filter, setFilter] = useState<"all" | AdminInquiry["status"]>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const visible = inquiries.filter((i) => filter === "all" || i.status === filter);

  async function patch(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setInquiries((list) => list.map((i) => (i.id === id ? data.inquiry : i)));
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" });
      if (res.ok) {
        setInquiries((list) => list.filter((i) => i.id !== id));
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  }

  const counts = (["all", ...STATUSES] as const).reduce<Record<string, number>>((acc, f) => {
    acc[f] = f === "all" ? inquiries.length : inquiries.filter((i) => i.status === f).length;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["all", ...STATUSES] as const).map((f) => (
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

      {visible.length === 0 ? (
        <div className="bg-[#101c1f] border border-white/10 rounded-2xl px-6 py-10 text-center">
          <p className="text-sm text-stone-400">
            No {filter === "all" ? "" : filter} inquiries yet.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((inquiry) => {
            const open = openId === inquiry.id;
            return (
              <li
                key={inquiry.id}
                className="bg-[#101c1f] border border-white/10 rounded-2xl overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <button
                    onClick={() => setOpenId(open ? null : inquiry.id)}
                    className="flex flex-1 items-center gap-3 text-left min-w-0"
                  >
                    <ChevronDown
                      className={`size-4 text-stone-500 transition-transform ${open ? "rotate-180" : ""}`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {inquiry.guestName}
                        <span className="text-stone-500 font-normal">
                          {" "}
                          · {inquiry.tourTitle ?? "general enquiry"}
                        </span>
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {new Date(inquiry.createdAt).toLocaleString("en-GB")}
                        {inquiry.preferredDate ? ` · for ${inquiry.preferredDate}` : ""}
                        {` · ${inquiry.adults} adult${inquiry.adults === 1 ? "" : "s"}`}
                        {inquiry.children ? `, ${inquiry.children} children` : ""}
                        {inquiry.currency ? ` · saw ${inquiry.currency}` : ""}
                        {inquiry.emailStatus === "failed" ? " · email FAILED" : ""}
                        {inquiry.emailStatus === "not-configured" ? " · email not configured" : ""}
                      </p>
                    </div>
                  </button>

                  <Select dark
                    value={inquiry.status}
                    disabled={busyId === inquiry.id}
                    onChange={(e) => patch(inquiry.id, { status: e.target.value })}
                    className={`text-[11px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-1 border bg-transparent focus:outline-none cursor-pointer ${STATUS_STYLE[inquiry.status]}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-[#101c1f] text-white">
                        {s}
                      </option>
                    ))}
                  </Select>

                  <a
                    href={`https://wa.me/${inquiry.guestPhone.replace(/[^\d]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-teal-400 hover:text-teal-300 whitespace-nowrap"
                  >
                    WhatsApp
                  </a>
                </div>

                {open ? (
                  <div className="border-t border-white/10 px-5 py-4 space-y-4 bg-black/20">
                    <div className="grid gap-3 sm:grid-cols-2 text-xs">
                      <Detail label="Phone / WhatsApp" value={inquiry.guestPhone} />
                      <Detail label="Email" value={inquiry.guestEmail ?? "—"} />
                      <Detail
                        label="Hotel"
                        value={
                          inquiry.hotel
                            ? `${inquiry.hotel}${inquiry.roomNumber ? ` · room ${inquiry.roomNumber}` : ""}`
                            : "—"
                        }
                      />
                      <Detail label="Source" value={inquiry.source} />
                      <Detail label="Preferred date" value={inquiry.preferredDate ?? "—"} />
                      <Detail label="Display currency" value={inquiry.currency ?? "—"} />
                    </div>
                    {inquiry.notes ? (
                      <div>
                        <p className="text-[11px] font-semibold text-stone-400 mb-1">Guest notes</p>
                        <p className="text-xs text-stone-300 whitespace-pre-line leading-relaxed">
                          {inquiry.notes}
                        </p>
                      </div>
                    ) : null}
                    <div>
                      <p className="text-[11px] font-semibold text-stone-400 mb-1.5">
                        Internal notes (never shown to guests)
                      </p>
                      <textarea
                        rows={2}
                        defaultValue={inquiry.adminNotes ?? ""}
                        onBlur={(e) => {
                          if (e.target.value !== (inquiry.adminNotes ?? ""))
                            patch(inquiry.id, { adminNotes: e.target.value });
                        }}
                        placeholder="Pickup time confirmed, waiting for passport photo…"
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-teal-500/60"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => remove(inquiry.id)}
                        disabled={busyId === inquiry.id}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-300 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 rounded-lg px-2.5 py-1.5 disabled:opacity-40"
                      >
                        <Trash2 className="size-3.5" /> Delete record
                      </button>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">{label}</p>
      <p className="text-stone-300 mt-0.5">{value}</p>
    </div>
  );
}
