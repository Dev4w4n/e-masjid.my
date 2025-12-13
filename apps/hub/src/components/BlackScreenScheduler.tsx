/**
 * Black Screen Scheduler Component
 *
 * Provides an intuitive UI for scheduling automatic black screen periods
 * on TV displays (e.g., during Friday prayers or maintenance windows).
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  Collapse,
  SelectChangeEvent,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Schedule as ScheduleIcon,
  VisibilityOff as VisibilityOffIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { DayOfWeek, BlackScreenScheduleType } from "@masjid-suite/shared-types";

// Day labels in Bahasa Malaysia with English fallback
const DAY_LABELS: {
  [key in DayOfWeek]: { ms: string; en: string; short: string };
} = {
  0: { ms: "Ahad", en: "Sunday", short: "Ahd" },
  1: { ms: "Isnin", en: "Monday", short: "Isn" },
  2: { ms: "Selasa", en: "Tuesday", short: "Sel" },
  3: { ms: "Rabu", en: "Wednesday", short: "Rab" },
  4: { ms: "Khamis", en: "Thursday", short: "Kha" },
  5: { ms: "Jumaat", en: "Friday", short: "Jum" },
  6: { ms: "Sabtu", en: "Saturday", short: "Sab" },
};

// Common presets for quick scheduling
const SCHEDULE_PRESETS = [
  {
    id: "friday-prayer",
    label: "Solat Jumaat",
    labelEn: "Friday Prayer",
    scheduleType: "weekly" as BlackScreenScheduleType,
    days: [5] as DayOfWeek[],
    startTime: "12:30",
    endTime: "14:30",
    message: "Solat Jumaat sedang berlangsung",
  },
  {
    id: "night-mode",
    label: "Mod Malam",
    labelEn: "Night Mode",
    scheduleType: "daily" as BlackScreenScheduleType,
    days: [] as DayOfWeek[],
    startTime: "22:00",
    endTime: "06:00",
    message: "",
  },
  {
    id: "maintenance",
    label: "Penyelenggaraan",
    labelEn: "Maintenance",
    scheduleType: "daily" as BlackScreenScheduleType,
    days: [] as DayOfWeek[],
    startTime: "04:00",
    endTime: "06:00",
    message: "Penyelenggaraan sistem",
  },
];

export interface BlackScreenSchedulerProps {
  /** Whether black screen scheduling is enabled */
  enabled: boolean;
  /** Schedule type: daily or weekly */
  scheduleType: BlackScreenScheduleType;
  /** Start time in HH:MM format */
  startTime: string | null;
  /** End time in HH:MM format */
  endTime: string | null;
  /** Days of week for weekly schedule */
  days: DayOfWeek[];
  /** Message to display during black screen */
  message: string | null;
  /** Whether to show clock during black screen */
  showClock: boolean;
  /** Callback when any setting changes */
  onChange: (settings: {
    black_screen_enabled: boolean;
    black_screen_schedule_type: BlackScreenScheduleType;
    black_screen_start_time: string | null;
    black_screen_end_time: string | null;
    black_screen_days: DayOfWeek[];
    black_screen_message: string | null;
    black_screen_show_clock: boolean;
  }) => void;
  /** Language for UI labels */
  language?: "ms" | "en";
}

