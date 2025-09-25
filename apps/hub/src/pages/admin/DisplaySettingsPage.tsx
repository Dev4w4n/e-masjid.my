/**
 * DisplaySettingsPage Component
 *
 * Admin page for managing display configurations and content scheduling
 * for TV displays and digital signage.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Container,
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Chip,
} from "@mui/material";
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Tv as TvIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useAuth } from "@masjid-suite/auth";

// Temporary placeholder types until package import is resolved
interface DisplaySettings {
  id: string;
  name: string;
  auto_refresh_interval: number;
  content_rotation_interval: number;
  enable_prayer_times: boolean;
  enable_announcements: boolean;
  enable_sponsorships: boolean;
  enable_events: boolean;
  template_settings: {
    theme: "light" | "dark" | "auto";
    background_color?: string;
    text_color?: string;
    accent_color?: string;
  };
  schedule_settings: {
    auto_start_time: string;
    auto_end_time: string;
    weekend_schedule: boolean;
  };
  masjid_id: string;
  updated_at: string;
}

/**
 * Admin display settings page
 */
const DisplaySettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [settings, setSettings] = useState<DisplaySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load display settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) {
        setError("You must be logged in to access display settings");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // TODO: Implement actual settings loading with content-management package
        // const displaySettings = await getDisplaySettings();

        // Placeholder data
        const mockSettings: DisplaySettings = {
          id: "display-1",
          name: "Main Hall Display",
          auto_refresh_interval: 30,
          content_rotation_interval: 15,
          enable_prayer_times: true,
          enable_announcements: true,
          enable_sponsorships: true,
          enable_events: true,
          template_settings: {
            theme: "light",
            background_color: "#ffffff",
            text_color: "#000000",
            accent_color: "#1976d2",
          },
          schedule_settings: {
            auto_start_time: "05:00",
            auto_end_time: "23:00",
            weekend_schedule: true,
          },
          masjid_id: "test-masjid",
          updated_at: new Date().toISOString(),
        };

        setSettings(mockSettings);
      } catch (err) {
        console.error("Failed to load display settings:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while loading settings"
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // Handle settings update
  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // TODO: Implement actual settings save with content-management package
      // await updateDisplaySettings(settings);
      console.log("Save settings:", settings);

      setSuccess("Display settings saved successfully");
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError("Failed to save display settings");
    } finally {
      setSaving(false);
    }
  };

  // Handle individual setting changes
  const handleSettingChange = (field: string, value: any) => {
    if (!settings) return;

    setSettings((prev) => ({
      ...prev!,
      [field]: value,
    }));
  };

  // Handle nested setting changes
  const handleNestedSettingChange = (
    parent: "template_settings" | "schedule_settings",
    field: string,
    value: any
  ) => {
    if (!settings) return;

    setSettings((prev) => ({
      ...prev!,
      [parent]: {
        ...prev![parent],
        [field]: value,
      },
    }));
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please sign in to access display settings.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs>
          <Link
            color="inherit"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Link
            color="inherit"
            href="/admin"
            onClick={(e) => {
              e.preventDefault();
              navigate("/admin");
            }}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Admin
          </Link>
          <Typography color="text.primary">Display Settings</Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Display Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure display behavior, content scheduling, and visual appearance
          for your masjid's digital displays.
        </Typography>
      </Box>

      {/* Error and Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Settings Form */}
      {!loading && settings && (
        <Grid container spacing={3}>
          {/* Display Configuration */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: "fit-content" }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <TvIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">Display Configuration</Typography>
              </Box>

              <TextField
                fullWidth
                label="Display Name"
                value={settings.name}
                onChange={(e) => handleSettingChange("name", e.target.value)}
                sx={{ mb: 3 }}
                helperText="Friendly name for this display configuration"
              />

              <TextField
                fullWidth
                label="Auto Refresh Interval (seconds)"
                type="number"
                value={settings.auto_refresh_interval}
                onChange={(e) =>
                  handleSettingChange(
                    "auto_refresh_interval",
                    parseInt(e.target.value)
                  )
                }
                sx={{ mb: 3 }}
                helperText="How often the display refreshes content"
                InputProps={{ inputProps: { min: 10, max: 300 } }}
              />

              <TextField
                fullWidth
                label="Content Rotation Interval (seconds)"
                type="number"
                value={settings.content_rotation_interval}
                onChange={(e) =>
                  handleSettingChange(
                    "content_rotation_interval",
                    parseInt(e.target.value)
                  )
                }
                sx={{ mb: 3 }}
                helperText="Duration each content item is shown"
                InputProps={{ inputProps: { min: 5, max: 120 } }}
              />

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" gutterBottom>
                Content Types
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enable_prayer_times}
                    onChange={(e) =>
                      handleSettingChange(
                        "enable_prayer_times",
                        e.target.checked
                      )
                    }
                  />
                }
                label="Show Prayer Times"
                sx={{ display: "flex", mb: 1 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enable_announcements}
                    onChange={(e) =>
                      handleSettingChange(
                        "enable_announcements",
                        e.target.checked
                      )
                    }
                  />
                }
                label="Show Announcements"
                sx={{ display: "flex", mb: 1 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enable_sponsorships}
                    onChange={(e) =>
                      handleSettingChange(
                        "enable_sponsorships",
                        e.target.checked
                      )
                    }
                  />
                }
                label="Show Sponsorships"
                sx={{ display: "flex", mb: 1 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enable_events}
                    onChange={(e) =>
                      handleSettingChange("enable_events", e.target.checked)
                    }
                  />
                }
                label="Show Events"
                sx={{ display: "flex", mb: 1 }}
              />
            </Paper>
          </Grid>

          {/* Schedule Settings */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <ScheduleIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">Schedule Settings</Typography>
              </Box>

              <TextField
                fullWidth
                label="Auto Start Time"
                type="time"
                value={settings.schedule_settings.auto_start_time}
                onChange={(e) =>
                  handleNestedSettingChange(
                    "schedule_settings",
                    "auto_start_time",
                    e.target.value
                  )
                }
                sx={{ mb: 3 }}
                helperText="When displays automatically turn on"
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Auto End Time"
                type="time"
                value={settings.schedule_settings.auto_end_time}
                onChange={(e) =>
                  handleNestedSettingChange(
                    "schedule_settings",
                    "auto_end_time",
                    e.target.value
                  )
                }
                sx={{ mb: 3 }}
                helperText="When displays automatically turn off"
                InputLabelProps={{ shrink: true }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.schedule_settings.weekend_schedule}
                    onChange={(e) =>
                      handleNestedSettingChange(
                        "schedule_settings",
                        "weekend_schedule",
                        e.target.checked
                      )
                    }
                  />
                }
                label="Enable Weekend Schedule"
                sx={{ display: "flex", mb: 2 }}
              />
            </Paper>

            {/* Theme Settings */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <SettingsIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">Appearance Settings</Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Theme
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {(["light", "dark", "auto"] as const).map((theme) => (
                    <Chip
                      key={theme}
                      label={theme.charAt(0).toUpperCase() + theme.slice(1)}
                      variant={
                        settings.template_settings.theme === theme
                          ? "filled"
                          : "outlined"
                      }
                      onClick={() =>
                        handleNestedSettingChange(
                          "template_settings",
                          "theme",
                          theme
                        )
                      }
                      sx={{ cursor: "pointer" }}
                    />
                  ))}
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Background Color"
                type="color"
                value={settings.template_settings.background_color || "#ffffff"}
                onChange={(e) =>
                  handleNestedSettingChange(
                    "template_settings",
                    "background_color",
                    e.target.value
                  )
                }
                sx={{ mb: 2 }}
                size="small"
              />

              <TextField
                fullWidth
                label="Text Color"
                type="color"
                value={settings.template_settings.text_color || "#000000"}
                onChange={(e) =>
                  handleNestedSettingChange(
                    "template_settings",
                    "text_color",
                    e.target.value
                  )
                }
                sx={{ mb: 2 }}
                size="small"
              />

              <TextField
                fullWidth
                label="Accent Color"
                type="color"
                value={settings.template_settings.accent_color || "#1976d2"}
                onChange={(e) =>
                  handleNestedSettingChange(
                    "template_settings",
                    "accent_color",
                    e.target.value
                  )
                }
                size="small"
              />
            </Paper>
          </Grid>

          {/* Save Button */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate("/admin")}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveSettings}
                disabled={saving}
                startIcon={
                  saving ? <CircularProgress size={20} /> : <SettingsIcon />
                }
              >
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}

      {/* DisplaySettings Component Placeholder */}
      <Paper elevation={1} sx={{ p: 3, mt: 4, bgcolor: "grey.50" }}>
        <Typography variant="h6" gutterBottom>
          Advanced Display Configuration
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          DisplaySettings component from content-management package will be
          integrated here once import is resolved.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This will provide more advanced configuration options including
          content templates, layout customization, and real-time preview.
        </Typography>
      </Paper>
    </Container>
  );
};

export default DisplaySettingsPage;
