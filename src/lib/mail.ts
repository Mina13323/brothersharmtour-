/**
 * Email delivery over the operator's Hostinger mailbox.
 *
 * SMTP credentials live ONLY in environment variables (SMTP_HOST, SMTP_PORT,
 * SMTP_USER, SMTP_PASS, optional SMTP_SECURE / EMAIL_FROM). Nothing sensitive
 * is ever stored in the CMS settings or shipped to the client — the admin UI
 * controls recipient addresses and toggles, not credentials.
 *
 * When SMTP is not configured the mailer degrades gracefully: `sendMail`
 * returns a "not-configured" status which the callers record on the inquiry,
 * so the admin can see exactly why a notification didn't go out.
 */

import nodemailer from "nodemailer";

export interface MailResult {
  status: "sent" | "failed" | "not-configured";
  error?: string;
}

export interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function fromAddress(): string {
  const user = process.env.SMTP_USER!;
  return process.env.EMAIL_FROM ?? user;
}

type Transporter = ReturnType<typeof nodemailer.createTransport>;

let transporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter> {
  if (transporter) return transporter;
  const port = Number(process.env.SMTP_PORT ?? 465);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  });
  return transporter;
}

export async function sendMail(options: MailOptions): Promise<MailResult> {
  if (!smtpConfigured()) return { status: "not-configured" };
  try {
    const t = await getTransporter();
    await t.sendMail({
      from: `"${process.env.SMTP_FROM_NAME ?? "Brother Sharm Tour"}" <${fromAddress()}>`,
      ...options,
    });
    return { status: "sent" };
  } catch (err) {
    console.error("[mail] send failed", err);
    return { status: "failed", error: err instanceof Error ? err.message : String(err) };
  }
}

/* ──────────────────────────── templates ──────────────────────────── */

function shell(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f4f1ec;font-family:Georgia,serif;color:#1c2b2e;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="background:#0f414a;color:#efe8df;padding:22px 28px;border-radius:6px 6px 0 0;">
      <span style="font-size:18px;font-weight:bold;letter-spacing:0.5px;">BROTHER SHARM TOUR</span>
    </div>
    <div style="background:#ffffff;padding:28px;border-radius:0 0 6px 6px;border:1px solid #e3dccd;">
      <h2 style="margin:0 0 14px;font-size:19px;color:#0f414a;">${title}</h2>
      ${bodyHtml}
    </div>
    <p style="text-align:center;font-size:11px;color:#8a8378;margin-top:18px;font-family:Arial,sans-serif;">
      Sent automatically by the Brother Sharm Tour website.
    </p>
  </div></body></html>`;
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:6px 12px 6px 0;font-family:Arial,sans-serif;font-size:13px;color:#8a8378;vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:13px;color:#1c2b2e;">${value}</td></tr>`;
}

export interface InquiryMailData {
  guestName: string;
  guestEmail?: string | null;
  guestPhone: string;
  tourTitle?: string | null;
  preferredDate?: string | null;
  adults: number;
  children: number;
  hotel?: string;
  notes?: string;
  source?: string;
  currency?: string;
  adminUrl: string;
}

