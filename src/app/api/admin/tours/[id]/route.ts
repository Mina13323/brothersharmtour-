import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteTour, saveTour, slugTaken, tourById } from "@/lib/store/repo";
import { syncTourToSupabase } from "@/lib/store/supabaseSync";
import type { TourRecord, TourTranslation } from "@/lib/store/types";
import { queueTranslation } from "@/lib/translate/server";

/**
 * Admin single tour: read, update (partial merge — structured lists are only
 * replaced when the request includes them), delete.
 */

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const tour = tourById(id);
  if (!tour) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, tour });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const existing = tourById(id);
  if (!existing) return NextResponse.json({ ok: false }, { status: 404 });

  let patch: Record<string, unknown>;
  try {
    patch = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid body." }, { status: 400 });
  }

  // Slug changes must stay unique.
  if (typeof patch.slug === "string" && patch.slug !== existing.slug) {
    if (slugTaken(patch.slug, existing.id))
      return NextResponse.json(
        { ok: false, message: `Slug "${patch.slug}" is already taken.` },
        { status: 422 },
      );
  }

  // Guard rails on the fields that other records reference.
  if (patch.priceFrom !== undefined && patch.priceFrom !== null && Number(patch.priceFrom) < 0)
    return NextResponse.json({ ok: false, message: "Adult price cannot be negative." }, { status: 422 });

  if (patch.childPrice !== undefined && patch.childPrice !== null && Number(patch.childPrice) < 0)
    return NextResponse.json({ ok: false, message: "Child price cannot be negative." }, { status: 422 });

  // The editor never sends whole translation blobs (they would clobber machine
  // output that landed after the page loaded). It sends only the fields a human
  // edited, which become manual: removed from the machine-owned list.
  if ("translationEdits" in patch) {
    const edits = (patch.translationEdits ?? {}) as Record<string, Record<string, unknown>>;
    delete patch.translationEdits;
    delete patch.translations;
    delete patch.translationMeta;
    const translations: Record<string, TourTranslation> = { ...existing.translations };
    const meta: NonNullable<TourRecord["translationMeta"]> = { ...(existing.translationMeta ?? {}) };
    for (const [lang, fields] of Object.entries(edits)) {
      translations[lang] = { ...(translations[lang] ?? {}), ...fields } as TourTranslation;
      const cur = meta[lang] ?? { auto_fields: [], source_hashes: {} };
      meta[lang] = {
        ...cur,
        auto_fields: (cur.auto_fields ?? []).filter((f) => !(f in fields)),
      };
    }
    patch.translations = translations;
    patch.translationMeta = meta;
  }

  const tour = saveTour({ ...patch, slug: String(patch.slug ?? existing.slug), id: existing.id });
  await syncTourToSupabase(tour).catch(() => {});
  // Only what changed in English (or is still blank) is re-translated.
  queueTranslation(tour.id);
  return NextResponse.json({ ok: true, tour: tourById(tour.id) ?? tour });
}


export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  if (!tourById(id)) return NextResponse.json({ ok: false }, { status: 404 });
  const ok = deleteTour(id);
  return NextResponse.json({ ok });
}
