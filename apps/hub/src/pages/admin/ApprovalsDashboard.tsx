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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Divider,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Check,
  Close,
  Visibility,
  Schedule,
  YouTube,
  Image as ImageIcon,
  Person,
  CalendarToday,
} from "@mui/icons-material";
import { useUser } from "@masjid-suite/auth";
import supabase, { masjidService } from "@masjid-suite/supabase-client";

// Simple content interface for display
interface PendingContent {
  id: string;
  title: string;
  description?: string | null;
  type: "image" | "youtube_video";
  url: string;
  duration: number;
  start_date: string;
  end_date: string;
  submitted_by: string;
  submitted_at: string;
  submitter_name?: string;
  masjid_id: string;
  masjid_name?: string;
}

// Dialog state interface
interface ApprovalDialogState {
  open: boolean;
  content: PendingContent | null;
  action: "approve" | "reject";
  notes: string;
}

/**
 * Admin dashboard for content approval
 */
const ApprovalsDashboard: React.FC = () => {
  const user = useUser();
  const [pendingContent, setPendingContent] = useState<PendingContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [userAdminMasjids, setUserAdminMasjids] = useState<string[]>([]);
  const [dialogState, setDialogState] = useState<ApprovalDialogState>({
    open: false,
    content: null,
    action: "approve",
    notes: "",
  });

  // Load user's admin masjids
  useEffect(() => {
    const loadUserAdminMasjids = async () => {
      try {
        if (!user) return;

        const masjidIds = await masjidService.getUserAdminMasjids();
        setUserAdminMasjids(masjidIds);

        if (masjidIds.length === 0) {
          setError(
            "You are not an admin of any masjid. Please contact a super admin to be assigned as a masjid admin."
          );
        }
      } catch (err: any) {
        console.error("Failed to load user admin masjids:", err);
        setError(
          "Failed to load your admin permissions. Please try refreshing the page."
        );
      }
    };

    loadUserAdminMasjids();
  }, [user]);

  // Load pending content from all masjids the user administers
  const loadPendingContent = async () => {
    try {
      setLoading(true);

      if (userAdminMasjids.length === 0) {
        setPendingContent([]);
        return;
      }

      // Get pending content - simplified query for now
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
          submitted_by,
          created_at,
          masjid_id,
          masjids!inner(name)
        `
        )
        .eq("status", "pending")
        .in("masjid_id", userAdminMasjids) // Only show content from masjids the user administers
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Transform data for display, filtering only image and youtube_video types
      const transformedData: PendingContent[] = (data || [])
        .filter(
          (item) => item.type === "image" || item.type === "youtube_video"
        )
        .map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          type: item.type as "image" | "youtube_video",
          url: item.url,
          duration: item.duration,
          start_date: item.start_date,
          end_date: item.end_date,
          submitted_by: item.submitted_by,
          submitted_at: item.created_at || "",
          submitter_name: "User", // Simplified for now - can be enhanced later
          masjid_id: item.masjid_id,
          masjid_name: item.masjids?.name || "Unknown Masjid",
        }));

      setPendingContent(transformedData);
      setError("");
    } catch (err: any) {
      console.error("Failed to load pending content:", err);
      setError(err.message || "Failed to load pending content");
    } finally {
      setLoading(false);
    }
  };

  // Handle approval/rejection
  const handleApprovalAction = async () => {
    if (!dialogState.content) return;

    try {
      const updateData = {
        approved_by: user!.id,
        approved_at: new Date().toISOString(),
        approval_notes: dialogState.notes || null,
        updated_at: new Date().toISOString(),
      };

      if (dialogState.action === "approve") {
        const { error: updateError } = await supabase
          .from("display_content")
          .update({
            status: "active",
            ...updateData,
          })
          .eq("id", dialogState.content.id);

        if (updateError) throw updateError;
      } else {
        const { error: updateError } = await supabase
          .from("display_content")
          .update({
            status: "rejected",
            rejection_reason: dialogState.notes,
            ...updateData,
          })
          .eq("id", dialogState.content.id);

        if (updateError) throw updateError;
      }

      // Remove from pending list
      setPendingContent((prev) =>
        prev.filter((item) => item.id !== dialogState.content!.id)
      );

      // Close dialog
      setDialogState({
        open: false,
        content: null,
        action: "approve",
        notes: "",
      });
    } catch (err: any) {
      console.error("Failed to update content status:", err);
      setError(err.message || "Failed to update content status");
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-MY", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Load data when user admin masjids are loaded
  useEffect(() => {
    if (userAdminMasjids.length > 0) {
      loadPendingContent();
    }
  }, [userAdminMasjids]);

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>Loading pending content...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Content Approvals
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Review and approve content submissions from registered users for your
        managed masjids
      </Typography>

      <Divider sx={{ my: 3 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {pendingContent.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No pending content submissions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            All content has been reviewed or no new submissions yet.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {pendingContent.map((content) => (
            <Grid item xs={12} md={6} lg={4} key={content.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Content Type Badge */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Chip
                      icon={
                        content.type === "image" ? <ImageIcon /> : <YouTube />
                      }
                      label={
                        content.type === "image" ? "Image" : "YouTube Video"
                      }
                      color="primary"
                      size="small"
                    />
                    <Chip
                      icon={<Schedule />}
                      label={`${content.duration}s`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  {/* Title */}
                  <Typography variant="h6" gutterBottom noWrap>
                    {content.title}
                  </Typography>

                  {/* Description */}
                  {content.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {content.description}
                    </Typography>
                  )}

                  {/* Content Preview */}
                  {content.type === "image" ? (
                    <Box
                      sx={{
                        width: "100%",
                        height: 120,
                        backgroundColor: "grey.100",
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                        backgroundImage: `url(${content.url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {!content.url && (
                        <ImageIcon sx={{ fontSize: 48, color: "grey.400" }} />
                      )}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: 120,
                        backgroundColor: "red.50",
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                      }}
                    >
                      <YouTube sx={{ fontSize: 48, color: "red.500" }} />
                    </Box>
                  )}

                  {/* Metadata */}
                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="caption">
                        {content.submitter_name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>
                        📍 {content.masjid_name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="caption">
                        {formatDate(content.start_date)} -{" "}
                        {formatDate(content.end_date)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>

                <CardActions sx={{ justifyContent: "space-between", p: 2 }}>
                  <Tooltip title="Preview Content">
                    <IconButton
                      size="small"
                      onClick={() => window.open(content.url, "_blank")}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<Close />}
                      onClick={() =>
                        setDialogState({
                          open: true,
                          content,
                          action: "reject",
                          notes: "",
                        })
                      }
                    >
                      Reject
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<Check />}
                      onClick={() =>
                        setDialogState({
                          open: true,
                          content,
                          action: "approve",
                          notes: "",
                        })
                      }
                    >
                      Approve
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Approval/Rejection Dialog */}
      <Dialog
        open={dialogState.open}
        onClose={() => setDialogState({ ...dialogState, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogState.action === "approve"
            ? "Approve Content"
            : "Reject Content"}
        </DialogTitle>
        <DialogContent>
          {dialogState.content && (
            <>
              <Typography variant="h6" gutterBottom>
                {dialogState.content.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Submitted by: {dialogState.content.submitter_name}
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={3}
                label={
                  dialogState.action === "approve"
                    ? "Approval Notes (optional)"
                    : "Rejection Reason (required)"
                }
                value={dialogState.notes}
                onChange={(e) =>
                  setDialogState({ ...dialogState, notes: e.target.value })
                }
                required={dialogState.action === "reject"}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogState({ ...dialogState, open: false })}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={dialogState.action === "approve" ? "success" : "error"}
            onClick={handleApprovalAction}
            disabled={
              dialogState.action === "reject" && !dialogState.notes.trim()
            }
          >
            {dialogState.action === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApprovalsDashboard;
