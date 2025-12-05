import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Collapse,
} from "@mui/material";
import {
  CloudUpload,
  Send,
  Image as ImageIcon,
  TextFields,
  QrCode2,
} from "@mui/icons-material";
import { useUser } from "@masjid-suite/auth";
import supabase, { masjidService } from "@masjid-suite/supabase-client";
import { TextOverlayEditor } from "../../components/content/TextOverlayEditor";

// Simple form state interface
interface ContentFormData {
  title: string;
  description: string;
  type: "image" | "youtube_video" | "text_announcement";
  url: string;
  textContent: string; // For text announcements
  masjid_id: string;
  qr_code_enabled: boolean;
  qr_code_url: string;
  qr_code_position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

type ImageCreationMode = "upload" | "text-overlay";

// Masjid option for dropdown
interface MasjidOption {
  id: string;
  name: string;
  address_line_1?: string;
  city?: string;
  state?: string;
}

/**
 * Simple content creation page
 */
const CreateContent: React.FC = () => {
  const user = useUser();

  const [formData, setFormData] = useState<ContentFormData>({
    title: "",
    description: "",
    type: "image",
    url: "",
    textContent: "",
    masjid_id: "",
    qr_code_enabled: true, // Enabled by default
    qr_code_url: "", // Empty means use default (public content page)
    qr_code_position: "bottom-right",
  });

  const [availableMasjids, setAvailableMasjids] = useState<MasjidOption[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMasjids, setLoadingMasjids] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>("");
  const [imageCreationMode, setImageCreationMode] =
    useState<ImageCreationMode>("upload");
  const [generatedCanvas, setGeneratedCanvas] =
    useState<HTMLCanvasElement | null>(null);

  // Load all active masjids for content submission (any registered user can submit to any masjid)
  useEffect(() => {
    const loadAvailableMasjids = async () => {
      try {
        setLoadingMasjids(true);

        // Get all active masjids - any registered user can submit content to any masjid
        const masjids = await masjidService.getAllActiveMasjids();
        setAvailableMasjids(masjids);

        if (masjids.length === 0) {
          setError("No active masjids available for content submission.");
        }
      } catch (err: any) {
        console.error("Failed to load available masjids:", err);
        setError(
          "Failed to load available masjids. Please try refreshing the page."
        );
      } finally {
        setLoadingMasjids(false);
      }
    };

    if (user) {
      loadAvailableMasjids();
    }
  }, [user]);

  // Handle form input changes
  const handleChange =
    (field: keyof ContentFormData) =>
    (
      event:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | { target: { value: unknown } }
    ) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Clear image selection
  const handleClearImage = () => {
    setSelectedFile(null);
    setImagePreview("");
    setError("");
  };

  // Submit form
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Basic validation
      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }

      if (!formData.masjid_id) {
        throw new Error("Please select a masjid");
      }

      if (formData.type === "image" && !selectedFile && !generatedCanvas) {
        throw new Error("Please select an image file or create a text design");
      }

      if (formData.type === "youtube_video" && !formData.url.trim()) {
        throw new Error("YouTube URL is required");
      }

      let contentUrl = formData.url;

