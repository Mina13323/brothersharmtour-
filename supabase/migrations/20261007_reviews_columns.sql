-- Reviews moderation columns.
--
-- The live `reviews` table was created before these columns existed, so every
-- review the website tried to save (and every approve / reject) was rejected by
-- Supabase. Run this once in the Supabase SQL editor — it is safe to re-run.
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS booking_ref text;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS submitted_at timestamptz DEFAULT now();
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS published_at timestamptz;
UPDATE public.reviews SET submitted_at = created_at WHERE submitted_at IS NULL;
UPDATE public.reviews SET published_at = created_at WHERE status = 'approved' AND published_at IS NULL;
NOTIFY pgrst, 'reload schema';
