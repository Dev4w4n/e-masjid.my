-- Migration: Add language field to tv_displays for internationalization support
-- Description: Adds language preference field to support Bahasa Malaysia and English
-- Date: 2025-10-02

BEGIN;

-- Add language column to tv_displays table
ALTER TABLE public.tv_displays
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'ms'
CHECK (language IN ('en', 'ms'));

-- Add comment explaining the column
COMMENT ON COLUMN public.tv_displays.language IS 
'Display language preference: en (English) or ms (Bahasa Malaysia). Default is ms (Bahasa Malaysia) as per project requirements.';

-- Update existing records to have default language
UPDATE public.tv_displays
SET language = 'ms'
WHERE language IS NULL;

-- Create index for language queries (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_tv_displays_language 
ON public.tv_displays(language);

COMMIT;
