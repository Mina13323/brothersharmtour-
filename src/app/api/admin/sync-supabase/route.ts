import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { loadDb } from "@/lib/store/db";
import { syncAllToSupabase } from "@/lib/store/supabaseSync";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await requireAdmin();
    const db = loadDb();
    const result = await syncAllToSupabase(db);

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error || "Failed to synchronize with Supabase.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: `Successfully synchronized ${result.syncedTours} tours, ${result.syncedPackages} packages, and settings to Supabase!`,
      synced: result,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: (err as Error).message || "An unexpected error occurred during sync.",
      },
      { status: 500 },
    );
  }
}
