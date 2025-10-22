-- Migration 024: Add QR Code functionality to display_content
-- Adds fields to support QR code display on TV screens for content

-- Add QR code fields to display_content table
ALTER TABLE display_content 
ADD COLUMN qr_code_enabled BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN qr_code_url TEXT,
ADD COLUMN qr_code_position VARCHAR(20) DEFAULT 'bottom-right' CHECK (qr_code_position IN ('top-left', 'top-right', 'bottom-left', 'bottom-right'));

-- Add comment for documentation
COMMENT ON COLUMN display_content.qr_code_enabled IS 'Whether to show QR code overlay on TV display';
COMMENT ON COLUMN display_content.qr_code_url IS 'Custom URL for QR code. If null, defaults to public content detail page';
COMMENT ON COLUMN display_content.qr_code_position IS 'Position of QR code on screen: top-left, top-right, bottom-left, bottom-right';

-- Update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_display_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if not exists (idempotent)
DROP TRIGGER IF EXISTS update_display_content_timestamp ON display_content;
CREATE TRIGGER update_display_content_timestamp
  BEFORE UPDATE ON display_content
  FOR EACH ROW
  EXECUTE FUNCTION update_display_content_updated_at();
