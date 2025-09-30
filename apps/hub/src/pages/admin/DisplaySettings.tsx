import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Box,
  Chip,
  SelectChangeEvent,
  CircularProgress,
  Alert,
} from "@mui/material";
import { SketchPicker, ColorResult } from "react-color";
import {
  getDisplaysForAdmin,
  updateDisplay,
} from "../../services/displayService";
import { DisplayConfig } from "@masjid-suite/shared-types";
import { useSnackbar } from "notistack";

const DisplaySettings = () => {
  const [displays, setDisplays] = useState<DisplayConfig[]>([]);
  const [selectedDisplayId, setSelectedDisplayId] = useState<string | null>(
    null
  );
  const [settings, setSettings] = useState<DisplayConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedDisplays = await getDisplaysForAdmin();
        setDisplays(fetchedDisplays);
        if (fetchedDisplays && fetchedDisplays.length > 0) {
          const firstDisplay = fetchedDisplays[0];
          if (firstDisplay) {
            setSelectedDisplayId(firstDisplay.id);
            setSettings(firstDisplay);
          }
        }
      } catch (error) {
        enqueueSnackbar("Failed to fetch display settings", {
          variant: "error",
        });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [enqueueSnackbar]);

  const handleDisplayChange = (event: SelectChangeEvent<string>) => {
    const id = event.target.value;
    setSelectedDisplayId(id);
    setSettings(displays.find((d) => d.id === id) || null);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) return;
    const { name, value, type, checked } = event.target;
    setSettings({ ...settings, [name]: type === "checkbox" ? checked : value });
  };

  const handleSelectChange = (event: SelectChangeEvent<any>) => {
    if (!settings) return;
    const { name, value } = event.target;
    setSettings({ ...settings, [name]: value });
  };

  const handleColorChange = (color: ColorResult) => {
    if (!settings) return;
    setSettings({ ...settings, prayer_time_color: color.hex });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    try {
      const { id, created_at, updated_at, masjid_id, ...updateData } = settings;
      if (!id) {
        throw new Error("No display ID found to update.");
      }
      const updatedDisplay = await updateDisplay(id, updateData);
      enqueueSnackbar("Settings saved successfully!", { variant: "success" });
      // Optionally re-fetch or update local state
      const updatedDisplays = displays.map((d) =>
        d.id === id ? updatedDisplay : d
      );
      setDisplays(updatedDisplays);
      setSettings(updatedDisplay);
    } catch (err: any) {
      setError(`Failed to save settings: ${err.message}`);
      enqueueSnackbar(`Failed to save settings: ${err.message}`, {
        variant: "error",
      });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!settings) {
    return (
      <Container>
        <Typography>No displays found or selected.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        TV Display Configuration
      </Typography>

      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel id="display-select-label">Select Display</InputLabel>
        <Select
          labelId="display-select-label"
          value={selectedDisplayId || ""}
          label="Select Display"
          onChange={handleDisplayChange}
        >
          {displays.map((display) => (
            <MenuItem key={display.id} value={display.id}>
              {display.display_name} ({display.location_description})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                General Settings
              </Typography>
              <TextField
                name="display_name"
                label="Display Name"
                value={settings.display_name}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                name="description"
                label="Description"
                value={settings.description}
                onChange={handleChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
              <TextField
                name="location_description"
                label="Location"
                value={settings.location_description}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <FormControlLabel
                control={
                  <Switch
                    name="is_active"
                    checked={settings.is_active}
                    onChange={handleChange}
                  />
                }
                label="Display Active"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Physical Display */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Physical Display
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Resolution</InputLabel>
                <Select
                  name="resolution"
                  value={settings.resolution}
                  label="Resolution"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="1920x1080">1920x1080 (Full HD)</MenuItem>
                  <MenuItem value="3840x2160">3840x2160 (4K UHD)</MenuItem>
                  <MenuItem value="1366x768">1366x768 (HD)</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Orientation</InputLabel>
                <Select
                  name="orientation"
                  value={settings.orientation}
                  label="Orientation"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="landscape">Landscape</MenuItem>
                  <MenuItem value="portrait">Portrait</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    name="is_touch_enabled"
                    checked={settings.is_touch_enabled}
                    onChange={handleChange}
                  />
                }
                label="Touch Enabled"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Content Carousel */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Content Carousel
              </Typography>
              <TextField
                name="carousel_interval"
                label="Carousel Interval (seconds)"
                type="number"
                value={settings.carousel_interval}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                name="max_content_items"
                label="Max Content Items"
                type="number"
                value={settings.max_content_items}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Transition</InputLabel>
                <Select
                  name="content_transition_type"
                  value={settings.content_transition_type}
                  label="Transition"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="fade">Fade</MenuItem>
                  <MenuItem value="slide">Slide</MenuItem>
                  <MenuItem value="zoom">Zoom</MenuItem>
                </Select>
              </FormControl>
              <TextField
                name="auto_refresh_interval"
                label="Auto-Refresh Interval (minutes)"
                type="number"
                value={settings.auto_refresh_interval}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Prayer Times */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Prayer Times Display
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Position</InputLabel>
                <Select
                  name="prayer_time_position"
                  value={settings.prayer_time_position}
                  label="Position"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="top">Top</MenuItem>
                  <MenuItem value="bottom">Bottom</MenuItem>
                  <MenuItem value="left">Left</MenuItem>
                  <MenuItem value="right">Right</MenuItem>
                  <MenuItem value="hidden">Hidden</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Font Size</InputLabel>
                <Select
                  name="prayer_time_font_size"
                  value={settings.prayer_time_font_size}
                  label="Font Size"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="small">Small</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="large">Large</MenuItem>
                  <MenuItem value="extra_large">Extra Large</MenuItem>
                </Select>
              </FormControl>
              <TextField
                name="prayer_time_background_opacity"
                label="Background Opacity (0-1)"
                type="number"
                value={settings.prayer_time_background_opacity}
                onChange={handleChange}
                fullWidth
                margin="normal"
                inputProps={{ step: "0.1", min: 0, max: 1 }}
              />
              <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                <Typography>Font Color:</Typography>
                <Chip
                  label={settings.prayer_time_color}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  style={{
                    backgroundColor: settings.prayer_time_color,
                    color: "#fff",
                    marginLeft: "10px",
                  }}
                />
              </Box>
              {showColorPicker && (
                <Box sx={{ position: "relative", zIndex: 2 }}>
                  <Box sx={{ position: "absolute", top: "10px" }}>
                    <SketchPicker
                      color={settings.prayer_time_color}
                      onChangeComplete={handleColorChange}
                    />
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sponsorship */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sponsorship
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    name="show_sponsorship_amounts"
                    checked={settings.show_sponsorship_amounts}
                    onChange={handleChange}
                  />
                }
                label="Show Sponsorship Amounts"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : "Save Settings"}
        </Button>
      </Box>
    </Container>
  );
};

export default DisplaySettings;
