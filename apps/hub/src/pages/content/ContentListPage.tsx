/**
 * ContentListPage Component
 *
 * Page for users to view and manage their submitted content
 * with filtering, status tracking, and content actions.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Container,
  Button,
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { Add as AddIcon, Home as HomeIcon } from "@mui/icons-material";
import { useAuth } from "@masjid-suite/auth";
import {
  useContentStatusNotifications,
  useContentMetrics,
  type NotificationData,
} from "@masjid-suite/content-management";

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
}

/**
 * Content list page for user's submissions
 */
const ContentListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [content, setContent] = useState<DisplayContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time notifications and metrics hooks
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    error: notificationsError,
  } = useContentStatusNotifications(user?.id || "");

  const {
    metrics,
    loading: metricsLoading,
    error: metricsError,
  } = useContentMetrics(user?.id || "");

  // Load user's content
  useEffect(() => {
    const loadContent = async () => {
      if (!user) {
        setError("You must be logged in to view your content");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // TODO: Implement actual content loading with content-management package
        // const userContent = await getUserContent(user.id);

        // Placeholder data
        const mockContent: DisplayContent[] = [
          {
            id: "1",
            title: "Welcome Message",
            description: "Welcome to our masjid",
            status: "active",
            type: "text_announcement",
            url: "",
            created_at: new Date().toISOString(),
            start_date: new Date().toISOString().split("T")[0] || "",
            end_date:
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0] || "",
            masjid_id: "test-masjid",
          },
          {
            id: "2",
            title: "Event Poster",
            description: "Upcoming community event",
            status: "pending",
            type: "image",
            url: "event-poster.jpg",
            created_at: new Date().toISOString(),
            start_date: new Date().toISOString().split("T")[0] || "",
            end_date:
              new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0] || "",
            masjid_id: "test-masjid",
          },
        ];

        setContent(mockContent);
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

  // Handle content actions
  const handleCreate = () => {
    navigate("/content/create");
  };

  const handleEdit = (contentItem: DisplayContent) => {
    navigate(`/content/edit/${contentItem.id}`);
  };

  const handleDelete = async (contentItem: DisplayContent) => {
    try {
      // TODO: Implement actual content deletion
      console.log("Delete content:", contentItem.id);

      // Remove from local state
      setContent((prev) => prev.filter((item) => item.id !== contentItem.id));
    } catch (err) {
      console.error("Failed to delete content:", err);
      setError("Failed to delete content");
    }
  };

  const handleDuplicate = (contentItem: DisplayContent) => {
    navigate("/content/create", {
      state: {
        duplicateFrom: contentItem,
      },
    });
  };

  const handleView = (contentItem: DisplayContent) => {
    navigate(`/content/view/${contentItem.id}`);
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Please sign in to view your content.</Alert>
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
          <Typography color="text.primary">My Content</Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            My Content
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your submitted content and track approval status.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Create Content
        </Button>
      </Box>

      {/* Real-time Metrics Dashboard */}
      {!metricsLoading && !metricsError && (
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography color="text.secondary" gutterBottom>
                    Total Content
                  </Typography>
                  <Typography variant="h4" component="div">
                    {metrics.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography color="text.secondary" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h4" component="div" color="warning.main">
                    {metrics.pending}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography color="text.secondary" gutterBottom>
                    Approved
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {metrics.approved}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography color="text.secondary" gutterBottom>
                    Rejected
                  </Typography>
                  <Typography variant="h4" component="div" color="error.main">
                    {metrics.rejected}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Real-time Notifications */}
      {!notificationsLoading && !notificationsError && unreadCount > 0 && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small">
              View All ({unreadCount})
            </Button>
          }
        >
          <Typography variant="subtitle2" gutterBottom>
            Recent Updates ({unreadCount} new)
          </Typography>
          {notifications.slice(0, 2).map((notification: NotificationData) => (
            <Typography key={notification.id} variant="body2" sx={{ mt: 1 }}>
              • {notification.message}
            </Typography>
          ))}
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

      {/* Content List */}
      {!loading && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Content List ({content.length} items)
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Content list component will be integrated here once the
            content-management package import is resolved.
          </Typography>

          {/* Placeholder content display */}
          {content.map((item) => (
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
                  Status: {item.status} | Type: {item.type}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button size="small" onClick={() => handleView(item)}>
                  View
                </Button>
                <Button size="small" onClick={() => handleEdit(item)}>
                  Edit
                </Button>
                <Button size="small" onClick={() => handleDuplicate(item)}>
                  Duplicate
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDelete(item)}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          ))}

          {content.length === 0 && !loading && (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "grey.50",
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No content found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You haven't submitted any content yet.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreate}
              >
                Create Your First Content
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
};

export default ContentListPage;
