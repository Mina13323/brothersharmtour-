"use client";

/**
 * Site settings — contact details, social links (the single source of truth
 * the whole site reads), announcement bar, admin-confirmed trust claims,
 * currency rules and email notifications. SMTP credentials are env-only and
 * never appear here.
 */

import { useCallback, useEffect, useState } from "react";
import { Save, Send, KeyRound, Plus, Trash2, CheckCircle2, XCircle } from "lucide-react";

interface SettingsShape {
  site: { name: string; legalName: string; tagline: string; description: string; url: string };
  contact: {
    whatsapp: string;
    phone: string;
    email: string;
    address: string;
    addressCairo?: string;
    hours: string;
  };
  social: Record<string, string | undefined>;
  announcement: { enabled: boolean; text: string };
  trust: { yearsOperating?: string; guestsServed?: string };
  currency: { base: string; display: string; rates: Record<string, number> };
  languages: { code: string; label: string; dir: string; enabled: boolean }[];
  email: {
    notifyTo: string[];
    notifyOnInquiry: boolean;
    notifyOnReview: boolean;
    customerConfirmation: boolean;
    fromName: string;
  };
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsShape | null>(null);
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [testTo, setTestTo] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setSettings(d.settings);
          setSmtpConfigured(d.smtpConfigured);
          setTestTo(d.adminEmail ?? "");
        }
      })
      .catch(() => setMessage({ kind: "err", text: "Could not load settings." }));
  }, []);

  const set = useCallback(
    <S extends keyof SettingsShape>(section: S, patch: Partial<SettingsShape[S]>) =>
      setSettings((s) => (s ? { ...s, [section]: { ...s[section], ...patch } } : s)),
    [],
  );

  async function save() {
    if (!settings) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ kind: "err", text: data.message ?? "Save failed." });
        return;
      }
      setSettings(data.settings);
      setMessage({ kind: "ok", text: "Settings saved — the site reflects them immediately." });
    } catch {
      setMessage({ kind: "err", text: "Network error." });
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testTo }),
      });
      const data = await res.json().catch(() => ({}));
      setMessage(
        data.ok
          ? { kind: "ok", text: `Test email sent to ${testTo}.` }
          : { kind: "err", text: `Test email ${data.result ?? "failed"}${data.error ? `: ${data.error}` : ""}.` },
      );
    } finally {
      setBusy(false);
    }
  }

  async function changePassword() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      setMessage(
        res.ok
          ? { kind: "ok", text: "Password updated — other sessions are now signed out." }
          : { kind: "err", text: data.message ?? "Failed." },
      );
      if (res.ok) setNewPassword("");
    } finally {
      setBusy(false);
    }
  }

  if (!settings) {
    return <p className="text-sm text-stone-400">Loading settings…</p>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Site Settings</h1>
          <p className="text-sm text-stone-400 mt-1">
            These values feed the live site directly — nav, footer, contact
            buttons, schema.org data and emails.
          </p>
        </div>
        <button
          onClick={save}
          disabled={busy}
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl px-4 py-2.5"
        >
          <Save className="size-4" /> {busy ? "Working…" : "Save settings"}
        </button>
      </header>

      {message ? (
        <p
          className={`text-xs rounded-xl px-4 py-2.5 border ${
            message.kind === "ok"
              ? "text-teal-300 bg-teal-500/10 border-teal-500/20"
              : "text-red-300 bg-red-500/10 border-red-500/20"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Site identity">
          <Field label="Name">
            <input className={input} value={settings.site.name} onChange={(e) => set("site", { name: e.target.value })} />
          </Field>
          <Field label="Legal name (schema.org)">
            <input className={input} value={settings.site.legalName} onChange={(e) => set("site", { legalName: e.target.value })} />
          </Field>
          <Field label="Tagline">
            <input className={input} value={settings.site.tagline} onChange={(e) => set("site", { tagline: e.target.value })} />
          </Field>
          <Field label="Description (meta / schema.org)">
            <textarea rows={3} className={input} value={settings.site.description} onChange={(e) => set("site", { description: e.target.value })} />
          </Field>
          <Field label="Site URL (used in sitemap & structured data)">
            <input className={input} value={settings.site.url} onChange={(e) => set("site", { url: e.target.value })} />
          </Field>
        </Section>

        <Section title="Contact — single source of truth">
          <Field label="WhatsApp number (digits only, with country code)">
            <input className={input} value={settings.contact.whatsapp} onChange={(e) => set("contact", { whatsapp: e.target.value })} />
          </Field>
          <Field label="Phone">
            <input className={input} value={settings.contact.phone} onChange={(e) => set("contact", { phone: e.target.value })} />
          </Field>
          <Field label="Email">
            <input className={input} value={settings.contact.email} onChange={(e) => set("contact", { email: e.target.value })} />
          </Field>
          <Field label="Address (Sharm El Sheikh)">
            <input className={input} value={settings.contact.address} onChange={(e) => set("contact", { address: e.target.value })} />
          </Field>
          <Field label="Office hours">
            <input className={input} value={settings.contact.hours} onChange={(e) => set("contact", { hours: e.target.value })} />
          </Field>
        </Section>

        <Section title="Social links (empty = hidden)">
          {["instagram", "facebook", "tiktok", "youtube", "telegram", "tripadvisor"].map((key) => (
            <Field key={key} label={key}>
              <input
                className={input}
                value={settings.social[key] ?? ""}
                placeholder="https://…"
                onChange={(e) => set("social", { [key]: e.target.value } as never)}
              />
            </Field>
          ))}
        </Section>

        <Section title="Announcement bar">
          <label className="flex items-center gap-2 text-xs text-stone-300">
            <input
              type="checkbox"
              checked={settings.announcement.enabled}
              onChange={(e) => set("announcement", { enabled: e.target.checked })}
              className="size-4 rounded accent-teal-500"
            />
            Show the announcement bar
          </label>
          <Field label="Text">
            <input className={input} value={settings.announcement.text} onChange={(e) => set("announcement", { text: e.target.value })} />
          </Field>
        </Section>

        <Section title="Trust claims (admin-confirmed only)">
          <p className="text-[11px] text-stone-500 leading-relaxed">
            These render on the homepage ONLY when filled in. Never publish a
            claim you cannot evidence — the audit removed every invented number.
          </p>
          <Field label="Years operating (e.g. “since 2015”)">
            <input className={input} value={settings.trust.yearsOperating ?? ""} onChange={(e) => set("trust", { yearsOperating: e.target.value })} />
          </Field>
          <Field label="Guests served (e.g. “20,000+”)">
            <input className={input} value={settings.trust.guestsServed ?? ""} onChange={(e) => set("trust", { guestsServed: e.target.value })} />
          </Field>
        </Section>

        <Section title="Currency">
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Prices are stored in the base currency; visitors can switch the
            display currency themselves. Rates are 1 base unit in each currency.
            Language never implies currency.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Base currency (prices stored in)">
              <input className={`${input} uppercase`} value={settings.currency.base} onChange={(e) => set("currency", { base: e.target.value.toUpperCase() })} />
            </Field>
            <Field label="Default display currency">
              <input className={`${input} uppercase`} value={settings.currency.display} onChange={(e) => set("currency", { display: e.target.value.toUpperCase() })} />
            </Field>
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-stone-400 mb-1.5">Rates</span>
            <div className="space-y-2">
              {Object.entries(settings.currency.rates).map(([code, rate]) => (
                <div key={code} className="flex items-center gap-2">
                  <input
                    className={`${input} w-24 uppercase`}
                    value={code}
                    onChange={(e) => {
                      const next = { ...settings.currency.rates };
                      delete next[code];
                      next[e.target.value.toUpperCase()] = rate;
                      set("currency", { rates: next });
                    }}
                  />
                  <input
                    type="number"
                    step="0.0001"
                    className={input}
                    value={rate}
                    onChange={(e) =>
                      set("currency", { rates: { ...settings.currency.rates, [code]: Number(e.target.value) } })
                    }
                  />
                  <button
                    onClick={() => {
                      const next = { ...settings.currency.rates };
                      delete next[code];
                      set("currency", { rates: next });
                    }}
                    className="p-2 text-stone-500 hover:text-red-400"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => set("currency", { rates: { ...settings.currency.rates, XXX: 1 } })}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300"
              >
                <Plus className="size-3.5" /> Add currency
              </button>
            </div>
          </div>
        </Section>

        <Section title="Languages">
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Enabled languages appear in the site language switcher and in the
            tour editor&apos;s translation tabs. Content falls back to English until
            a translation is written.
          </p>
          <ul className="space-y-2">
            {settings.languages.map((l, i) => (
              <li key={l.code} className="flex items-center justify-between bg-black/20 rounded-xl px-3 py-2">
                <div>
                  <p className="text-xs font-semibold text-white">
                    {l.label} <span className="text-stone-500">({l.code})</span>
                  </p>
                  <p className="text-[10px] text-stone-500">{l.dir === "rtl" ? "right-to-left" : "left-to-right"}</p>
                </div>
                <label className="flex items-center gap-2 text-xs text-stone-300">
                  <input
                    type="checkbox"
                    checked={l.enabled}
                    onChange={(e) => {
                      const next = [...settings.languages];
                      next[i] = { ...l, enabled: e.target.checked };
                      set("languages", next);
                    }}
                    className="size-4 rounded accent-teal-500"
                  />
                  Enabled
                </label>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Email notifications">
          <div className="flex items-center gap-2 text-xs">
            {smtpConfigured ? (
              <span className="inline-flex items-center gap-1.5 text-teal-300">
                <CheckCircle2 className="size-4" /> SMTP configured (credentials from environment — never stored here)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-300">
                <XCircle className="size-4" /> SMTP not configured — set SMTP_HOST, SMTP_USER, SMTP_PASS in the environment
              </span>
            )}
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-stone-400 mb-1.5">Notification recipients</span>
            <div className="space-y-2">
              {settings.email.notifyTo.map((addr, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className={input}
                    value={addr}
                    onChange={(e) => {
                      const next = [...settings.email.notifyTo];
                      next[i] = e.target.value;
                      set("email", { notifyTo: next });
                    }}
                  />
                  <button
                    onClick={() => set("email", { notifyTo: settings.email.notifyTo.filter((_, j) => j !== i) })}
                    className="p-2 text-stone-500 hover:text-red-400"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => set("email", { notifyTo: [...settings.email.notifyTo, ""] })}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300"
              >
                <Plus className="size-3.5" /> Add recipient
              </button>
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-stone-300">
            <input
              type="checkbox"
              checked={settings.email.notifyOnInquiry}
              onChange={(e) => set("email", { notifyOnInquiry: e.target.checked })}
              className="size-4 rounded accent-teal-500"
            />
            Email me when a booking request arrives
          </label>
          <label className="flex items-center gap-2 text-xs text-stone-300">
            <input
              type="checkbox"
              checked={settings.email.notifyOnReview}
              onChange={(e) => set("email", { notifyOnReview: e.target.checked })}
              className="size-4 rounded accent-teal-500"
            />
            Email me when a review needs moderation
          </label>
          <label className="flex items-center gap-2 text-xs text-stone-300">
            <input
              type="checkbox"
              checked={settings.email.customerConfirmation}
              onChange={(e) => set("email", { customerConfirmation: e.target.checked })}
              className="size-4 rounded accent-teal-500"
            />
            Send guests a confirmation email (requires their email address)
          </label>
          <Field label="From name">
            <input className={input} value={settings.email.fromName} onChange={(e) => set("email", { fromName: e.target.value })} />
          </Field>
          <div className="flex items-end gap-2 pt-2 border-t border-white/10">
            <Field label="Send a test email to">
              <input className={input} value={testTo} onChange={(e) => setTestTo(e.target.value)} />
            </Field>
            <button
              onClick={sendTest}
              disabled={busy || !smtpConfigured}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white text-xs font-semibold rounded-xl px-3.5 py-2.5 shrink-0"
            >
              <Send className="size-3.5" /> Send
            </button>
          </div>
        </Section>

        <Section title="Admin password">
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Change the seeded password on first use. Changing it signs out every
            other session immediately.
          </p>
          <Field label="New password (min 10 characters)">
            <input
              type="password"
              className={input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </Field>
          <button
            onClick={changePassword}
            disabled={busy || newPassword.length < 10}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white text-xs font-semibold rounded-xl px-3.5 py-2.5"
          >
            <KeyRound className="size-3.5" /> Update password
          </button>
        </Section>
      </div>
    </div>
  );
}

const input =
  "w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-teal-500/60";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-[#101c1f] border border-white/10 rounded-2xl p-5 space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold text-stone-400 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
