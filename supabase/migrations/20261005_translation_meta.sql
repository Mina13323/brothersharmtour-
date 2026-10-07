-- Auto-translation tracking (additive, non-destructive, safe to re-run).
--
-- Translations themselves already live in tours.translations (jsonb, keyed by
-- language code). This adds the bookkeeping that tells machine output apart
-- from human edits:
--
--   translation_meta = {
--     "<lang>": {
--       "auto_fields":   ["title", "summary", ...],     -- filled by the machine
--       "source_hashes": { "title": "<hash of the English text it came from>" },
--       "status":        "translating" | "done" | "failed",
--       "error":         "<last failure message, if any>",
--       "at":            "<ISO timestamp of last run>"
--     }
--   }
--
-- The app stores this inside the tour record and mirrors it here, so it uses
-- one jsonb column instead of per-language text[] columns (a tour has many
-- languages; a single text[] column could not be keyed by language).

ALTER TABLE public.tours
  ADD COLUMN IF NOT EXISTS translation_meta jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.tours.translation_meta IS
  'Per-language auto-translation bookkeeping: auto_fields[], source_hashes{}, status, error, at. Written server-side only.';
