/**
 * DisplaySettings Component
 *
 * Component for managing display configuration including
 * rotation intervals, active content selection, and display preferences.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Slider,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  DragIndicator as DragIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import type { Enums } from '@masjid-suite/shared-types';
import type { DisplayContent } from '../types/content.js';

type ContentType = Enums<'content_type'>;

interface DisplayConfig {
  id?: string;
  display_name: string;
  rotation_interval: number;
  auto_refresh: boolean;
  refresh_interval: number;
  show_clock: boolean;
  show_weather: boolean;
  show_prayer_times: boolean;
  active_content_ids: string[];
  content_type_weights: Record<ContentType, number>;
  display_order: 'chronological' | 'priority' | 'random' | 'manual';
  background_color: string;
  text_color: string;
  font_size: 'small' | 'medium' | 'large';
  transition_effect: 'none' | 'fade' | 'slide' | 'zoom';
  created_at?: string;
  updated_at?: string;
}

export interface DisplaySettingsProps {
  /** Masjid ID for the display */
  masjidId: string;
  /** Display ID to configure */
  displayId?: string;
  /** Initial configuration */
  initialConfig?: Partial<DisplayConfig>;
  /** Available content for selection */
  availableContent?: DisplayContent[];
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: string | null;
  /** Save configuration callback */
  onSave?: (config: DisplayConfig) => Promise<void>;
  /** Preview configuration callback */
  onPreview?: (config: DisplayConfig) => void;
  /** Reset to defaults callback */
  onReset?: () => void;
}

