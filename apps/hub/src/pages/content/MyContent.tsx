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
  FormControlLabel,
  Switch,
  Collapse,
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
  CloudUpload,
  Pending,
  FilterList,
  QrCode2,
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
  qr_code_enabled?: boolean;
  qr_code_url?: string | null;
  qr_code_position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

// Filter options
type StatusFilter = "all" | "pending" | "active" | "rejected" | "expired";

interface EditDialogState {
  open: boolean;
  content: UserContent | null;
  title: string;
  description: string;
  duration: number;
  start_date: string;
  end_date: string;
  qr_code_enabled: boolean;
  qr_code_url: string;
  qr_code_position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  newFile: File | null;
  previewUrl: string | null;
}

interface DeleteDialogState {
  open: boolean;
  content: UserContent | null;
}

// Helper to extract storage path from public URL
const getStoragePathFromUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    // URL structure: /storage/v1/object/public/bucket-name/path/to/file
    const publicIndex = pathParts.indexOf("public");
    if (publicIndex !== -1 && pathParts.length > publicIndex + 2) {
      // Skip 'public' and bucket name ('content-images')
      return pathParts.slice(publicIndex + 2).join("/");
    }
    return null;
  } catch (e) {
    console.error("Error parsing URL:", e);
    return null;
  }
};

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
  const [editDialog, setEditDialog] = useState<EditDialogState>({
    open: false,
    content: null,
    title: "",
    description: "",
    duration: 10,
    start_date: "",
    end_date: "",
    qr_code_enabled: true,
    qr_code_url: "",
    qr_code_position: "bottom-right",
    newFile: null,
    previewUrl: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    content: null,
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
          qr_code_enabled,
          qr_code_url,
          qr_code_position,
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
        qr_code_enabled: item.qr_code_enabled ?? true,
        qr_code_url: item.qr_code_url,
        qr_code_position: item.qr_code_position || "bottom-right",
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

  // Open edit dialog
  const handleEdit = (contentItem: UserContent) => {
    setEditDialog({
      open: true,
      content: contentItem,
      title: contentItem.title,
      description: contentItem.description || "",
      duration: contentItem.duration,
      start_date: contentItem.start_date,
      end_date: contentItem.end_date,
      qr_code_enabled: contentItem.qr_code_enabled ?? true,
      qr_code_url: contentItem.qr_code_url || "",
      qr_code_position: contentItem.qr_code_position || "bottom-right",
      newFile: null,
      previewUrl: null,
    });
  };

  // Submit edit
  const handleEditSubmit = async () => {
    if (!editDialog.content) return;

    try {
      let contentUrl = editDialog.content.url;

      // Handle file upload if new file selected
      if (editDialog.newFile) {
        const fileExt = editDialog.newFile.name.split(".").pop() || "jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `content-images/${editDialog.content.masjid_id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("content-images")
          .upload(filePath, editDialog.newFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("content-images").getPublicUrl(filePath);

        contentUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from("display_content")
        .update({
          title: editDialog.title,
          description: editDialog.description || null,
          duration: editDialog.duration,
          start_date: editDialog.start_date,
          end_date: editDialog.end_date,
          qr_code_enabled: editDialog.qr_code_enabled,
          qr_code_url: editDialog.qr_code_url || null,
          qr_code_position: editDialog.qr_code_position,
          url: contentUrl,
        })
        .eq("id", editDialog.content.id)
        .eq("submitted_by", user!.id);

      if (updateError) throw updateError;

      // Delete old image if new one was uploaded
      if (editDialog.newFile && editDialog.content.type === "image") {
        const oldPath = getStoragePathFromUrl(editDialog.content.url);
        if (oldPath) {
          const { error: deleteError } = await supabase.storage
            .from("content-images")
            .remove([oldPath]);

          if (deleteError) {
            console.error("Failed to delete old image:", deleteError);
            // Don't throw here, as the update was successful
          }
        }
      }

      // Reload content to show updated data
      await loadUserContent();

      // Close dialog
      setEditDialog({
        open: false,
        content: null,
        title: "",
        description: "",
        duration: 10,
        start_date: "",
        end_date: "",
        qr_code_enabled: true,
        qr_code_url: "",
        qr_code_position: "bottom-right",
        newFile: null,
        previewUrl: null,
      });
    } catch (err: any) {
      console.error("Failed to update content:", err);
      setError(err.message || "Failed to update content");
    }
  };

  // Open delete dialog
  const handleDelete = (contentItem: UserContent) => {
    setDeleteDialog({
      open: true,
      content: contentItem,
    });
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.content) return;

    try {
      const { error: deleteError } = await supabase
        .from("display_content")
        .delete()
        .eq("id", deleteDialog.content.id)
        .eq("submitted_by", user!.id);

      if (deleteError) throw deleteError;

      // Delete image from storage if it exists
      if (deleteDialog.content.type === "image" && deleteDialog.content.url) {
        const storagePath = getStoragePathFromUrl(deleteDialog.content.url);
        if (storagePath) {
          const { error: storageError } = await supabase.storage
            .from("content-images")
            .remove([storagePath]);

          if (storageError) {
            console.error("Failed to delete image from storage:", storageError);
            // Continue as the record is already deleted
          }
        }
      }

      // Remove from local state
      setContent((prev) =>
        prev.filter((item) => item.id !== deleteDialog.content!.id)
      );

      // Close dialog
      setDeleteDialog({
        open: false,
        content: null,
      });
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
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => handleEdit(item)}
                      >
                        {t("myContent.edit")}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDelete(item)}
                      >
                        {t("myContent.delete")}
                      </Button>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ ...editDialog, open: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t("myContent.edit_title")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t("myContent.edit_desc")}
          </Typography>

          <Stack spacing={3}>
            {/* Image Replacement Section */}
            {editDialog.content?.type === "image" && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Content Image
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 1,
                    bgcolor: "background.default",
                  }}
                >
                  {/* Preview Area */}
                  <Box
                    component="img"
                    src={editDialog.previewUrl || editDialog.content.url}
                    alt="Content Preview"
                    sx={{
                      maxWidth: "100%",
                      maxHeight: 200,
                      objectFit: "contain",
                      borderRadius: 1,
                    }}
                  />

                  {/* Upload Button */}
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUpload />}
                  >
                    Replace Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Validate file size (10MB)
                          if (file.size > 10 * 1024 * 1024) {
                            alert("File size must be less than 10MB");
                            return;
                          }

                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEditDialog({
                              ...editDialog,
                              newFile: file,
                              previewUrl: reader.result as string,
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </Button>

                  {editDialog.newFile && (
                    <Typography variant="caption" color="success.main">
                      New image selected: {editDialog.newFile.name}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            <TextField
              fullWidth
              required
              label={t("myContent.title_field")}
              value={editDialog.title}
              onChange={(e) =>
                setEditDialog({ ...editDialog, title: e.target.value })
              }
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label={t("myContent.description_field")}
              value={editDialog.description}
              onChange={(e) =>
                setEditDialog({
                  ...editDialog,
                  description: e.target.value,
                })
              }
            />

            <TextField
              fullWidth
              type="number"
              required
              label={t("myContent.duration_field")}
              helperText={t("myContent.duration_help")}
              inputProps={{ min: 5, max: 300 }}
              value={editDialog.duration}
              onChange={(e) =>
                setEditDialog({
                  ...editDialog,
                  duration: parseInt(e.target.value) || 10,
                })
              }
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                required
                type="date"
                label={t("myContent.start_date")}
                InputLabelProps={{ shrink: true }}
                value={editDialog.start_date}
                onChange={(e) =>
                  setEditDialog({
                    ...editDialog,
                    start_date: e.target.value,
                  })
                }
              />
              <TextField
                fullWidth
                required
                type="date"
                label={t("myContent.end_date")}
                InputLabelProps={{ shrink: true }}
                value={editDialog.end_date}
                onChange={(e) =>
                  setEditDialog({
                    ...editDialog,
                    end_date: e.target.value,
                  })
                }
              />
            </Box>

            <Divider />

            {/* QR Code Settings */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <QrCode2 sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">
                  {t("myContent.qr_code_title")}
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={editDialog.qr_code_enabled}
                    onChange={(e) =>
                      setEditDialog({
                        ...editDialog,
                        qr_code_enabled: e.target.checked,
                      })
                    }
                  />
                }
                label={t("myContent.qr_code_enabled")}
              />

              <Collapse in={editDialog.qr_code_enabled}>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label={t("myContent.qr_code_url")}
                    helperText={t("myContent.qr_code_url_help")}
                    value={editDialog.qr_code_url}
                    onChange={(e) =>
                      setEditDialog({
                        ...editDialog,
                        qr_code_url: e.target.value,
                      })
                    }
                  />

                  <FormControl fullWidth>
                    <InputLabel>{t("myContent.qr_code_position")}</InputLabel>
                    <Select
                      value={editDialog.qr_code_position}
                      label={t("myContent.qr_code_position")}
                      onChange={(e) =>
                        setEditDialog({
                          ...editDialog,
                          qr_code_position: e.target.value as any,
                        })
                      }
                    >
                      <MenuItem value="top-left">
                        {t("myContent.qr_position_tl")}
                      </MenuItem>
                      <MenuItem value="top-right">
                        {t("myContent.qr_position_tr")}
                      </MenuItem>
                      <MenuItem value="bottom-left">
                        {t("myContent.qr_position_bl")}
                      </MenuItem>
                      <MenuItem value="bottom-right">
                        {t("myContent.qr_position_br")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Collapse>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ ...editDialog, open: false })}>
            {t("myContent.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleEditSubmit}
            disabled={
              !editDialog.title.trim() ||
              editDialog.duration < 5 ||
              editDialog.duration > 300 ||
              !editDialog.start_date ||
              !editDialog.end_date
            }
          >
            {t("myContent.save_changes")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, content: null })}
        maxWidth="sm"
      >
        <DialogTitle>{t("myContent.delete_title")}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t("myContent.delete_warning")}
          </Alert>
          <Typography variant="body1">
            {t("myContent.delete_confirm")}
          </Typography>
          {deleteDialog.content && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "background.default",
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" fontWeight="bold">
                {deleteDialog.content.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {deleteDialog.content.masjid_name}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, content: null })}
          >
            {t("myContent.cancel")}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            startIcon={<Delete />}
          >
            {t("myContent.delete_confirm_btn")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyContent;
