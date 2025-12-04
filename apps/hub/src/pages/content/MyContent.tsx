import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Visibility,
  Edit,
  Delete,
  Refresh,
  YouTube,
  Image as ImageIcon,
  Schedule,
  CalendarToday,
  CheckCircle,
  Cancel,
  Pending,
  FilterList,
} from "@mui/icons-material";
import { useUser } from "@masjid-suite/auth";
import supabase from "@masjid-suite/supabase-client";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@masjid-suite/i18n";

// Content interface for user's submissions
interface UserContent {
  id: string;
  title: string;
  description?: string | null;
  type: "image" | "youtube_video";
  url: string;
  duration: number;
  start_date: string;
  end_date: string;
  status: "pending" | "active" | "rejected" | "expired";
  submitted_at: string;
  masjid_id: string;
  masjid_name?: string;
}

// Filter options
type StatusFilter = "all" | "pending" | "active" | "rejected" | "expired";

interface ResubmitDialogState {
  open: boolean;
  content: UserContent | null;
  title: string;
  description: string;
  duration: number;
  start_date: string;
  end_date: string;
}

/**
 * My Content page - shows user's submitted content with management options
 */
const MyContent: React.FC = () => {
  const user = useUser();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [content, setContent] = useState<UserContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [resubmitDialog, setResubmitDialog] = useState<ResubmitDialogState>({
    open: false,
    content: null,
    title: "",
    description: "",
    duration: 10,
    start_date: "",
    end_date: "",
  });

  // Load user's content
  const loadUserContent = async () => {
    try {
      setLoading(true);

      // Fetch user's content with masjid name
      const { data, error: fetchError } = await supabase
        .from("display_content")
        .select(
          `
          id,
          title,
          description,
          type,
          url,
          duration,
          start_date,
          end_date,
          status,
          created_at,
          masjid_id,
          masjids!inner(
            name
          )
        `
        )
        .eq("submitted_by", user!.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Transform data for display
      const transformedData: UserContent[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type as "image" | "youtube_video",
        url: item.url,
        duration: item.duration,
        start_date: item.start_date,
        end_date: item.end_date,
        status: item.status as "pending" | "active" | "rejected" | "expired",
        submitted_at: item.created_at || "",
        masjid_id: item.masjid_id,
        masjid_name: item.masjids?.name || "Unknown Masjid",
      }));

      setContent(transformedData);
      setError("");
    } catch (err: any) {
      console.error("Failed to load user content:", err);
      setError(err.message || "Failed to load your content");
    } finally {
      setLoading(false);
    }
  };

  // Filter content by status
  const filteredContent = content.filter(
    (item) => statusFilter === "all" || item.status === statusFilter
  );

  // Get status chip properties
  const getStatusChipProps = (status: string) => {
    switch (status) {
      case "pending":
        return { color: "warning" as const, icon: <Pending /> };
      case "active":
        return { color: "success" as const, icon: <CheckCircle /> };
      case "rejected":
        return { color: "error" as const, icon: <Cancel /> };
      case "expired":
        return { color: "default" as const, icon: <Schedule /> };
      default:
        return { color: "default" as const, icon: <Schedule /> };
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ms-MY", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Handle resubmit content
  const handleResubmit = (contentItem: UserContent) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    setResubmitDialog({
      open: true,
      content: contentItem,
      title: contentItem.title,
      description: contentItem.description || "",
      duration: contentItem.duration,
      start_date: tomorrow.toISOString().split("T")[0] || "",
      end_date: nextWeek.toISOString().split("T")[0] || "",
    });
  };

  // Submit resubmission
  const handleResubmitSubmit = async () => {
    if (!resubmitDialog.content) return;

    try {
      const { error: insertError } = await supabase
        .from("display_content")
        .insert([
          {
            masjid_id: resubmitDialog.content.masjid_id,
            title: resubmitDialog.title,
            description: resubmitDialog.description || null,
            type: resubmitDialog.content.type,
            url: resubmitDialog.content.url,
            duration: resubmitDialog.duration,
            start_date: resubmitDialog.start_date,
            end_date: resubmitDialog.end_date,
            submitted_by: user!.id,
            status: "pending",
            resubmission_of: resubmitDialog.content.id,
          },
        ]);

      if (insertError) throw insertError;

      // Reload content to show new submission
      await loadUserContent();

      // Close dialog
      setResubmitDialog({
        open: false,
        content: null,
        title: "",
        description: "",
        duration: 10,
        start_date: "",
        end_date: "",
      });
    } catch (err: any) {
      console.error("Failed to resubmit content:", err);
      setError(err.message || "Failed to resubmit content");
    }
  };

  // Delete content (only drafts/pending)
  const handleDelete = async (contentId: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return;

    try {
      const { error: deleteError } = await supabase
        .from("display_content")
        .delete()
        .eq("id", contentId)
        .eq("submitted_by", user!.id);

      if (deleteError) throw deleteError;

      // Remove from local state
      setContent((prev) => prev.filter((item) => item.id !== contentId));
    } catch (err: any) {
      console.error("Failed to delete content:", err);
      setError(err.message || "Failed to delete content");
    }
  };

  // Load data on mount
  useEffect(() => {
    loadUserContent();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>Loading your content...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            {t("myContent.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("myContent.subtitle")}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate("/content/create")}
          sx={{ height: "fit-content" }}
        >
          {t("myContent.create_new")}
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Filters and Actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>{t("myContent.filter_status")}</InputLabel>
          <Select
            value={statusFilter}
            label={t("myContent.filter_status")}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            startAdornment={<FilterList sx={{ mr: 1 }} />}
          >
            <MenuItem value="all">{t("myContent.all_status")}</MenuItem>
            <MenuItem value="pending">{t("myContent.status_pending")}</MenuItem>
            <MenuItem value="active">
              {t("myContent.status_active_label")}
            </MenuItem>
            <MenuItem value="rejected">
              {t("myContent.status_rejected_label")}
            </MenuItem>
            <MenuItem value="expired">{t("myContent.status_expired")}</MenuItem>
          </Select>
        </FormControl>

        <Tooltip title={t("myContent.refresh")}>
          <IconButton onClick={loadUserContent}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {filteredContent.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            {statusFilter === "all"
              ? t("myContent.no_content")
              : t("myContent.no_filtered_content", { status: statusFilter })}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {statusFilter === "all"
              ? t("myContent.no_content_desc")
              : t("myContent.no_filtered_desc")}
          </Typography>
          {statusFilter === "all" && (
            <Button
              variant="contained"
              onClick={() => navigate("/content/create")}
              sx={{ mt: 2 }}
            >
              {t("myContent.create_content")}
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredContent.map((item) => {
            const statusProps = getStatusChipProps(item.status);

            return (
              <Grid item xs={12} md={6} lg={4} key={item.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Status and Type */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Chip
                        {...statusProps}
                        label={
                          item.status.charAt(0).toUpperCase() +
                          item.status.slice(1)
                        }
                        size="small"
                      />
                      <Chip
                        icon={
                          item.type === "image" ? <ImageIcon /> : <YouTube />
                        }
                        label={
                          item.type === "image"
                            ? t("myContent.type_image")
                            : t("myContent.type_youtube")
                        }
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    {/* Title and Description */}
                    <Typography variant="h6" gutterBottom noWrap>
                      {item.title}
                    </Typography>

                    {item.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.description}
                      </Typography>
                    )}

                    {/* Metadata */}
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Schedule fontSize="small" color="action" />
                        <Typography variant="caption">
                          {t("myContent.duration_label", {
                            duration: item.duration,
                          })}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CalendarToday fontSize="small" color="action" />
                        <Typography variant="caption">
                          {t("myContent.date_range", {
                            start: formatDate(item.start_date),
                            end: formatDate(item.end_date),
                          })}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {t("myContent.submitted_to", {
                          masjid: item.masjid_name || "-",
                        })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("myContent.submitted_on", {
                          date: formatDate(item.submitted_at),
                        })}
                      </Typography>
                    </Stack>

                    {/* Approval/Rejection Notes - Simplified for now */}
                    {item.status === "rejected" && (
                      <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
                        <Typography variant="body2">
                          {t("myContent.status_rejected")}
                        </Typography>
                      </Alert>
                    )}

                    {item.status === "active" && (
                      <Alert severity="success" sx={{ mt: 2, mb: 1 }}>
                        <Typography variant="body2">
                          {t("myContent.status_active")}
                        </Typography>
                      </Alert>
                    )}
                  </CardContent>

                  <CardActions sx={{ justifyContent: "space-between", p: 2 }}>
                    <Tooltip title={t("myContent.preview_content")}>
                      <IconButton
                        size="small"
                        onClick={() => window.open(item.url, "_blank")}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>

                    <Box sx={{ display: "flex", gap: 1 }}>
                      {item.status === "rejected" && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => handleResubmit(item)}
                        >
                          {t("myContent.resubmit")}
                        </Button>
                      )}
                      {(item.status === "pending" ||
                        item.status === "rejected") && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleDelete(item.id)}
                        >
                          {t("myContent.delete")}
                        </Button>
                      )}
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Resubmit Dialog */}
      <Dialog
        open={resubmitDialog.open}
        onClose={() => setResubmitDialog({ ...resubmitDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("myContent.resubmit_title")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t("myContent.resubmit_desc")}
          </Typography>

          <Stack spacing={3}>
            <TextField
              fullWidth
              label={t("myContent.title_field")}
              value={resubmitDialog.title}
              onChange={(e) =>
                setResubmitDialog({ ...resubmitDialog, title: e.target.value })
              }
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label={t("myContent.description_field")}
              value={resubmitDialog.description}
              onChange={(e) =>
                setResubmitDialog({
                  ...resubmitDialog,
                  description: e.target.value,
                })
              }
            />

            <TextField
              fullWidth
              type="number"
              label={t("myContent.duration_field")}
              inputProps={{ min: 5, max: 300 }}
              value={resubmitDialog.duration}
              onChange={(e) =>
                setResubmitDialog({
                  ...resubmitDialog,
                  duration: parseInt(e.target.value),
                })
              }
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                type="date"
                label={t("myContent.start_date")}
                InputLabelProps={{ shrink: true }}
                value={resubmitDialog.start_date}
                onChange={(e) =>
                  setResubmitDialog({
                    ...resubmitDialog,
                    start_date: e.target.value,
                  })
                }
              />
              <TextField
                fullWidth
                type="date"
                label={t("myContent.end_date")}
                InputLabelProps={{ shrink: true }}
                value={resubmitDialog.end_date}
                onChange={(e) =>
                  setResubmitDialog({
                    ...resubmitDialog,
                    end_date: e.target.value,
                  })
                }
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setResubmitDialog({ ...resubmitDialog, open: false })
            }
          >
            {t("myContent.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleResubmitSubmit}
            disabled={!resubmitDialog.title.trim()}
          >
            {t("myContent.resubmit_approval")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyContent;