export function adminInquiryEmail(d: InquiryMailData): MailOptions {
  const subject = `New booking request — ${d.tourTitle ?? "general enquiry"}`;
  const text = [
    `New booking request from the website.`,
    ``,
    `Name: ${d.guestName}`,
    `Email: ${d.guestEmail ?? "—"}`,
    `Phone/WhatsApp: ${d.guestPhone}`,
    `Tour: ${d.tourTitle ?? "—"}`,
    `Preferred date: ${d.preferredDate ?? "—"}`,
    `Guests: ${d.adults} adults, ${d.children} children`,
    d.hotel ? `Hotel: ${d.hotel}` : null,
    d.notes ? `Notes: ${d.notes}` : null,
    `Source: ${d.source ?? "booking"}`,
    ``,
    `Manage it in the CMS: ${d.adminUrl}`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const html = shell(
    "New booking request",
    `<table style="border-collapse:collapse;">${[
      row("Name", d.guestName),
      row("Email", d.guestEmail ?? "—"),
      row("Phone / WhatsApp", d.guestPhone),
      row("Tour", d.tourTitle ?? "—"),
      row("Preferred date", d.preferredDate ?? "—"),
      row("Guests", `${d.adults} adults, ${d.children} children`),
      d.hotel ? row("Hotel", d.hotel) : "",
      d.notes ? row("Notes", d.notes.replace(/</g, "&lt;")) : "",
      row("Source", d.source ?? "booking"),
    ].join("")}</table>
     <p style="margin:18px 0 0;"><a href="${d.adminUrl}" style="background:#7f0303;color:#fff;padding:10px 18px;border-radius:4px;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;">Open in the CMS</a></p>`,
  );
  return { to: "", subject, text, html };
}

export function customerInquiryEmail(d: {
  guestName: string;
  tourTitle?: string | null;
  preferredDate?: string | null;
  siteUrl: string;
  whatsapp: string;
}): MailOptions {
  const subject = "We received your request — Brother Sharm Tour";
  const text = `Hello ${d.guestName},

Thank you for your request${d.tourTitle ? ` for “${d.tourTitle}”` : ""}${d.preferredDate ? ` on ${d.preferredDate}` : ""}.

Our team will confirm availability, your exact hotel pickup time and the final price — usually within a few hours. No payment is needed now; you pay on the day.

If you'd like to reach us first, message us any time on WhatsApp: https://wa.me/${d.whatsapp}

Brother Sharm Tour
${d.siteUrl}`;

  const html = shell(
    "We received your request",
    `<p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;margin:0 0 12px;">Hello ${d.guestName},</p>
     <p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;margin:0 0 12px;">
       Thank you for your request${d.tourTitle ? ` for <strong>“${d.tourTitle}”</strong>` : ""}${d.preferredDate ? ` on <strong>${d.preferredDate}</strong>` : ""}.
     </p>
     <p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;margin:0 0 12px;">
       Our team will confirm availability, your exact hotel pickup time and the final price — usually within a few hours. <strong>No payment is needed now; you pay on the day.</strong>
     </p>
     <p style="margin:18px 0 0;"><a href="https://wa.me/${d.whatsapp}" style="background:#1faa54;color:#fff;padding:10px 18px;border-radius:4px;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;">Message us on WhatsApp</a></p>`,
  );
  return { to: "", subject, text, html };
}

export function adminReviewEmail(d: {
  name: string;
  tourTitle?: string | null;
  rating: number;
  body: string;
  adminUrl: string;
}): MailOptions {
  const subject = `New review awaiting moderation (${d.rating}★)`;
  const text = `A new customer review was submitted and is awaiting moderation.

Name: ${d.name}
Tour: ${d.tourTitle ?? "general"}
Rating: ${d.rating}/5

"${d.body}"

Moderate it in the CMS: ${d.adminUrl}`;
  const html = shell(
    "New review awaiting moderation",
    `<table style="border-collapse:collapse;">${[
      row("Name", d.name),
      row("Tour", d.tourTitle ?? "general"),
      row("Rating", `${d.rating} / 5`),
    ].join("")}</table>
     <blockquote style="margin:14px 0;padding:10px 16px;border-left:3px solid #d8ba98;background:#faf7f0;font-family:Arial,sans-serif;font-size:13px;color:#1c2b2e;">${d.body.replace(/</g, "&lt;")}</blockquote>
     <p style="margin:18px 0 0;"><a href="${d.adminUrl}" style="background:#7f0303;color:#fff;padding:10px 18px;border-radius:4px;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;">Moderate in the CMS</a></p>`,
  );
  return { to: "", subject, text, html };
}

export function testEmail(to: string): MailOptions {
  return {
    to,
    subject: "Test email from your website CMS",
    text: "This is a test email sent from the Brother Sharm Tour CMS settings page. If you received it, email notifications are working.",
    html: shell(
      "Email notifications work",
      `<p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;">This is a test email sent from the Brother Sharm Tour CMS settings page. If you received it, email notifications are working.</p>`,
    ),
  };
}