export const BlackScreenScheduler: React.FC<BlackScreenSchedulerProps> = ({
  enabled,
  scheduleType,
  startTime,
  endTime,
  days,
  message,
  showClock,
  onChange,
  language = "ms",
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Check if current settings match any preset
  useEffect(() => {
    const matchingPreset = SCHEDULE_PRESETS.find(
      (preset) =>
        preset.scheduleType === scheduleType &&
        preset.startTime === startTime &&
        preset.endTime === endTime &&
        JSON.stringify(preset.days.sort()) === JSON.stringify([...days].sort())
    );
    setSelectedPreset(matchingPreset?.id || null);
  }, [scheduleType, startTime, endTime, days]);

  const handleEnabledChange = (checked: boolean) => {
    onChange({
      black_screen_enabled: checked,
      black_screen_schedule_type: scheduleType,
      black_screen_start_time: startTime,
      black_screen_end_time: endTime,
      black_screen_days: days,
      black_screen_message: message,
      black_screen_show_clock: showClock,
    });
  };

  const handleScheduleTypeChange = (
    event: SelectChangeEvent<BlackScreenScheduleType>
  ) => {
    const newType = event.target.value as BlackScreenScheduleType;
    onChange({
      black_screen_enabled: enabled,
      black_screen_schedule_type: newType,
      black_screen_start_time: startTime,
      black_screen_end_time: endTime,
      black_screen_days: newType === "daily" ? [] : days,
      black_screen_message: message,
      black_screen_show_clock: showClock,
    });
  };

  const handleTimeChange = (field: "start" | "end", value: string) => {
    onChange({
      black_screen_enabled: enabled,
      black_screen_schedule_type: scheduleType,
      black_screen_start_time: field === "start" ? value : startTime,
      black_screen_end_time: field === "end" ? value : endTime,
      black_screen_days: days,
      black_screen_message: message,
      black_screen_show_clock: showClock,
    });
  };

  const handleDayToggle = (
    _event: React.MouseEvent<HTMLElement>,
    newDays: DayOfWeek[]
  ) => {
    onChange({
      black_screen_enabled: enabled,
      black_screen_schedule_type: scheduleType,
      black_screen_start_time: startTime,
      black_screen_end_time: endTime,
      black_screen_days: newDays,
      black_screen_message: message,
      black_screen_show_clock: showClock,
    });
  };

  const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      black_screen_enabled: enabled,
      black_screen_schedule_type: scheduleType,
      black_screen_start_time: startTime,
      black_screen_end_time: endTime,
      black_screen_days: days,
      black_screen_message: event.target.value || null,
      black_screen_show_clock: showClock,
    });
  };

  const handleShowClockChange = (checked: boolean) => {
    onChange({
      black_screen_enabled: enabled,
      black_screen_schedule_type: scheduleType,
      black_screen_start_time: startTime,
      black_screen_end_time: endTime,
      black_screen_days: days,
      black_screen_message: message,
      black_screen_show_clock: checked,
    });
  };

  const applyPreset = (preset: (typeof SCHEDULE_PRESETS)[0]) => {
    onChange({
      black_screen_enabled: true,
      black_screen_schedule_type: preset.scheduleType,
      black_screen_start_time: preset.startTime,
      black_screen_end_time: preset.endTime,
      black_screen_days: preset.days,
      black_screen_message: preset.message || null,
      black_screen_show_clock: showClock,
    });
  };

  // Calculate schedule summary text
  const getScheduleSummary = () => {
    if (!enabled || !startTime || !endTime) {
      return language === "ms" ? "Tidak aktif" : "Not active";
    }

    const timeRange = `${startTime} - ${endTime}`;

    if (scheduleType === "daily") {
      return language === "ms"
        ? `Setiap hari, ${timeRange}`
        : `Daily, ${timeRange}`;
    }

    if (days.length === 0) {
      return language === "ms" ? "Tiada hari dipilih" : "No days selected";
    }

    const dayNames = days
      .sort()
      .map((d) => DAY_LABELS[d][language])
      .join(", ");

    return `${dayNames}, ${timeRange}`;
  };

  // Check if time spans midnight
  const spansOvernight = () => {
    if (!startTime || !endTime) return false;
    return startTime > endTime;
  };

  return (
    <Card variant="outlined">
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {enabled ? (
              <VisibilityOffIcon color="primary" />
            ) : (
              <ScheduleIcon color="action" />
            )}
            <Typography variant="h6">
              {language === "ms"
                ? "Jadual Skrin Hitam"
                : "Black Screen Schedule"}
            </Typography>
            <Tooltip
              title={
                language === "ms"
                  ? "Jadualkan paparan TV untuk menunjukkan skrin hitam secara automatik pada masa tertentu."
                  : "Schedule the TV display to automatically show a black screen at specific times."
              }
            >
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={enabled}
                onChange={(e) => handleEnabledChange(e.target.checked)}
                color="primary"
              />
            }
            label={
              enabled
                ? language === "ms"
                  ? "Aktif"
                  : "Active"
                : language === "ms"
                  ? "Tidak Aktif"
                  : "Inactive"
            }
            labelPlacement="start"
          />
        </Box>

        {/* Schedule Summary */}
        {enabled && (
          <Alert severity="info" sx={{ mb: 2 }} icon={<VisibilityOffIcon />}>
            <Typography variant="body2">
              <strong>{language === "ms" ? "Jadual:" : "Schedule:"}</strong>{" "}
              {getScheduleSummary()}
            </Typography>
            {spansOvernight() && (
              <Typography variant="caption" color="text.secondary">
                {language === "ms"
                  ? "(Merentasi tengah malam)"
                  : "(Spans overnight)"}
              </Typography>
            )}
          </Alert>
        )}

        <Collapse in={enabled}>
          {/* Preset Buttons */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              {language === "ms" ? "Pilihan Pantas" : "Quick Presets"}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {SCHEDULE_PRESETS.map((preset) => (
                <Chip
                  key={preset.id}
                  label={language === "ms" ? preset.label : preset.labelEn}
                  onClick={() => applyPreset(preset)}
                  color={selectedPreset === preset.id ? "primary" : "default"}
                  variant={selectedPreset === preset.id ? "filled" : "outlined"}
                  sx={{ cursor: "pointer" }}
                />
              ))}
            </Box>
          </Box>

          {/* Schedule Type */}
          <FormControl fullWidth margin="normal">
            <InputLabel>
              {language === "ms" ? "Jenis Jadual" : "Schedule Type"}
            </InputLabel>
            <Select
              value={scheduleType}
              label={language === "ms" ? "Jenis Jadual" : "Schedule Type"}
              onChange={handleScheduleTypeChange}
            >
              <MenuItem value="daily">
                {language === "ms"
                  ? "Harian (Setiap Hari)"
                  : "Daily (Every Day)"}
              </MenuItem>
              <MenuItem value="weekly">
                {language === "ms"
                  ? "Mingguan (Hari Tertentu)"
                  : "Weekly (Specific Days)"}
              </MenuItem>
            </Select>
          </FormControl>

          {/* Day Selection (for weekly) */}
          <Collapse in={scheduleType === "weekly"}>
            <Box sx={{ my: 2 }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                color="text.secondary"
              >
                {language === "ms" ? "Pilih Hari" : "Select Days"}
              </Typography>
              <ToggleButtonGroup
                value={days}
                onChange={handleDayToggle}
                aria-label="days of week"
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  "& .MuiToggleButton-root": {
                    flex: "1 1 auto",
                    minWidth: "48px",
                  },
                }}
              >
                {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => (
                  <ToggleButton
                    key={day}
                    value={day}
                    sx={{
                      // Highlight Friday in green when selected
                      ...(day === 5 &&
                        days.includes(5) && {
                          bgcolor: "success.main",
                          color: "success.contrastText",
                          "&:hover": {
                            bgcolor: "success.dark",
                          },
                        }),
                    }}
                  >
                    <Tooltip title={DAY_LABELS[day][language]}>
                      <span>{DAY_LABELS[day].short}</span>
                    </Tooltip>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              {days.length === 0 && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  {language === "ms"
                    ? "Sila pilih sekurang-kurangnya satu hari"
                    : "Please select at least one day"}
                </Typography>
              )}
            </Box>
          </Collapse>

          {/* Time Range */}
          <Box sx={{ display: "flex", gap: 2, my: 2 }}>
            <TextField
              label={language === "ms" ? "Masa Mula" : "Start Time"}
              type="time"
              value={startTime || ""}
              onChange={(e) => handleTimeChange("start", e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              inputProps={{
                step: 300, // 5 min intervals
              }}
            />
            <TextField
              label={language === "ms" ? "Masa Tamat" : "End Time"}
              type="time"
              value={endTime || ""}
              onChange={(e) => handleTimeChange("end", e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              inputProps={{
                step: 300, // 5 min intervals
              }}
            />
          </Box>
          {spansOvernight() && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="caption">
                {language === "ms"
                  ? "Jadual ini merentasi tengah malam (cth: 22:00 hingga 06:00 keesokan harinya)"
                  : "This schedule spans overnight (e.g., 22:00 to 06:00 next day)"}
              </Typography>
            </Alert>
          )}

          {/* Message */}
          <TextField
            label={
              language === "ms"
                ? "Mesej Paparan (Pilihan)"
                : "Display Message (Optional)"
            }
            value={message || ""}
            onChange={handleMessageChange}
            fullWidth
            margin="normal"
            placeholder={
              language === "ms"
                ? "cth: Solat Jumaat sedang berlangsung"
                : "e.g., Friday prayer in progress"
            }
            helperText={
              language === "ms"
                ? "Mesej ini akan dipaparkan pada skrin hitam"
                : "This message will be displayed on the black screen"
            }
          />

          {/* Show Clock */}
          <FormControlLabel
            control={
              <Switch
                checked={showClock}
                onChange={(e) => handleShowClockChange(e.target.checked)}
              />
            }
            label={
              <Box>
                <Typography variant="body2">
                  {language === "ms" ? "Paparkan Jam" : "Show Clock"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {language === "ms"
                    ? "Paparkan jam semasa di tengah skrin hitam"
                    : "Display current time in the center of the black screen"}
                </Typography>
              </Box>
            }
            sx={{ mt: 1 }}
          />

          {/* Preview */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: "#000",
              borderRadius: 1,
              minHeight: 100,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="caption" color="grey.600" sx={{ mb: 1 }}>
              {language === "ms" ? "Pratonton" : "Preview"}
            </Typography>
            {showClock && (
              <Typography
                variant="h3"
                sx={{ color: "#fff", fontFamily: "monospace", mb: 1 }}
              >
                {new Date().toLocaleTimeString("ms-MY", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </Typography>
            )}
            {message && (
              <Typography
                variant="h6"
                sx={{ color: "#fff", textAlign: "center" }}
              >
                {message}
              </Typography>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default BlackScreenScheduler;
