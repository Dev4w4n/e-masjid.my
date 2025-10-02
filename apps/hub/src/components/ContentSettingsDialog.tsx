/**
 * ContentSettingsDialog Component
 *
 * Dialog for configuring per-content display settings when assigning or editing content.
 * Allows admins to set:
 * - Display duration (5-300 seconds)
 * - Transition effect (fade, slide, zoom, none)
 * - Image display mode (contain, cover, fill, none) - only for image content
 */

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { ContentType } from "@masjid-suite/shared-types";

export interface ContentSettings {
  carousel_duration: number;
  transition_type: "fade" | "slide" | "zoom" | "none";
  image_display_mode: "contain" | "cover" | "fill" | "none";
}

interface ContentSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (settings: ContentSettings) => Promise<void>;
  contentType: ContentType;
  contentTitle: string;
  initialSettings?: Partial<ContentSettings>;
  mode: "assign" | "edit";
}

const DEFAULT_SETTINGS: ContentSettings = {
  carousel_duration: 10,
  transition_type: "fade",
  image_display_mode: "contain",
};

const DURATION_MARKS = [
  { value: 5, label: "5s" },
  { value: 10, label: "10s" },
  { value: 30, label: "30s" },
  { value: 60, label: "1m" },
  { value: 120, label: "2m" },
  { value: 300, label: "5m" },
];

export const ContentSettingsDialog: React.FC<ContentSettingsDialogProps> = ({
  open,
  onClose,
  onSave,
  contentType,
  contentTitle,
  initialSettings,
  mode,
}) => {
  const [settings, setSettings] = useState<ContentSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize settings when dialog opens
  useEffect(() => {
    if (open) {
      setSettings({
        ...DEFAULT_SETTINGS,
        ...initialSettings,
      });
      setError(null);
    }
  }, [open, initialSettings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await onSave(settings);
      onClose();
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) return `${minutes}m`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const isImageContent =
    contentType === "image" || contentType === "event_poster";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === "assign"
          ? "Assign Content with Settings"
          : "Edit Content Settings"}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Content Info */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {contentTitle}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {contentType}
            </Typography>
          </Alert>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Display Duration Slider */}
          <Box sx={{ mb: 4 }}>
            <Typography id="duration-slider" gutterBottom>
              Display Duration
            </Typography>
            <Typography variant="h6" color="primary" gutterBottom>
              {formatDuration(settings.carousel_duration)}
            </Typography>
            <Slider
              value={settings.carousel_duration}
              onChange={(_, value) =>
                setSettings((prev) => ({
                  ...prev,
                  carousel_duration: value as number,
                }))
              }
              min={5}
              max={300}
              marks={DURATION_MARKS}
              step={5}
              aria-labelledby="duration-slider"
            />
            <Typography variant="caption" color="text.secondary">
              How long this content will be displayed (5 seconds to 5 minutes)
            </Typography>
          </Box>

          {/* Transition Type Dropdown */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="transition-type-label">
              Transition Effect
            </InputLabel>
            <Select
              labelId="transition-type-label"
              value={settings.transition_type}
              label="Transition Effect"
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  transition_type: e.target
                    .value as ContentSettings["transition_type"],
                }))
              }
            >
              <MenuItem value="fade">
                <Box>
                  <Typography>Fade</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Smooth fade in/out (recommended)
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value="slide">
                <Box>
                  <Typography>Slide</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Slide from side
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value="zoom">
                <Box>
                  <Typography>Zoom</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Zoom in effect
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value="none">
                <Box>
                  <Typography>None</Typography>
                  <Typography variant="caption" color="text.secondary">
                    No transition effect
                  </Typography>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Image Display Mode (only for images) */}
          {isImageContent && (
            <FormControl fullWidth>
              <InputLabel id="image-mode-label">Image Display Mode</InputLabel>
              <Select
                labelId="image-mode-label"
                value={settings.image_display_mode}
                label="Image Display Mode"
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    image_display_mode: e.target
                      .value as ContentSettings["image_display_mode"],
                  }))
                }
              >
                <MenuItem value="contain">
                  <Box>
                    <Typography>Contain (Fit with letterbox)</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Shows full image, maintains aspect ratio
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="cover">
                  <Box>
                    <Typography>Cover (Fill and crop)</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Fills screen, may crop edges
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="fill">
                  <Box>
                    <Typography>Fill (Stretch)</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Stretches to fill screen, may distort
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="none">
                  <Box>
                    <Typography>None (Original size)</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Displays at native resolution
                    </Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {saving ? "Saving..." : mode === "assign" ? "Assign" : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
