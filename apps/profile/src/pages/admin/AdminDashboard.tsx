import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  LinearProgress,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Skeleton,
} from "@mui/material";
import {
  People,
  Mosque,
  Assignment,
  Analytics,
  CheckCircle,
  Visibility,
  Notifications,
  Refresh,
} from "@mui/icons-material";
import { usePermissions } from "@masjid-suite/auth";
import { supabase } from "@masjid-suite/supabase-client";

// Type definitions for dashboard data
type DashboardData = {
  overview: {
    total_users: number;
    total_masjids: number;
    pending_applications: number;
    active_admins: number;
  };
  recent_activities: {
    id: string;
    type: string;
    description: string;
    timestamp: string;
    icon: string;
  }[];
  top_masjids: {
    id: string;
    name: string;
    status: string;
    created_at: string;
    address: any;
  }[];
};

/**
 * Admin dashboard component for super administrators
 */
function AdminDashboard() {
  const navigate = useNavigate();
  const permissions = usePermissions();

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    overview: {
      total_users: 0,
      total_masjids: 0,
      pending_applications: 0,
      active_admins: 0,
    },
    recent_activities: [],
    top_masjids: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check permissions
  if (!permissions.isSuperAdmin()) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          You don't have permission to access the admin dashboard. Only super
          admins can access this page.
        </Alert>
      </Container>
    );
  }

  // Load dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard metrics
        const [usersCount, masjidsData, pendingAppsData, adminsCount] =
          await Promise.all([
            // Count total users
            supabase.from("users").select("*", { count: "exact", head: true }),
            // Get masjids
            supabase
              .from("masjids")
              .select("*")
              .order("created_at", { ascending: false }),
            // Get pending applications
            supabase.rpc("get_pending_applications"),
            // Count active admins (users with masjid_admin or super_admin role)
            supabase
              .from("users")
              .select("*", { count: "exact", head: true })
              .in("role", ["masjid_admin", "super_admin"]),
          ]);

        const dashboardData: DashboardData = {
          overview: {
            total_users: usersCount.count || 0,
            total_masjids: masjidsData.data?.length || 0,
            pending_applications: pendingAppsData.data?.length || 0,
            active_admins: adminsCount.count || 0,
          },
          recent_activities: [
            // For now, we'll create some mock recent activities
            // In a real app, you'd have an activity log table
            {
              id: "1",
              type: "user_registration",
              description: "New users are registering regularly",
              timestamp: new Date().toISOString(),
              icon: "person",
            },
            {
              id: "2",
              type: "masjid_created",
              description: `${masjidsData.data?.length || 0} masjids in the system`,
              timestamp: new Date().toISOString(),
              icon: "mosque",
            },
            {
              id: "3",
              type: "application_submitted",
              description: `${pendingAppsData.data?.length || 0} pending applications`,
              timestamp: new Date().toISOString(),
              icon: "assignment",
            },
          ],
          top_masjids: masjidsData.data?.slice(0, 5) || [],
        };

        setDashboardData(dashboardData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "person":
        return <People color="primary" />;
      case "mosque":
        return <Mosque color="primary" />;
      case "assignment":
        return <Assignment color="warning" />;
      case "check":
        return <CheckCircle color="success" />;
      default:
        return <Notifications color="action" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      case "pending_verification":
        return "warning";
      default:
        return "default";
    }
  };

  const formatAddress = (address: any) => {
    if (!address || typeof address !== "object") return "N/A";
    return [address.city, address.state].filter(Boolean).join(", ");
  };

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
            Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            System overview and administrative tools for super administrators.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
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

      {loading && <LinearProgress sx={{ mb: 4 }} />}

      <Grid container spacing={3}>
        {/* Overview Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  {loading ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4" color="primary">
                      {dashboardData.overview.total_users.toLocaleString()}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <People />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  {loading ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4" color="primary">
                      {dashboardData.overview.total_masjids}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Total Masjids
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "secondary.main" }}>
                  <Mosque />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  {loading ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4" color="warning.main">
                      {dashboardData.overview.pending_applications}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Pending Applications
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "warning.main" }}>
                  <Assignment />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  {loading ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4" color="success.main">
                      {dashboardData.overview.active_admins}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Active Admins
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <CheckCircle />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Assignment />}
                    onClick={() => navigate("/admin/applications")}
                  >
                    Review Applications
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Mosque />}
                    onClick={() => navigate("/masjids")}
                  >
                    Manage Masjids
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<People />}
                    disabled
                  >
                    User Management
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Analytics />}
                    disabled
                  >
                    View Analytics
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              {loading ? (
                <Box>
                  {[1, 2, 3].map((n) => (
                    <Box
                      key={n}
                      sx={{ display: "flex", alignItems: "center", mb: 2 }}
                    >
                      <Skeleton
                        variant="circular"
                        width={40}
                        height={40}
                        sx={{ mr: 2 }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Skeleton variant="text" width="80%" />
                        <Skeleton variant="text" width="60%" />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <List dense>
                  {dashboardData.recent_activities.map((activity) => (
                    <ListItem key={activity.id}>
                      <ListItemIcon>
                        {getActivityIcon(activity.icon)}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.description}
                        secondary={new Date(activity.timestamp).toLocaleString(
                          "en-MY"
                        )}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Masjids */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Masjids
              </Typography>
              {loading ? (
                <Box>
                  <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" height={200} />
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData.top_masjids.map((masjid) => (
                        <TableRow key={masjid.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {masjid.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatAddress(masjid.address)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={masjid.status}
                              size="small"
                              color={getStatusColor(masjid.status) as any}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  navigate(`/masjids/${masjid.id}`)
                                }
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                      {dashboardData.top_masjids.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography variant="body2" color="text.secondary">
                              No masjids found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AdminDashboard;
