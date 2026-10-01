"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "./SiteProvider";
import { useBooking } from "./BookingProvider";
import { WhatsAppIcon } from "./sections";
import { X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingActions() {
  const { whatsappLink } = useSite();
  const pathname = usePathname();
  const { isOpen } = useBooking();
  const [showPopup, setShowPopup] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const isDetailPage = Boolean(
    (pathname?.startsWith("/tours/") && pathname !== "/tours") ||
    (pathname?.startsWith("/packages/") && pathname !== "/packages")
  );

  // Automatically show the WhatsApp pop-up after a brief delay
  useEffect(() => {
    const timer = setTimeout(() => {
      const dismissed =
        typeof window !== "undefined"
          ? sessionStorage.getItem("bst_wa_popup_dismissed")
          : null;
      if (!dismissed) {
        setShowPopup(true);
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  if (pathname?.startsWith("/admin")) return null;
  if (isOpen) return null;

  const defaultMsg =
    pathname.startsWith("/tours/") && pathname !== "/tours"
      ? "Hi Brother Sharm Tour! I would like to enquire about this tour."
      : "Hi Brother Sharm Tour! I'd like to ask a question about your tours in Egypt.";

  function dismissPopup(e: React.MouseEvent) {
    e.stopPropagation();
    setShowPopup(false);
    setHasUnread(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("bst_wa_popup_dismissed", "1");
    }
  }

  function togglePopup() {
    setShowPopup((prev) => !prev);
    setHasUnread(false);
  }

  return (
    <div
      className={cn(
        "fixed z-[90] right-3.5 sm:right-7 flex flex-col items-end transition-all duration-300",
        isDetailPage
          ? "bottom-[calc(9.25rem+max(0px,env(safe-area-inset-bottom,0px)))] lg:bottom-20"
          : "bottom-20 sm:bottom-7"
      )}
    >
      {/* ─── WhatsApp Interactive Pop-up Card ─── */}
      {showPopup && (
        <div
          role="dialog"
          aria-label="WhatsApp live chat assistance"
          className="mb-3 w-[300px] sm:w-[340px] max-w-[calc(100vw-28px)] overflow-hidden rounded-3xl bg-white shadow-2xl border border-sand/70 animate-in fade-in slide-in-from-bottom-5 duration-300 backdrop-blur-md"
        >
          {/* Header */}
          <div className="bg-[#075E54] text-white px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="size-10 rounded-full bg-white/15 flex items-center justify-center font-display font-bold text-white text-sm shadow-inner">
                  BST
                </div>
                <span className="absolute bottom-0 right-0 size-3 rounded-full bg-[#25D366] border-2 border-[#075E54]" />
              </div>
              <div>
                <h4 className="font-semibold text-xs leading-tight tracking-wide text-white">
                  Brother Sharm Tour
                </h4>
                <p className="text-[10px] text-white/80 flex items-center gap-1.5 mt-0.5">
                  <span className="size-1.5 rounded-full bg-[#25D366] inline-block animate-pulse" />
                  Online now · Replies in 2 mins
                </p>
              </div>
            </div>

            <button
              onClick={dismissPopup}
              type="button"
              aria-label="Close chat popup"
              className="size-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Chat message content */}
          <div className="p-4 bg-[#ECE5DD]/40 text-xs">
            <div className="bg-white rounded-2xl rounded-tl-sm p-3.5 shadow-xs text-stone-800 leading-relaxed border border-stone-200/50">
              <p className="font-medium text-ink mb-1">
                Hello there! 👋 Welcome to Egypt.
              </p>
              <p className="text-stone">
                Need help picking the best tour, booking with no prepayment, or checking hotel transfer times? Ask us on WhatsApp!
              </p>
              <span className="block text-[10px] text-stone text-right mt-1.5 font-mono">
                Just now ✓✓
              </span>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="p-3 bg-white border-t border-sand/40">
            <a
              href={whatsappLink(defaultMsg)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowPopup(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <WhatsAppIcon className="size-4 shrink-0" />
              <span>Chat on WhatsApp</span>
              <Send className="size-3.5 shrink-0 opacity-80" />
            </a>
          </div>
        </div>
      )}

      {/* ─── Floating WhatsApp Button ─── */}
      <div className="relative group">
        <button
          type="button"
          onClick={togglePopup}
          aria-label="Chat with Brother Sharm Tour on WhatsApp"
          className="relative size-12 sm:size-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-white/60"
        >
          {showPopup ? (
            <X className="size-6 transition-transform duration-200 rotate-90" />
          ) : (
            <>
              <WhatsAppIcon className="size-6 sm:size-7" />
              {/* Online pulse ring */}
              <span className="absolute -top-0.5 -right-0.5 flex size-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-3.5 bg-emerald-500 border-2 border-white" />
              </span>
            </>
          )}
        </button>

        {/* Floating tooltip preview when popup is closed */}
        {!showPopup && hasUnread && (
          <div
            onClick={togglePopup}
            className="absolute bottom-1 right-14 sm:right-16 mr-1 hidden sm:flex items-center gap-2 bg-white text-ink px-3 py-1.5 rounded-full shadow-lg border border-sand/60 text-xs font-semibold whitespace-nowrap cursor-pointer hover:bg-paper-warm transition-all animate-bounce"
          >
            <span className="size-2 rounded-full bg-[#25D366]" />
            <span>Chat on WhatsApp</span>
          </div>
        )}
      </div>
    </div>
  );
}
