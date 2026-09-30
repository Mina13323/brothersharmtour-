"use client";

import { useEffect, useState } from "react";
import {
  getSiteSettings,
  saveSiteSettings,
  seedSupabaseDatabase,
  type SiteSettings,
} from "@/lib/cms";
import {
  Settings,
  Save,
  Database,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const s = await getSiteSettings();
        setSettings(s);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setStatusMsg(null);

    try {
      await saveSiteSettings(settings);
      setStatusMsg({
        type: "success",
        text: "Site settings updated successfully!",
      });
    } catch (err: unknown) {
      setStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSeedDatabase = async () => {
    if (
      !confirm(
        "This will upload and sync all existing 20+ tours and reviews into your Supabase database. Proceed?"
      )
    ) {
      return;
    }

    setSeeding(true);
    setStatusMsg(null);

    try {
      const result = await seedSupabaseDatabase();
      setStatusMsg({
        type: "success",
        text: `Success! Synced ${result.toursCount} tours and reviews into Supabase.`,
      });
    } catch (err: unknown) {
      setStatusMsg({
        type: "error",
        text:
          "Seeding note: If your Supabase tables do not exist yet, make sure to execute the SQL Schema in your Supabase SQL Editor first. Details: " +
          (err instanceof Error ? err.message : String(err)),
      });
    } finally {
      setSeeding(false);
    }
  };

  const sqlSchemaPreview = `-- In your Supabase Dashboard:
-- 1. Click "SQL Editor" on the left menu
-- 2. Click "New Query"
-- 3. Paste the contents of supabase/schema.sql and click "Run"`;

  const copySqlGuide = () => {
    navigator.clipboard.writeText(sqlSchemaPreview);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  if (loading || !settings) {
    return (
      <div className="p-12 text-center text-stone-400">Loading settings...</div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Settings className="size-6 text-teal-400" />
            Site Settings & Database
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Manage contact channels, WhatsApp numbers, and Supabase synchronization
          </p>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start gap-2.5 ${
            statusMsg.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
              : "bg-red-500/10 border border-red-500/20 text-red-300"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="size-5 shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="size-5 shrink-0 text-red-400 mt-0.5" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* ─── Database Seeder Card ─── */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-950/40 via-[#0f1b1e] to-black border border-teal-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
              <Database className="size-4" /> Supabase 1-Click Sync
            </div>
            <h2 className="text-lg font-bold text-white">
              Populate Supabase with Current Tours & Reviews
            </h2>
            <p className="text-xs text-stone-400 max-w-xl">
              Sync all excursions, itineraries, pricing, and guest testimonials from the local catalog directly into your connected Supabase PostgreSQL database.
            </p>
          </div>

          <button
            type="button"
            disabled={seeding}
            onClick={handleSeedDatabase}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs shadow-md shadow-teal-500/20 transition-all self-start sm:self-center disabled:opacity-50"
          >
            <Sparkles className="size-4" />
            {seeding ? "Syncing Catalog..." : "Sync Database Now"}
          </button>
        </div>

        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-400">
          <span>Schema file generated at: <code className="text-teal-300">supabase/schema.sql</code></span>
          <button
            type="button"
            onClick={copySqlGuide}
            className="text-stone-300 hover:text-white flex items-center gap-1.5 self-start"
          >
            {copiedSql ? (
              <>
                <Check className="size-3.5 text-teal-400" /> Copied instructions!
              </>
            ) : (
              <>
                <Copy className="size-3.5" /> Copy instructions
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── Contact Info & Site Form ─── */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 rounded-2xl bg-[#0f1b1e] border border-white/10 space-y-4">
          <h2 className="text-sm font-bold text-teal-400 uppercase tracking-wider">
            Contact & Operations Info
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="size-3.5 text-teal-400" /> Primary WhatsApp Number *
              </label>
              <input
                type="text"
                required
                value={settings.whatsappNumber}
                onChange={(e) =>
                  setSettings({ ...settings, whatsappNumber: e.target.value })
                }
                placeholder="+20 100 000 0000"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-teal-500"
              />
              <span className="text-[11px] text-stone-500 mt-1 block">
                Direct destination number for guest booking inquiries
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="size-3.5 text-teal-400" /> Direct Phone Hotline
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) =>
                  setSettings({ ...settings, phone: e.target.value })
                }
                placeholder="+20 100 000 0000"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="size-3.5 text-teal-400" /> Support Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) =>
                  setSettings({ ...settings, email: e.target.value })
                }
                placeholder="info@brothersharmtour.com"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="size-3.5 text-teal-400" /> Sharm El Sheikh Office
              </label>
              <input
                type="text"
                value={settings.officeSharm}
                onChange={(e) =>
                  setSettings({ ...settings, officeSharm: e.target.value })
                }
                placeholder="Naama Bay, Sharm El Sheikh"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Announcement Banner */}
        <div className="p-6 rounded-2xl bg-[#0f1b1e] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-teal-400 uppercase tracking-wider">
              Top Announcement Banner
            </h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.announcement?.enabled || false}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcement: {
                      enabled: e.target.checked,
                      text: settings.announcement?.text || "",
                    },
                  })
                }
                className="rounded size-4 accent-teal-500"
              />
              <span className="text-xs font-semibold text-white">
                Show Announcement Banner
              </span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              Banner Message
            </label>
            <input
              type="text"
              value={settings.announcement?.text || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  announcement: {
                    enabled: settings.announcement?.enabled || false,
                    text: e.target.value,
                  },
                })
              }
              placeholder="e.g. Special Offer: Book 2 excursions and get a complimentary airport transfer!"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs shadow-md shadow-teal-500/20 transition-all disabled:opacity-50"
          >
            <Save className="size-4" />
            {saving ? "Saving Changes..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