      // Upload file if image type
      if (formData.type === "image" && (selectedFile || generatedCanvas)) {
        setUploading(true);

        try {
          let fileToUpload: File;
          let fileExt: string;

          if (generatedCanvas) {
            // Convert canvas to blob and then to file
            const blob = await new Promise<Blob>((resolve) => {
              generatedCanvas.toBlob((blob) => {
                resolve(blob!);
              }, "image/png");
            });

            fileToUpload = new File([blob], "text-design.png", {
              type: "image/png",
            });
            fileExt = "png";
          } else if (selectedFile) {
            fileToUpload = selectedFile;
            fileExt = selectedFile.name.split(".").pop() || "jpg";
          } else {
            throw new Error("No file or canvas to upload");
          }

          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `content-images/${formData.masjid_id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("content-images")
            .upload(filePath, fileToUpload, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) {
            console.error("Upload error:", uploadError);
            throw new Error(`Failed to upload image: ${uploadError.message}`);
          }

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from("content-images").getPublicUrl(filePath);

          contentUrl = publicUrl;
        } finally {
          setUploading(false);
        }
      }

      // Insert content to database with default values for duration and dates
      // Content is active immediately in simplified workflow
      const today = new Date().toISOString().split("T")[0]!;
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]!;

      const { error: dbError } = await supabase.from("display_content").insert([
        {
          masjid_id: formData.masjid_id,
          title: formData.title,
          description: formData.description || null,
          type: formData.type,
          url: contentUrl,
          duration: 10, // Default duration
          start_date: today, // Default to today
          end_date: nextWeek, // Default to 7 days from now
          submitted_by: user!.id,
          status: "active",
          qr_code_enabled: formData.qr_code_enabled,
          qr_code_url: formData.qr_code_url || null,
          qr_code_position: formData.qr_code_position,
        },
      ]);

      if (dbError) throw dbError;

      setSuccess(true);

      // Reset form
      setFormData({
        title: "",
        description: "",
        type: "image",
        url: "",
        textContent: "",
        masjid_id: "", // Don't auto-select, let user choose which masjid to submit to
        qr_code_enabled: true,
        qr_code_url: "",
        qr_code_position: "bottom-right",
      });
      setSelectedFile(null);
      setImagePreview("");
      setGeneratedCanvas(null);
      setImageCreationMode("upload");
      setUploading(false);
    } catch (err: any) {
      console.error("Content submission error:", err);
      setError(err.message || "Failed to submit content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Content Created Successfully!
          </Typography>
          <Typography>
            Your content is now active and will be displayed on the selected
            masjid's TV displays.
          </Typography>
        </Alert>
        <Button variant="contained" onClick={() => setSuccess(false)}>
          Create Another
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Create Content
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Create new content for display on masjid TV screens. Upload your own
        images or create beautiful text designs with Islamic-themed backgrounds.
        Content will be active immediately.
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Paper sx={{ p: 4 }}>
        {loadingMasjids ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Loading your masjids...
            </Typography>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Masjid Selection */}
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Select Masjid to Submit Content To</InputLabel>
                  <Select
                    value={formData.masjid_id}
                    onChange={handleChange("masjid_id")}
                    disabled={availableMasjids.length === 0}
                  >
                    {availableMasjids.map((masjid: MasjidOption) => (
                      <MenuItem key={masjid.id} value={masjid.id}>
                        {masjid.name}{" "}
                        {masjid.city && `- ${masjid.city}, ${masjid.state}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {availableMasjids.length === 0 && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    No active masjids available for content submission.
                  </Typography>
                )}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Your content will be reviewed by the admin(s) of the selected
                  masjid
                </Typography>
              </Grid>

              {/* Content Type Selection */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Content Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => {
                      handleChange("type")(e);
                      // Reset states when switching types
                      setSelectedFile(null);
                      setImagePreview("");
                      setGeneratedCanvas(null);
                      setImageCreationMode("upload");
                    }}
                  >
                    <MenuItem value="image">Image/Text Design</MenuItem>
                    <MenuItem value="youtube_video">YouTube Video</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Title */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Content Title"
                  value={formData.title}
                  onChange={handleChange("title")}
                  required
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description (optional)"
                  value={formData.description}
                  onChange={handleChange("description")}
                />
              </Grid>

              {/* Image Creation - Upload or Text Overlay */}
              {formData.type === "image" && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Create Image Content
                    </Typography>

                    {/* Mode Selection Tabs */}
                    <Tabs
                      value={imageCreationMode}
                      onChange={(_, newValue) => {
                        setImageCreationMode(newValue);
                        // Clear previous selections
                        setSelectedFile(null);
                        setImagePreview("");
                        setGeneratedCanvas(null);
                      }}
                      sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
                    >
                      <Tab
                        value="upload"
                        label="Upload Image"
                        icon={<ImageIcon />}
                        iconPosition="start"
                      />
                      <Tab
                        value="text-overlay"
                        label="Create Text Design"
                        icon={<TextFields />}
                        iconPosition="start"
                      />
                    </Tabs>

                    {/* Upload Mode */}
                    {imageCreationMode === "upload" && (
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Supported formats: JPG, PNG, GIF, WebP (Max 10MB)
                        </Typography>

                        {!selectedFile ? (
                          <>
                            <input
                              accept="image/*"
                              style={{ display: "none" }}
                              id="image-upload"
                              type="file"
                              onChange={handleFileSelect}
                            />
                            <label htmlFor="image-upload">
                              <Button
                                variant="outlined"
                                component="span"
                                startIcon={<CloudUpload />}
                                size="large"
                                sx={{ mt: 1 }}
                              >
                                Choose Image
                              </Button>
                            </label>
                          </>
                        ) : (
                          <Box sx={{ mt: 2 }}>
                            {/* Image Preview */}
                            {imagePreview && (
                              <Box
                                sx={{
                                  mb: 2,
                                  border: "1px solid",
                                  borderColor: "divider",
                                  borderRadius: 1,
                                  p: 2,
                                  bgcolor: "background.default",
                                }}
                              >
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  style={{
                                    maxWidth: "100%",
                                    maxHeight: "400px",
                                    display: "block",
                                    margin: "0 auto",
                                    borderRadius: "4px",
                                  }}
                                />
                              </Box>
                            )}

                            {/* File Info */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                p: 2,
                                bgcolor: "action.hover",
                                borderRadius: 1,
                              }}
                            >
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {selectedFile.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {(selectedFile.size / 1024).toFixed(2)} KB •{" "}
                                  {selectedFile.type}
                                </Typography>
                              </Box>
                              <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                onClick={handleClearImage}
                              >
                                Remove
                              </Button>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Text Overlay Mode */}
                    {imageCreationMode === "text-overlay" && (
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                          sx={{ mb: 2 }}
                        >
                          Create a professional text announcement with
                          Islamic-themed backgrounds or solid colors. Perfect
                          for announcements, quotes, and reminders.
                        </Typography>

                        <TextOverlayEditor
                          onGenerate={(canvas) => {
                            setGeneratedCanvas(canvas);
                            // Show success message
                            const preview = canvas.toDataURL("image/png");
                            setImagePreview(preview);
                          }}
                        />

                        {generatedCanvas && (
                          <Alert severity="success" sx={{ mt: 2 }}>
                            ✓ Text design created! You can now submit this
                            content.
                          </Alert>
                        )}
                      </Box>
                    )}
                  </Paper>
                </Grid>
              )}

              {/* YouTube URL */}
              {formData.type === "youtube_video" && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="YouTube URL"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.url}
                    onChange={handleChange("url")}
                    required
                  />
                </Grid>
              )}

              {/* QR Code Settings */}
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <QrCode2 sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="h6">QR Code Settings</Typography>
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.qr_code_enabled}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            qr_code_enabled: e.target.checked,
                          }))
                        }
                      />
                    }
                    label="Enable QR Code on TV Display"
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1, mb: 2 }}
                  >
                    When enabled, a QR code will appear on the TV display. By
                    default, it links to this content's public detail page where
                    viewers can get more information.
                  </Typography>

                  <Collapse in={formData.qr_code_enabled}>
                    <Grid container spacing={2}>
                      {/* Custom URL */}
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Custom QR Code URL (Optional)"
                          placeholder="https://example.com/your-link"
                          value={formData.qr_code_url}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              qr_code_url: e.target.value,
                            }))
                          }
                          helperText="Leave empty to use default public content page. Enter a custom URL to link to your website, registration form, donation page, etc."
                        />
                      </Grid>

                      {/* Position */}
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>QR Code Position</InputLabel>
                          <Select
                            value={formData.qr_code_position}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                qr_code_position: e.target.value as any,
                              }))
                            }
                            label="QR Code Position"
                          >
                            <MenuItem value="top-left">Top Left</MenuItem>
                            <MenuItem value="top-right">Top Right</MenuItem>
                            <MenuItem value="bottom-left">Bottom Left</MenuItem>
                            <MenuItem value="bottom-right">
                              Bottom Right (Default)
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* Preview Note */}
                      <Grid item xs={12}>
                        <Alert severity="info" icon={<QrCode2 />}>
                          <Typography variant="body2">
                            <strong>QR Code Preview:</strong> The QR code will
                            be generated and displayed on the TV screen when
                            your content is approved and shown. Viewers can scan
                            it with their phones to{" "}
                            {formData.qr_code_url
                              ? "visit your custom link"
                              : "view detailed information about this content"}
                            .
                          </Typography>
                        </Alert>
                      </Grid>
                    </Grid>
                  </Collapse>
                </Paper>
              </Grid>

              {/* Error Display */}
              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={
                      loading ? <CircularProgress size={20} /> : <Send />
                    }
                    disabled={loading || uploading}
                    sx={{ minWidth: 150 }}
                  >
                    {uploading
                      ? "Uploading Image..."
                      : loading
                        ? "Creating..."
                        : "Create Content"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default CreateContent;
