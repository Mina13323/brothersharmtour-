"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getToursList,
  getPackagesList,
  getInquiriesList,
  updateInquiryStatus,
  type Inquiry,
} from "@/lib/cms";
import {
  Compass,
  Package,
  Inbox,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  Phone,
  CheckCircle,
  ExternalLink,
  MessageSquare,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [tours, setTours] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [t, p, i] = await Promise.all([
          getToursList(),
          getPackagesList(),
          getInquiriesList(),
        ]);
        setTours(t);
        setPackages(p);
        setInquiries(i);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      await updateInquiryStatus(inquiryId, newStatus);
      setInquiries((prev) =>
        prev.map((item) =>
          item.id === inquiryId ? { ...item, status: newStatus as any } : item
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const activeTours = tours.filter((t) => t.active !== false);
  const pendingInquiries = inquiries.filter((i) => i.status === "new");

  return (
    <div className="space-y-8">
      {/* ─── Page Title Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Real-time management for Brother Sharm Tour excursions & packages
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/tours/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-semibold text-xs transition-colors shadow-xs"
          >
            <Plus className="size-4" />
            Add New Tour
          </Link>
          <Link
            href="/admin/packages/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/10 transition-colors"
          >
            <Package className="size-4 text-teal-400" />
            New Package
          </Link>
        </div>
      </div>

      {/* ─── Metric Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tours */}
        <div className="p-5 rounded-2xl bg-[#0f1b1e] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Total Tours
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Compass className="size-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {loading ? "..." : tours.length}
            </span>
            <span className="text-xs text-teal-400 font-medium">
              {activeTours.length} active
            </span>
          </div>
          <Link
            href="/admin/tours"
            className="mt-3 text-xs text-stone-400 hover:text-teal-400 flex items-center gap-1 transition-colors"
          >
            Manage tours <ArrowRight className="size-3" />
          </Link>
        </div>

        {/* Custom Packages */}
        <div className="p-5 rounded-2xl bg-[#0f1b1e] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Custom Packages
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Package className="size-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {loading ? "..." : packages.length}
            </span>
            <span className="text-xs text-emerald-400 font-medium">
              Bundled itineraries
            </span>
          </div>
          <Link
            href="/admin/packages"
            className="mt-3 text-xs text-stone-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            View packages <ArrowRight className="size-3" />
          </Link>
        </div>

        {/* Pending Inquiries */}
        <div className="p-5 rounded-2xl bg-[#0f1b1e] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              New Inquiries
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Inbox className="size-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {loading ? "..." : pendingInquiries.length}
            </span>
            <span className="text-xs text-amber-400 font-medium">
              Needs response
            </span>
          </div>
          <Link
            href="/admin/inquiries"
            className="mt-3 text-xs text-stone-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
          >
            Open inbox <ArrowRight className="size-3" />
          </Link>
        </div>

        {/* Pricing & Operations */}
        <div className="p-5 rounded-2xl bg-[#0f1b1e] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Database Sync
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <TrendingUp className="size-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-teal-400">
              Supabase Ready
            </span>
          </div>
          <Link
            href="/admin/settings"
            className="mt-3 text-xs text-stone-400 hover:text-sky-400 flex items-center gap-1 transition-colors"
          >
            Settings & Seeder <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>

      {/* ─── Recent Inquiries / Bookings ─── */}
      <div className="rounded-2xl bg-[#0f1b1e] border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Inbox className="size-4 text-teal-400" />
              Latest Booking Inquiries
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Direct guest booking requests and WhatsApp inquiries
            </p>
          </div>
          <Link
            href="/admin/inquiries"
            className="text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors"
          >
            View all ({inquiries.length})
          </Link>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-stone-400">
            Loading inquiries...
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-10 text-center">
            <Inbox className="size-8 mx-auto text-stone-600 mb-2" />
            <p className="text-sm text-stone-400">No booking inquiries yet.</p>
            <p className="text-xs text-stone-500 mt-1">
              Guest submissions through the booking drawer will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5 overflow-x-auto">
            {inquiries.slice(0, 5).map((inq) => (
              <div
                key={inq.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-sm text-white">
                      {inq.guest_name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        inq.status === "new"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : inq.status === "confirmed"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : inq.status === "contacted"
                          ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                          : "bg-white/10 text-stone-400"
                      }`}
                    >
                      {inq.status}
                    </span>
                  </div>
                  <p className="text-xs text-teal-400 font-medium">
                    {inq.tour_title || "General Inquiry"}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3 text-stone-500" />
                      {new Date(inq.created_at).toLocaleDateString()}
                    </span>
                    {inq.preferred_date && (
                      <span>Date: {inq.preferred_date}</span>
                    )}
                    <span>
                      {inq.adults} Adults
                      {inq.children > 0 && `, ${inq.children} Children`}
                    </span>
                    {inq.hotel && <span>Hotel: {inq.hotel}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <a
                    href={`https://wa.me/${inq.guest_phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors"
                  >
                    <MessageSquare className="size-3" />
                    WhatsApp
                  </a>
                  <select
                    value={inq.status}
                    onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-stone-300 focus:outline-none focus:border-teal-500"
                  >
                    <option value="new">Mark New</option>
                    <option value="contacted">Mark Contacted</option>
                    <option value="confirmed">Mark Confirmed</option>
                    <option value="completed">Mark Completed</option>
                    <option value="cancelled">Mark Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Quick Tours Summary ─── */}
      <div className="rounded-2xl bg-[#0f1b1e] border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="size-4 text-teal-400" />
              Active Excursions & Pricing
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Live pricing and catalog status
            </p>
          </div>
          <Link
            href="/admin/tours"
            className="text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors"
          >
            Manage all ({tours.length})
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/30 border-b border-white/10 text-stone-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Tour</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">From Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-stone-300">
              {tours.slice(0, 6).map((tour) => (
                <tr key={tour.slug} className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-5 font-medium text-white max-w-xs truncate">
                    {tour.title}
                  </td>
                  <td className="py-3.5 px-4 capitalize text-stone-400">
                    {tour.destination?.replace("-", " ") || "Sharm"}
                  </td>
                  <td className="py-3.5 px-4 text-stone-400">
                    {tour.duration}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-teal-300">
                    £{tour.from_price || tour.priceFrom || 0}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        tour.active !== false
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/15 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {tour.active !== false ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right space-x-2">
                    <Link
                      href={`/tours/${tour.slug}`}
                      target="_blank"
                      className="p-1.5 text-stone-400 hover:text-white inline-block"
                      title="Preview on site"
                    >
                      <ExternalLink className="size-3.5" />
                    </Link>
                    <Link
                      href={`/admin/tours/${tour.slug}`}
                      className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-stone-200 font-medium text-[11px] border border-white/10"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
