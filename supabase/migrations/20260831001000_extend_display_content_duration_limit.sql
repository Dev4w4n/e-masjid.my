-- Extend display content duration support from 300 to 600 seconds

ALTER TABLE display_content
  DROP CONSTRAINT IF EXISTS valid_duration;

ALTER TABLE display_content
  ADD CONSTRAINT valid_duration
    CHECK (duration BETWEEN 5 AND 600);