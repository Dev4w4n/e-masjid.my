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
} from "@mui/material";
import { CloudUpload, Send } from "@mui/icons-material";
import { useUser } from "@masjid-suite/auth";
import supabase, { masjidService } from "@masjid-suite/supabase-client";

// Simple form state interface
interface ContentFormData {
  title: string;
  description: string;
  type: "image" | "youtube_video";
  url: string;
  duration: number;
  start_date: string;
  end_date: string;
  masjid_id: string;
}

// Masjid option for dropdown
interface MasjidOption {
  id: string;
  name: string;
  address_line_1?: string;
  city?: string;
  state?: string;
}

// Format date for input
const formatDateForInput = (date: Date): string => {
  const datePart = date.toISOString().split("T")[0];
  return datePart || "";
};

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
    duration: 10,
    start_date: formatDateForInput(new Date()),
    end_date: formatDateForInput(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ),
    masjid_id: "",
  });

  const [availableMasjids, setAvailableMasjids] = useState<MasjidOption[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMasjids, setLoadingMasjids] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>("");

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

      if (formData.type === "image" && !selectedFile) {
        throw new Error("Please select an image file");
      }

      if (formData.type === "youtube_video" && !formData.url.trim()) {
        throw new Error("YouTube URL is required");
      }

      let contentUrl = formData.url;

      // Upload file if image type
      if (formData.type === "image" && selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `content-images/${formData.masjid_id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("content-images")
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("content-images").getPublicUrl(filePath);

        contentUrl = publicUrl;
      }

      // Insert content to database
      const { error: dbError } = await supabase.from("display_content").insert([
        {
          masjid_id: formData.masjid_id,
          title: formData.title,
          description: formData.description || null,
          type: formData.type,
          url: contentUrl,
          duration: formData.duration,
          start_date: formData.start_date,
          end_date: formData.end_date,
          submitted_by: user!.id,
          status: "pending",
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
        duration: 10,
        start_date: formatDateForInput(new Date()),
        end_date: formatDateForInput(
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        ),
        masjid_id: "", // Don't auto-select, let user choose which masjid to submit to
      });
      setSelectedFile(null);
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
            Content Submitted Successfully!
          </Typography>
          <Typography>
            Your content has been submitted for approval. You will be notified
            once it's reviewed.
          </Typography>
        </Alert>
        <Button variant="contained" onClick={() => setSuccess(false)}>
          Submit Another
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
        Submit new content to any masjid for approval. The masjid admin(s) will
        review your submission.
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
                  <Select value={formData.type} onChange={handleChange("type")}>
                    <MenuItem value="image">Image</MenuItem>
                    <MenuItem value="youtube_video">YouTube Video</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Duration */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Display Duration (seconds)"
                  type="number"
                  inputProps={{ min: 5, max: 300 }}
                  value={formData.duration}
                  onChange={handleChange("duration")}
                />
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

              {/* Image Upload */}
              {formData.type === "image" && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Upload Image
                  </Typography>
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
                      sx={{ mb: 1 }}
                    >
                      Choose Image
                    </Button>
                  </label>
                  {selectedFile && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Selected: {selectedFile.name} (
                      {Math.round(selectedFile.size / 1024)} KB)
                    </Typography>
                  )}
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

              {/* Date Range */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.start_date}
                  onChange={handleChange("start_date")}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.end_date}
                  onChange={handleChange("end_date")}
                  required
                />
              </Grid>

              {/* Error Display */}
              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Send />}
                    disabled={loading}
                    sx={{ minWidth: 150 }}
                  >
                    {loading ? "Submitting..." : "Submit for Approval"}
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