const DisplaySettings: React.FC<DisplaySettingsProps> = ({
  masjidId,
  displayId,
  initialConfig,
  availableContent = [],
  isLoading = false,
  error = null,
  onSave,
  onPreview,
  onReset,
}) => {
  // Configuration state
  const [config, setConfig] = useState<DisplayConfig>({
    display_name: 'Main Display',
    rotation_interval: 30,
    auto_refresh: true,
    refresh_interval: 300,
    show_clock: true,
    show_weather: true,
    show_prayer_times: true,
    active_content_ids: [],
    content_type_weights: {
      image: 1,
      youtube_video: 1,
      text_announcement: 1,
      event_poster: 1,
    },
    display_order: 'chronological',
    background_color: '#ffffff',
    text_color: '#000000',
    font_size: 'medium',
    transition_effect: 'fade',
    ...initialConfig,
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update config when initial data changes
  useEffect(() => {
    if (initialConfig) {
      setConfig(prev => ({ ...prev, ...initialConfig }));
    }
  }, [initialConfig]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [config]);

  // Handle configuration changes
  const handleConfigChange = <K extends keyof DisplayConfig>(
    field: K,
    value: DisplayConfig[K]
  ) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  // Handle content selection
  const handleContentToggle = (contentId: string) => {
    setConfig(prev => ({
      ...prev,
      active_content_ids: prev.active_content_ids.includes(contentId)
        ? prev.active_content_ids.filter(id => id !== contentId)
        : [...prev.active_content_ids, contentId],
    }));
  };

  // Handle content type weight changes
  const handleWeightChange = (contentType: ContentType, weight: number) => {
    setConfig(prev => ({
      ...prev,
      content_type_weights: {
        ...prev.content_type_weights,
        [contentType]: weight,
      },
    }));
  };

  // Handle save
  const handleSave = async () => {
    if (onSave) {
      try {
        await onSave(config);
        setHasUnsavedChanges(false);
      } catch (err) {
        console.error('Failed to save configuration:', err);
      }
    }
  };

  // Handle preview
  const handlePreview = () => {
    if (onPreview) {
      onPreview(config);
    }
    setIsPreviewMode(!isPreviewMode);
  };

  // Handle reset
  const handleReset = () => {
    if (onReset) {
      onReset();
    }
    setConfig({
      display_name: 'Main Display',
      rotation_interval: 30,
      auto_refresh: true,
      refresh_interval: 300,
      show_clock: true,
      show_weather: true,
      show_prayer_times: true,
      active_content_ids: [],
      content_type_weights: {
        image: 1,
        youtube_video: 1,
        text_announcement: 1,
        event_poster: 1,
      },
      display_order: 'chronological',
      background_color: '#ffffff',
      text_color: '#000000',
      font_size: 'medium',
      transition_effect: 'fade',
    });
    setHasUnsavedChanges(false);
  };

  // Get content type icon
  const getContentTypeColor = (
    type: ContentType
  ):
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' => {
    switch (type) {
      case 'image':
        return 'primary';
      case 'youtube_video':
        return 'error';
      case 'text_announcement':
        return 'info';
      case 'event_poster':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Header */}
      <Grid item xs={12}>
        <Card>
          <CardHeader
            avatar={<SettingsIcon />}
            title="Display Settings"
            subheader={
              displayId ? `Display ID: ${displayId}` : 'Configure new display'
            }
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  Reset
                </Button>
                <Button
                  variant="outlined"
                  startIcon={isPreviewMode ? <StopIcon /> : <PreviewIcon />}
                  onClick={handlePreview}
                  disabled={isLoading}
                >
                  {isPreviewMode ? 'Stop Preview' : 'Preview'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={isLoading || !hasUnsavedChanges}
                >
                  {isLoading ? <CircularProgress size={20} /> : 'Save'}
                </Button>
              </Box>
            }
          />
        </Card>
      </Grid>

      {/* Error Alert */}
      {error && (
        <Grid item xs={12}>
          <Alert severity="error">{error}</Alert>
        </Grid>
      )}

      {/* Basic Settings */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Basic Configuration" />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Display Name"
                  value={config.display_name}
                  onChange={e =>
                    handleConfigChange('display_name', e.target.value)
                  }
                  placeholder="Enter display name"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography gutterBottom>
                  Rotation Interval (seconds)
                </Typography>
                <Slider
                  value={config.rotation_interval}
                  onChange={(_, value) =>
                    handleConfigChange('rotation_interval', value as number)
                  }
                  min={5}
                  max={300}
                  step={5}
                  marks={[
                    { value: 5, label: '5s' },
                    { value: 30, label: '30s' },
                    { value: 60, label: '1m' },
                    { value: 300, label: '5m' },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Display Order</InputLabel>
                  <Select
                    value={config.display_order}
                    label="Display Order"
                    onChange={e =>
                      handleConfigChange(
                        'display_order',
                        e.target.value as typeof config.display_order
                      )
                    }
                  >
                    <MenuItem value="chronological">Chronological</MenuItem>
                    <MenuItem value="priority">Priority</MenuItem>
                    <MenuItem value="random">Random</MenuItem>
                    <MenuItem value="manual">Manual</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Transition Effect</InputLabel>
                  <Select
                    value={config.transition_effect}
                    label="Transition Effect"
                    onChange={e =>
                      handleConfigChange(
                        'transition_effect',
                        e.target.value as typeof config.transition_effect
                      )
                    }
                  >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="fade">Fade</MenuItem>
                    <MenuItem value="slide">Slide</MenuItem>
                    <MenuItem value="zoom">Zoom</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Display Features */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Display Features" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.show_clock}
                      onChange={e =>
                        handleConfigChange('show_clock', e.target.checked)
                      }
                    />
                  }
                  label="Show Clock"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.show_weather}
                      onChange={e =>
                        handleConfigChange('show_weather', e.target.checked)
                      }
                    />
                  }
                  label="Show Weather"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.show_prayer_times}
                      onChange={e =>
                        handleConfigChange(
                          'show_prayer_times',
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Show Prayer Times"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.auto_refresh}
                      onChange={e =>
                        handleConfigChange('auto_refresh', e.target.checked)
                      }
                    />
                  }
                  label="Auto Refresh"
                />
              </Grid>

              {config.auto_refresh && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Refresh Interval (seconds)"
                    value={config.refresh_interval}
                    onChange={e =>
                      handleConfigChange(
                        'refresh_interval',
                        parseInt(e.target.value, 10)
                      )
                    }
                    inputProps={{ min: 60, max: 3600, step: 60 }}
                  />
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Appearance Settings */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Appearance" />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="color"
                  label="Background Color"
                  value={config.background_color}
                  onChange={e =>
                    handleConfigChange('background_color', e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="color"
                  label="Text Color"
                  value={config.text_color}
                  onChange={e =>
                    handleConfigChange('text_color', e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Font Size</InputLabel>
                  <Select
                    value={config.font_size}
                    label="Font Size"
                    onChange={e =>
                      handleConfigChange(
                        'font_size',
                        e.target.value as typeof config.font_size
                      )
                    }
                  >
                    <MenuItem value="small">Small</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="large">Large</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Content Type Weights */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Content Type Priorities" />
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Adjust how frequently each content type appears in rotation
            </Typography>

            <Grid container spacing={2}>
              {(Object.keys(config.content_type_weights) as ContentType[]).map(
                type => (
                  <Grid item xs={12} key={type}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip
                        label={type.replace('_', ' ')}
                        color={getContentTypeColor(type)}
                        variant="outlined"
                        sx={{ minWidth: 120 }}
                      />
                      <Slider
                        value={config.content_type_weights[type]}
                        onChange={(_, value) =>
                          handleWeightChange(type, value as number)
                        }
                        min={0}
                        max={5}
                        step={1}
                        marks
                        valueLabelDisplay="auto"
                        sx={{ flex: 1 }}
                      />
                    </Box>
                  </Grid>
                )
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Active Content Selection */}
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title="Active Content"
            subheader={`${config.active_content_ids.length} of ${availableContent.length} items selected`}
          />
          <CardContent>
            {availableContent.length === 0 ? (
              <Alert severity="info">
                No content available. Create some content to configure display
                settings.
              </Alert>
            ) : (
              <List>
                {availableContent.map((content, index) => (
                  <React.Fragment key={content.id}>
                    <ListItem>
                      <ListItemIcon>
                        <Chip
                          size="small"
                          label={content.type}
                          color={getContentTypeColor(content.type)}
                          variant="outlined"
                        />
                      </ListItemIcon>

                      <ListItemText
                        primary={content.title}
                        secondary={`Status: ${content.status} • Duration: ${content.duration}s`}
                      />

                      <ListItemSecondaryAction>
                        <Tooltip
                          title={
                            config.active_content_ids.includes(content.id)
                              ? 'Hide'
                              : 'Show'
                          }
                        >
                          <IconButton
                            edge="end"
                            onClick={() => handleContentToggle(content.id)}
                            color={
                              config.active_content_ids.includes(content.id)
                                ? 'primary'
                                : 'default'
                            }
                          >
                            {config.active_content_ids.includes(content.id) ? (
                              <VisibilityIcon />
                            ) : (
                              <VisibilityOffIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>

                    {index < availableContent.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Preview Mode Indicator */}
      {isPreviewMode && (
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: 'warning.light',
              color: 'warning.contrastText',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PlayIcon />
              <Typography variant="h6">Preview Mode Active</Typography>
              <Typography variant="body2" sx={{ ml: 'auto' }}>
                Changes are being previewed in real-time
              </Typography>
            </Box>
          </Paper>
        </Grid>
      )}
    </Grid>
  );
};

export default DisplaySettings;
