/**
 * ContentForm Component
 *
 * Form for creating and editing content items with validation,
 * file upload, and YouTube URL processing.
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  YouTube as YouTubeIcon,
  Image as ImageIcon,
  Article as TextIcon,
  Event as EventIcon,
  Delete as DeleteIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enUS } from 'date-fns/locale';
import type { Enums } from '@masjid-suite/shared-types';
import {
  validateContentData,
  validateYouTubeUrl,
  validateImageFile,
} from '../utils/content-validator.js';
import {
  extractYouTubeVideoId,
  generateYouTubeThumbnail,
} from '../utils/content-url-helpers.js';

type ContentType = Enums<'content_type'>;

export interface ContentFormData {
  title: string;
  description: string;
  type: ContentType;
  url: string;
  thumbnailUrl?: string | undefined;
  duration: number;
  startDate?: string | undefined;
  endDate?: string | undefined;
  file?: File | undefined;
  tags: string[];
  masjidId: string;
  // Event-specific fields
  eventDate?: string | undefined;
  location?: string | undefined;
  contact?: string | undefined;
}

interface ContentFormProps {
  initialData?: Partial<ContentFormData>;
  onSubmit: (data: ContentFormData) => Promise<void>;
  onCancel?: () => void;
  isEditing?: boolean;
  isLoading?: boolean;
  error?: string | null;
  masjidId: string;
  displayId?: string | null;
}

interface FormErrors {
  title?: string;
  description?: string;
  type?: string;
  url?: string;
  duration?: string;
  startDate?: string;
  endDate?: string;
  file?: string;
  thumbnailUrl?: string;
  general?: string;
  eventDate?: string;
  location?: string;
  contact?: string;
  masjidId?: string;
  tags?: string;
}

const ContentForm: React.FC<ContentFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
  isLoading = false,
  error = null,
  masjidId,
  displayId,
}) => {
  // Form state
  const [formData, setFormData] = useState<ContentFormData>({
    title: initialData?.title || '',
    type: initialData?.type || 'image',
    description: initialData?.description || '',
    url: initialData?.url || '',
    duration: initialData?.duration || 30,
    thumbnailUrl: initialData?.thumbnailUrl,
    startDate: initialData?.startDate,
    endDate: initialData?.endDate,
    file: undefined,
    tags: initialData?.tags || [],
    masjidId: initialData?.masjidId || masjidId,
    // Optional fields for event_poster type
    eventDate: initialData?.eventDate,
    location: initialData?.location,
    contact: initialData?.contact,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Content type options
  const contentTypes = [
    { value: 'image' as ContentType, label: 'Image', icon: <ImageIcon /> },
    {
      value: 'youtube_video' as ContentType,
      label: 'YouTube Video',
      icon: <YouTubeIcon />,
    },
    {
      value: 'text_announcement' as ContentType,
      label: 'Text Announcement',
      icon: <TextIcon />,
    },
    {
      value: 'event_poster' as ContentType,
      label: 'Event Poster',
      icon: <EventIcon />,
    },
  ];

  // Validation
  const validateField = async (field: keyof ContentFormData, value: any) => {
    const newErrors = { ...errors };
    delete newErrors[field];

    try {
      switch (field) {
        case 'title':
          if (!value || value.trim().length === 0) {
            newErrors.title = 'Title is required';
          } else if (value.trim().length > 100) {
            newErrors.title = 'Title must be 100 characters or less';
          }
          break;

        case 'description':
          if (value && value.length > 500) {
            newErrors.description =
              'Description must be 500 characters or less';
          }
          break;

        case 'url':
          if (formData.type === 'youtube_video' && value) {
            if (!validateYouTubeUrl(value)) {
              newErrors.url = 'Please enter a valid YouTube URL';
            }
          } else if (formData.type === 'image' && value && !formData.file) {
            try {
              new URL(value);
            } catch {
              newErrors.url = 'Please enter a valid URL';
            }
          }
          break;

        case 'file':
          if (value && formData.type === 'image') {
            if (!validateImageFile(value)) {
              newErrors.file =
                'Please select a valid image file (JPG, PNG, WEBP, max 10MB)';
            }
          }
          break;

        case 'duration':
          if (value < 5 || value > 300) {
            newErrors.duration = 'Duration must be between 5 and 300 seconds';
          }
          break;
      }
    } catch (err) {
      newErrors[field] = 'Invalid value';
    }

    setErrors(newErrors);
  };

  // Handle form changes
  const handleChange = (field: keyof ContentFormData, value: any) => {
    setFormData((prev: ContentFormData) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  // Handle file upload
  const handleFileUpload = (file: File) => {
    if (validateImageFile(file)) {
      setFormData((prev: ContentFormData) => ({
        ...prev,
        file,
        url: '',
      }));

      // Generate thumbnail preview
      const reader = new FileReader();
      reader.onload = e => {
        const thumbnailUrl = e.target?.result as string;
        setFormData((prev: ContentFormData) => ({ ...prev, thumbnailUrl }));
      };
      reader.readAsDataURL(file);
    } else {
      setErrors(prev => ({
        ...prev,
        file: 'Please select a valid image file (JPG, PNG, WEBP, max 10MB)',
      }));
    }
  };

  // Handle YouTube URL processing
  const handleYouTubeUrl = async (url: string) => {
    setIsProcessingUrl(true);

    try {
      if (validateYouTubeUrl(url)) {
        const videoId = extractYouTubeVideoId(url);
        if (videoId) {
          const thumbnailUrl = generateYouTubeThumbnail(videoId);
          setFormData((prev: ContentFormData) => ({
            ...prev,
            url,
            thumbnailUrl,
          }));
        }
      }
    } catch (err) {
      console.error('Error processing YouTube URL:', err);
    } finally {
      setIsProcessingUrl(false);
    }
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle tag management
  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData((prev: ContentFormData) => ({
        ...prev,
        tags: [...prev.tags, tag.trim()],
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev: ContentFormData) => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const validationData = {
      ...formData,
      masjid_id: formData.masjidId,
    };

    const validation = validateContentData(validationData);
    if (!validation.isValid) {
      // Convert validation errors to FormErrors format
      const formErrors: FormErrors = {};
      if (validation.errors) {
        if (Array.isArray(validation.errors)) {
          formErrors.general = validation.errors.join(', ');
        } else {
          Object.assign(formErrors, validation.errors);
        }
      }
      setErrors(formErrors);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setErrors({
        general:
          err instanceof Error ? err.message : 'Failed to submit content',
      });
    }
  };

  // Render content type specific fields
  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case 'youtube_video':
        return (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="YouTube URL"
              value={formData.url}
              onChange={e => {
                handleChange('url', e.target.value);
                if (e.target.value) {
                  handleYouTubeUrl(e.target.value);
                }
              }}
              error={!!errors.url}
              helperText={errors.url}
              placeholder="https://www.youtube.com/watch?v=..."
              InputProps={{
                endAdornment: isProcessingUrl && <CircularProgress size={20} />,
              }}
            />
          </Grid>
        );

      case 'image':
        return (
          <>
            {!formData.file && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image URL (Optional)"
                  value={formData.url}
                  onChange={e => handleChange('url', e.target.value)}
                  error={!!errors.url}
                  helperText={errors.url || 'Or upload a file below'}
                  placeholder="https://example.com/image.jpg"
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Box
                sx={{
                  border: 2,
                  borderColor: dragActive ? 'primary.main' : 'grey.300',
                  borderStyle: 'dashed',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: dragActive
                    ? 'action.hover'
                    : 'background.paper',
                  cursor: 'pointer',
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <UploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  {formData.file ? 'File Selected' : 'Upload Image'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formData.file
                    ? formData.file.name
                    : 'Drag and drop or click to select'}
                </Typography>
                {errors.file && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    {errors.file}
                  </Typography>
                )}
              </Box>
            </Grid>
          </>
        );

      case 'event_poster':
        return (
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={enUS}
          >
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Event Date"
                value={formData.eventDate ? new Date(formData.eventDate) : null}
                onChange={date =>
                  handleChange('eventDate', date?.toISOString())
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.eventDate,
                    helperText: errors.eventDate,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location || ''}
                onChange={e => handleChange('location', e.target.value)}
                placeholder="Masjid main hall"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact Information"
                value={formData.contact || ''}
                onChange={e => handleChange('contact', e.target.value)}
                placeholder="Contact person or phone number"
              />
            </Grid>
          </LocalizationProvider>
        );

      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {isEditing ? 'Edit Content' : 'Create New Content'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Content Type */}
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.type}>
                  <InputLabel>Content Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Content Type"
                    onChange={e =>
                      handleChange('type', e.target.value as ContentType)
                    }
                  >
                    {contentTypes.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          {type.icon}
                          {type.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.type && (
                    <FormHelperText>{errors.type}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Title */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Title"
                  value={formData.title}
                  onChange={e => handleChange('title', e.target.value)}
                  error={!!errors.title}
                  helperText={errors.title}
                  placeholder="Enter content title"
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={e => handleChange('description', e.target.value)}
                  error={!!errors.description}
                  helperText={errors.description}
                  placeholder="Optional description"
                />
              </Grid>

              {/* Type-specific fields */}
              {renderTypeSpecificFields()}

              {/* Display Duration */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Display Duration (seconds)"
                  value={formData.duration}
                  onChange={e =>
                    handleChange('duration', parseInt(e.target.value, 10))
                  }
                  error={!!errors.duration}
                  helperText={errors.duration}
                  inputProps={{ min: 5, max: 300 }}
                />
              </Grid>

              {/* Start Date */}
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date (Optional)"
                  value={
                    formData.startDate ? new Date(formData.startDate) : null
                  }
                  onChange={date =>
                    handleChange('startDate', date?.toISOString())
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.startDate,
                      helperText: errors.startDate,
                    },
                  }}
                />
              </Grid>

              {/* End Date */}
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date (Optional)"
                  value={formData.endDate ? new Date(formData.endDate) : null}
                  onChange={date =>
                    handleChange('endDate', date?.toISOString())
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.endDate,
                      helperText: errors.endDate,
                    },
                  }}
                />
              </Grid>

              {/* Tags */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tags"
                  placeholder="Press Enter to add tags"
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      addTag(input.value);
                      input.value = '';
                    }
                  }}
                />
                {formData.tags.length > 0 && (
                  <Box
                    sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}
                  >
                    {formData.tags.map(tag => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => removeTag(tag)}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              </Grid>

              {/* Thumbnail Preview */}
              {formData.thumbnailUrl && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="subtitle2">
                      Thumbnail Preview:
                    </Typography>
                    <Box
                      component="img"
                      src={formData.thumbnailUrl}
                      alt="Thumbnail"
                      sx={{
                        width: 100,
                        height: 60,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: 1,
                        borderColor: 'divider',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => setPreviewDialog(true)}
                      title="Preview"
                    >
                      <PreviewIcon />
                    </IconButton>
                  </Box>
                </Grid>
              )}

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box
                  sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}
                >
                  {onCancel && (
                    <Button
                      variant="outlined"
                      onClick={onCancel}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    startIcon={isLoading && <CircularProgress size={20} />}
                  >
                    {isLoading
                      ? 'Submitting...'
                      : isEditing
                        ? 'Update Content'
                        : 'Create Content'}
                  </Button>
                </Box>
              </Grid>
            </Grid>

            {/* General Error */}
            {errors.general && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errors.general}
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog}
        onClose={() => setPreviewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Content Preview</DialogTitle>
        <DialogContent>
          {formData.thumbnailUrl && (
            <Box
              component="img"
              src={formData.thumbnailUrl}
              alt={formData.title}
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: 400,
                objectFit: 'contain',
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export { ContentForm };
