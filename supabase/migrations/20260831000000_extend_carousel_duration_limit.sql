-- Extend carousel duration support from 300 to 600 seconds for content assignments

ALTER TABLE display_content_assignments
  DROP CONSTRAINT IF EXISTS display_content_assignments_carousel_duration_check;

ALTER TABLE display_content_assignments
  ADD CONSTRAINT display_content_assignments_carousel_duration_check
    CHECK (carousel_duration >= 5 AND carousel_duration <= 600);

COMMENT ON COLUMN display_content_assignments.carousel_duration IS
  'Duration in seconds for how long this content is displayed (5-600 seconds)';