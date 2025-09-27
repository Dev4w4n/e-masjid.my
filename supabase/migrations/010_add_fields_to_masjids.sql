-- Add website_url, capacity, and prayer_times_source to masjids table

-- Add website_url column
ALTER TABLE public.masjids
ADD COLUMN website_url VARCHAR(255);

-- Add capacity column
ALTER TABLE public.masjids
ADD COLUMN capacity INTEGER;

-- Create prayer_times_source enum type
CREATE TYPE prayer_source_enum AS ENUM ('manual', 'jakim', 'auto');

-- Add prayer_times_source column
ALTER TABLE public.masjids
ADD COLUMN prayer_times_source prayer_source_enum DEFAULT 'jakim';

-- Add constraints for the new columns
ALTER TABLE public.masjids
ADD CONSTRAINT website_url_format CHECK (
    website_url IS NULL OR
    website_url ~* '^https?://'
);

ALTER TABLE public.masjids
ADD CONSTRAINT capacity_positive CHECK (
    capacity IS NULL OR
    capacity > 0
);
