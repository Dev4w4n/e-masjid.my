import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Avatar,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Skeleton,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Person,
  Mosque,
  Refresh,
} from "@mui/icons-material";
import { useAuth, usePermissions } from "@masjid-suite/auth";
import { supabase } from "@masjid-suite/supabase-client";

// Type definitions for applications
type ApplicationData = {
  application_id: string;
  user_id: string;
  user_email: string;
  user_full_name: string;
  user_phone: string;
  masjid_id: string;
  masjid_name: string;
  application_message: string;
  applied_at: string;
};

/**
 * Admin applications management component
 */
function AdminApplications() {
  const { profile } = useAuth();
  const permissions = usePermissions();

  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationData | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewComments, setReviewComments] = useState("");
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(
    null
  );

  // Check permissions
  if (!permissions.isSuperAdmin()) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          You don't have permission to manage applications. Only super admins
          can access this page.
        </Alert>
      </Container>
    );
  }

  // Fetch applications from Supabase
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase.rpc(
          "get_pending_applications"
        );

        if (fetchError) {
          throw fetchError;
        }

        setApplications(data || []);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch applications"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Handle application approval
  const handleApprove = async (applicationId: string, comments: string) => {
    try {
      setLoading(true);
      const userId = profile?.user_id;
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const rpcParams: any = {
        application_id: applicationId,
        approving_user_id: userId,
      };

      if (comments) {
        rpcParams.approval_notes = comments;
      }

      const { data, error } = await supabase.rpc(
        "approve_admin_application",
        rpcParams
      );

      if (error) {
        throw error;
      }

      if (data) {
        // Refresh applications
        const { data: refreshedData, error: refreshError } = await supabase.rpc(
          "get_pending_applications"
        );
        if (!refreshError) {
          setApplications(refreshedData || []);
        }

        setReviewDialogOpen(false);
        setSelectedApplication(null);
        setReviewComments("");
      }
    } catch (err) {
      console.error("Error approving application:", err);
      setError(
        err instanceof Error ? err.message : "Failed to approve application"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle application rejection
  const handleReject = async (applicationId: string, comments: string) => {
    try {
      setLoading(true);
      const userId = profile?.user_id;
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase.rpc("reject_admin_application", {
        application_id: applicationId,
        rejecting_user_id: userId,
        rejection_notes: comments,
      });

      if (error) {
        throw error;
      }

      if (data) {
        // Refresh applications
        const { data: refreshedData, error: refreshError } = await supabase.rpc(
          "get_pending_applications"
        );
        if (!refreshError) {
          setApplications(refreshedData || []);
        }

        setReviewDialogOpen(false);
        setSelectedApplication(null);
        setReviewComments("");
      }
    } catch (err) {
      console.error("Error rejecting application:", err);
      setError(
        err instanceof Error ? err.message : "Failed to reject application"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedApplication || !reviewAction) return;

    if (reviewAction === "approve") {
      await handleApprove(selectedApplication.application_id, reviewComments);
    } else {
      await handleReject(selectedApplication.application_id, reviewComments);
    }
  };

  const handleRefreshApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.rpc(
        "get_pending_applications"
      );

      if (fetchError) {
        throw fetchError;
      }

      setApplications(data || []);
    } catch (err) {
      console.error("Error refreshing applications:", err);
      setError(
        err instanceof Error ? err.message : "Failed to refresh applications"
      );
    } finally {
      setLoading(false);
    }
  };

  const openReviewDialog = (
    application: ApplicationData,
    action: "approve" | "reject"
  ) => {
    setSelectedApplication(application);
    setReviewAction(action);
    setReviewComments("");
    setReviewDialogOpen(true);
  };

  const closeReviewDialog = () => {
    setReviewDialogOpen(false);
    setSelectedApplication(null);
    setReviewAction(null);
    setReviewComments("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderApplicationTable = (applicationList: ApplicationData[]) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Applicant</TableCell>
            <TableCell>Masjid</TableCell>
            <TableCell>Message</TableCell>
            <TableCell>Applied Date</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {applicationList.map((application) => (
            <TableRow key={application.application_id}>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {application.user_full_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {application.user_email}
                    </Typography>
                    {application.user_phone && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        {application.user_phone}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Mosque color="action" />
                  <Typography variant="body2">
                    {application.masjid_name}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    maxWidth: 200,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={application.application_message}
                >
                  {application.application_message || "No message provided"}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatDate(application.applied_at)}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                  <Tooltip title="Approve Application">
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => openReviewDialog(application, "approve")}
                    >
                      <CheckCircle />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject Application">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => openReviewDialog(application, "reject")}
                    >
                      <Cancel />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
          {applicationList.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No applications found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Applications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and manage masjid admin applications.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefreshApplications}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Loading Progress */}
      {loading && <LinearProgress sx={{ mb: 4 }} />}

      {/* Applications Content */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Pending Applications ({applications.length})
          </Typography>

          {loading ? (
            <Box>
              <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={200} />
            </Box>
          ) : (
            renderApplicationTable(applications)
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialogOpen}
        onClose={closeReviewDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {reviewAction === "approve" ? "Approve" : "Reject"} Application
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Applicant: {selectedApplication.user_full_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Masjid: {selectedApplication.masjid_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Application Message:
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedApplication.application_message ||
                  "No message provided"}
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            rows={4}
            label={`${reviewAction === "approve" ? "Approval" : "Rejection"} Comments`}
            placeholder={`Enter your comments for ${reviewAction === "approve" ? "approving" : "rejecting"} this application...`}
            value={reviewComments}
            onChange={(e) => setReviewComments(e.target.value)}
            required={reviewAction === "reject"}
          />

          {reviewAction === "reject" && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              * Comments are required for rejection
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReviewDialog}>Cancel</Button>
          <Button
            onClick={handleReviewSubmit}
            variant="contained"
            color={reviewAction === "approve" ? "success" : "error"}
            disabled={reviewAction === "reject" && !reviewComments.trim()}
          >
            {reviewAction === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminApplications;
