"use client";

/**
 * "Install the app" pop-up.
 *
 * Registers the service worker (so the site is installable) and invites mobile
 * visitors to add it to their home screen:
 *  - Android / Chrome: uses the browser's `beforeinstallprompt` for a one-tap
 *    install.
 *  - iPhone / iPad Safari has no install API, so it shows the two-step
 *    "Share → Add to Home Screen" instructions instead.
 * Never shown inside the installed app, in the admin, on desktop, or again
 * for 14 days after the visitor dismisses it.
 */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "./SiteProvider";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "bt_install_dismissed";
const DISMISS_DAYS = 14;
const SHOW_DELAY_MS = 7000;

function recentlyDismissed() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return Boolean(at) && Date.now() - at < DISMISS_DAYS * 86_400_000;
  } catch {
    return false;
  }
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallPrompt() {
  const pathname = usePathname();
  const { t, settings } = useSite();
  const [mode, setMode] = useState<"native" | "ios" | null>(null);
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);

  // Service worker: makes the site installable and gives an offline page.
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;
    const mobile = window.matchMedia("(max-width: 1023px)").matches;
    if (!mobile) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = (next: "native" | "ios") => {
      clearTimeout(timer);
      timer = setTimeout(() => setMode(next), SHOW_DELAY_MS);
    };

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
      schedule("native");
    };
    const onInstalled = () => {
      clearTimeout(timer);
      setMode(null);
      try {
        localStorage.setItem(DISMISS_KEY, String(Date.now() + 365 * 86_400_000));
      } catch {}
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    if (ios) schedule("ios");

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!mode || pathname?.startsWith("/admin")) return null;

  const dismiss = () => {
    setMode(null);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
  };

  const install = async () => {
    if (!event) return;
    setMode(null);
    await event.prompt();
    const { outcome } = await event.userChoice;
    if (outcome === "dismissed") dismiss();
    setEvent(null);
  };

  return (
    <div
      role="dialog"
      aria-label={t("install_title", "Get our app")}
      className="install-prompt fixed inset-x-3 z-[110] mx-auto max-w-md rounded-3xl border border-sand/80 bg-paper p-4 shadow-2xl shadow-ink/20"
      style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-start gap-3.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" width={52} height={52} className="size-[3.25rem] shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-[1.05rem] font-bold leading-tight text-ink">
            {t("install_title", "Get our app")}
          </p>
          <p className="mt-1 text-[0.8rem] leading-relaxed text-stone">
            {t("install_text", "Add {name} to your home screen — open it like an app, with one tap, even on a slow connection.").replace(
              "{name}",
              settings.name,
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("install_dismiss", "Not now")}
          className="-m-1 grid size-8 shrink-0 place-items-center rounded-full text-stone hover:bg-paper-warm cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="m1.5 1.5 9 9m0-9-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {mode === "native" ? (
        <div className="mt-3.5 flex items-center gap-2.5">
          <button type="button" onClick={install} className="btn btn-primary btn-sm flex-1 cursor-pointer">
            {t("install_button", "Install app")}
          </button>
          <button type="button" onClick={dismiss} className="btn btn-outline btn-sm cursor-pointer">
            {t("install_dismiss", "Not now")}
          </button>
        </div>
      ) : (
        <p className="mt-3 flex flex-wrap items-center gap-x-1.5 rounded-2xl bg-paper-warm px-3.5 py-2.5 text-[0.8rem] leading-relaxed text-ink">
          {t("install_ios_tap", "Tap")}
          <svg width="16" height="18" viewBox="0 0 16 20" fill="none" aria-label="Share" className="inline text-reef">
            <path d="M8 1v12M4.5 4.5 8 1l3.5 3.5M3 8H2v10h12V8h-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("install_ios_then", "then “Add to Home Screen”")}
        </p>
      )}
    </div>
  );
}
