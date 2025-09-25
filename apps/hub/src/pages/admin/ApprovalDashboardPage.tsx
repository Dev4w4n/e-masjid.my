/**
 * ApprovalDashboardPage Component
 *
 * Admin page for reviewing and managing pending content submissions
 * with comprehensive approval queue and bulk operations.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Container,
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Pending as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Schedule as ExpiredIcon,
} from "@mui/icons-material";
import { useAuth } from "@masjid-suite/auth";
import { useApprovalNotifications } from "@masjid-suite/content-management";

// Temporary placeholder types until package import is resolved
interface DisplayContent {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "active" | "expired" | "rejected";
  type: string;
  url: string;
  created_at: string;
  start_date: string;
  end_date: string;
  masjid_id: string;
  submitted_by: string;
}

interface ContentStats {
  pending: number;
  approved: number;
  rejected: number;
  expired: number;
  total: number;
}

/**
 * Admin approval dashboard page
 */
const ApprovalDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [content, setContent] = useState<DisplayContent[]>([]);
  const [stats, setStats] = useState<ContentStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    expired: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time approval notifications hook
  // TODO: Get user's masjid IDs from profile or permissions
  const userMasjidIds = ["test-masjid"]; // Placeholder
  const {
    pendingCount,
    loading: approvalLoading,
    error: approvalError,
  } = useApprovalNotifications(userMasjidIds);

  // Load content for approval
  useEffect(() => {
    const loadContent = async () => {
      if (!user) {
        setError("You must be logged in to access the approval dashboard");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // TODO: Implement actual content loading with content-management package
        // const pendingContent = await getPendingContent();

        // Placeholder data
        const mockContent: DisplayContent[] = [
          {
            id: "1",
            title: "Community Event Announcement",
            description: "Annual charity fundraiser event",
            status: "pending",
            type: "text_announcement",
            url: "",
            created_at: new Date().toISOString(),
            start_date: new Date().toISOString().split("T")[0] || "",
            end_date:
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0] || "",
            masjid_id: "test-masjid",
            submitted_by: "user-1",
          },
          {
            id: "2",
            title: "Prayer Schedule Update",
            description: "Updated prayer times for this month",
            status: "pending",
            type: "image",
            url: "prayer-schedule.jpg",
            created_at: new Date().toISOString(),
            start_date: new Date().toISOString().split("T")[0] || "",
            end_date:
              new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0] || "",
            masjid_id: "test-masjid",
            submitted_by: "user-2",
          },
          {
            id: "3",
            title: "Islamic Lecture Series",
            description: "Weekly educational program",
            status: "active",
            type: "event_poster",
            url: "lecture-poster.jpg",
            created_at: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            start_date: new Date().toISOString().split("T")[0] || "",
            end_date:
              new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0] || "",
            masjid_id: "test-masjid",
            submitted_by: "user-3",
          },
        ];

        setContent(mockContent);

        // Calculate stats
        const newStats = mockContent.reduce(
          (acc, item) => {
            acc[item.status]++;
            acc.total++;
            return acc;
          },
          {
            pending: 0,
            active: 0,
            expired: 0,
            rejected: 0,
            total: 0,
          } as any
        );

        // Map 'active' to 'approved' for display
        setStats({
          pending: newStats.pending,
          approved: newStats.active,
          rejected: newStats.rejected,
          expired: newStats.expired,
          total: newStats.total,
        });
      } catch (err) {
        console.error("Failed to load content:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while loading content"
        );
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [user]);

  // Handle content approval
  const handleApprove = async (contentId: string) => {
    try {
      // TODO: Implement actual approval with content-management package
      console.log("Approve content:", contentId);

      // Update local state
      setContent((prev) =>
        prev.map((item) =>
          item.id === contentId ? { ...item, status: "active" as const } : item
        )
      );
    } catch (err) {
      console.error("Failed to approve content:", err);
      setError("Failed to approve content");
    }
  };

  // Handle content rejection
  const handleReject = async (contentId: string, reason: string) => {
    try {
      // TODO: Implement actual rejection with content-management package
      console.log("Reject content:", contentId, reason);

      // Update local state
      setContent((prev) =>
        prev.map((item) =>
          item.id === contentId
            ? { ...item, status: "rejected" as const }
            : item
        )
      );
    } catch (err) {
      console.error("Failed to reject content:", err);
      setError("Failed to reject content");
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please sign in to access the approval dashboard.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs>
          <Link
            color="inherit"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Link
            color="inherit"
            href="/admin"
            onClick={(e) => {
              e.preventDefault();
              navigate("/admin");
            }}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Admin
          </Link>
          <Typography color="text.primary">Content Approvals</Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Content Approval Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and manage pending content submissions from your masjid
          community.
        </Typography>
      </Box>

      {/* Real-time Status Indicator */}
      {!approvalLoading && !approvalError && (
        <Alert
          severity={pendingCount > 0 ? "warning" : "success"}
          sx={{ mb: 3 }}
          icon={<PendingIcon />}
        >
          <Typography variant="subtitle2">
            Live Status:{" "}
            {pendingCount > 0
              ? `${pendingCount} content items awaiting your approval`
              : "All content has been reviewed"}
          </Typography>
          {pendingCount > 0 && (
            <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>
              Real-time notifications enabled - new submissions will appear
              automatically
            </Typography>
          )}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Stats Cards */}
      {!loading && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <PendingIcon color="warning" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" gutterBottom>
                    Pending
                  </Typography>
                </Box>
                <Typography variant="h4" component="div">
                  {stats.pending}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <ApprovedIcon color="success" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" gutterBottom>
                    Approved
                  </Typography>
                </Box>
                <Typography variant="h4" component="div">
                  {stats.approved}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <RejectedIcon color="error" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" gutterBottom>
                    Rejected
                  </Typography>
                </Box>
                <Typography variant="h4" component="div">
                  {stats.rejected}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <ExpiredIcon color="action" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" gutterBottom>
                    Total
                  </Typography>
                </Box>
                <Typography variant="h4" component="div">
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Approval Queue */}
      {!loading && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Approval Queue
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            ApprovalQueue component will be integrated here once the
            content-management package import is resolved.
          </Typography>

          {/* Placeholder content display */}
          {content
            .filter((item) => item.status === "pending")
            .map((item) => (
              <Box
                key={item.id}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 2,
                  mb: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Type: {item.type} | Submitted by: {item.submitted_by}
                  </Typography>
                  {item.description && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {item.description}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <button
                    onClick={() => handleApprove(item.id)}
                    style={{
                      background: "#4caf50",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(item.id, "Admin decision")}
                    style={{
                      background: "#f44336",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Reject
                  </button>
                </Box>
              </Box>
            ))}

          {content.filter((item) => item.status === "pending").length === 0 && (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "grey.50",
              }}
            >
              <PendingIcon
                sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No pending approvals
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All content has been reviewed.
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default ApprovalDashboardPage;
