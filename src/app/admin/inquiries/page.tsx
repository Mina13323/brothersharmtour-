"use client";

import { useEffect, useState } from "react";
import { getInquiriesList, updateInquiryStatus, type Inquiry } from "@/lib/cms";
import {
  Inbox,
  Clock,
  Phone,
  MessageSquare,
  Hotel,
  Users,
  Search,
  CheckCircle,
  FileText,
} from "lucide-react";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");

  useEffect(() => {
    loadInquiries();
  }, []);

  async function loadInquiries() {
    setLoading(true);
    try {
      const data = await getInquiriesList();
      setInquiries(data);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateInquiryStatus(id, newStatus);
      setInquiries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: newStatus as any } : i))
      );
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      const inquiry = inquiries.find((i) => i.id === id);
      if (!inquiry) return;
      await updateInquiryStatus(id, inquiry.status, notesDraft);
      setInquiries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, admin_notes: notesDraft } : i))
      );
      setEditingNotesId(null);
    } catch (err) {
      alert("Failed to save notes");
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.guest_name.toLowerCase().includes(search.toLowerCase()) ||
      inq.guest_phone.toLowerCase().includes(search.toLowerCase()) ||
      (inq.tour_title && inq.tour_title.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Inbox className="size-6 text-teal-400" />
            Inquiries & Bookings
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Manage incoming guest reservation requests and coordinate pickups
          </p>
        </div>
      </div>

      {/* ─── Search & Status Filters ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="size-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by guest name, phone, or excursion..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0f1b1e] border border-white/10 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-teal-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#0f1b1e] border border-white/10 text-stone-300 text-xs focus:outline-none focus:border-teal-500"
        >
          <option value="all">All Statuses ({inquiries.length})</option>
          <option value="new">New ({inquiries.filter((i) => i.status === "new").length})</option>
          <option value="contacted">Contacted</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* ─── Inquiries List ─── */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-sm text-stone-400 rounded-2xl bg-[#0f1b1e] border border-white/10">
            Loading inquiries...
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0f1b1e] border border-white/10">
            <Inbox className="size-8 mx-auto text-stone-600 mb-2" />
            <p className="text-sm text-stone-400">No inquiries found.</p>
          </div>
        ) : (
          filteredInquiries.map((inq) => {
            const cleanPhone = inq.guest_phone.replace(/\D/g, "");
            return (
              <div
                key={inq.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#0f1b1e] border border-white/10 space-y-4 hover:border-white/20 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-base text-white">
                      {inq.guest_name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        inq.status === "new"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : inq.status === "confirmed"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : inq.status === "contacted"
                          ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                          : inq.status === "completed"
                          ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                          : "bg-red-500/20 text-red-300 border border-red-500/30"
                      }`}
                    >
                      {inq.status}
                    </span>
                  </div>

                  {/* Actions & WhatsApp button */}
                  <div className="flex items-center gap-2.5">
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <MessageSquare className="size-3.5" />
                      Chat on WhatsApp
                    </a>

                    <select
                      value={inq.status}
                      onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-stone-200 focus:outline-none focus:border-teal-500"
                    >
                      <option value="new">Status: New</option>
                      <option value="contacted">Status: Contacted</option>
                      <option value="confirmed">Status: Confirmed</option>
                      <option value="completed">Status: Completed</option>
                      <option value="cancelled">Status: Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Excursion & Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-black/30 p-3.5 rounded-xl border border-white/5">
                  <div>
                    <span className="text-stone-500 block">Excursion</span>
                    <span className="font-semibold text-teal-300">
                      {inq.tour_title || "General Booking Request"}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-500 block">Preferred Date</span>
                    <span className="font-medium text-stone-200">
                      {inq.preferred_date || "Flexible"}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-500 block">Party Size</span>
                    <span className="font-medium text-stone-200">
                      {inq.adults} Adults
                      {inq.children > 0 && `, ${inq.children} Children`}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-500 block">Hotel / Zone</span>
                    <span className="font-medium text-stone-200">
                      {inq.hotel
                        ? `${inq.hotel}${inq.room_number ? ` (Room ${inq.room_number})` : ""}`
                        : "Not specified"}
                    </span>
                  </div>
                </div>

                {inq.notes && (
                  <div className="text-xs text-stone-300 bg-white/5 p-3 rounded-lg border border-white/5">
                    <span className="text-stone-500 block mb-0.5">Guest Note:</span>
                    {inq.notes}
                  </div>
                )}

                {/* Internal Admin Note */}
                <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-stone-400">
                    <Clock className="size-3 text-stone-500" />
                    <span>Received: {new Date(inq.created_at).toLocaleString()}</span>
                    <span>•</span>
                    <Phone className="size-3 text-stone-500" />
                    <span className="font-mono">{inq.guest_phone}</span>
                  </div>

                  {editingNotesId === inq.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        placeholder="Internal note (pickup time, guide assigned...)"
                        className="px-2.5 py-1 rounded-md bg-black/50 border border-white/20 text-white text-xs w-64"
                      />
                      <button
                        onClick={() => handleSaveNotes(inq.id)}
                        className="px-2.5 py-1 rounded-md bg-teal-500 text-black font-semibold text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingNotesId(null)}
                        className="text-stone-400 hover:text-white text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingNotesId(inq.id);
                        setNotesDraft(inq.admin_notes || "");
                      }}
                      className="text-stone-400 hover:text-teal-400 text-xs flex items-center gap-1 transition-colors"
                    >
                      <FileText className="size-3" />
                      {inq.admin_notes
                        ? `Note: ${inq.admin_notes}`
                        : "+ Add internal team note"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
