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
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  People,
  Mosque,
  Assignment,
  Analytics,
  CheckCircle,
  Schedule,
  Visibility,
  Notifications,
} from "@mui/icons-material";
import { usePermissions } from "@masjid-suite/auth";

// Mock data for dashboard metrics
const mockDashboardData = {
  overview: {
    total_users: 1247,
    total_masjids: 35,
    pending_applications: 8,
    active_admins: 42,
    monthly_growth: {
      users: 12.5,
      masjids: 8.3,
      applications: -15.2,
    },
  },
  recent_activities: [
    {
      id: "1",
      type: "user_registration",
      description: "New user registered: Ahmad Bin Abdullah",
      timestamp: "2024-03-15T10:30:00Z",
      icon: "person",
    },
    {
      id: "2",
      type: "masjid_created",
      description: "New masjid added: Masjid Al-Falah",
      timestamp: "2024-03-15T09:15:00Z",
      icon: "mosque",
    },
    {
      id: "3",
      type: "application_submitted",
      description: "Admin application submitted for Masjid Ar-Rahman",
      timestamp: "2024-03-15T08:45:00Z",
      icon: "assignment",
    },
    {
      id: "4",
      type: "admin_approved",
      description: "Admin application approved for Fatimah Binti Mohamed",
      timestamp: "2024-03-14T16:20:00Z",
      icon: "check",
    },
  ],
  pending_tasks: [
    {
      id: "1",
      title: "Review 3 pending masjid admin applications",
      priority: "high",
      due_date: "2024-03-16",
      type: "applications",
    },
    {
      id: "2",
      title: "Verify 2 new masjid registrations",
      priority: "medium",
      due_date: "2024-03-18",
      type: "verification",
    },
    {
      id: "3",
      title: "System maintenance scheduled",
      priority: "low",
      due_date: "2024-03-20",
      type: "maintenance",
    },
  ],
  system_health: {
    api_status: "healthy",
    database_status: "healthy",
    external_services: "degraded",
    uptime_percentage: 99.2,
    last_backup: "2024-03-15T02:00:00Z",
  },
  top_masjids: [
    {
      id: "1",
      name: "Masjid Al-Hidayah",
      member_count: 245,
      activity_score: 95,
      location: "Shah Alam, Selangor",
    },
    {
      id: "2",
      name: "Masjid Jamek Sungai Rambai",
      member_count: 312,
      activity_score: 89,
      location: "Bukit Mertajam, Penang",
    },
    {
      id: "3",
      name: "Masjid Ar-Rahman",
      member_count: 178,
      activity_score: 87,
      location: "Kuala Lumpur",
    },
  ],
};

/**
 * Admin dashboard component for super administrators
 */
function AdminDashboard() {
  const navigate = useNavigate();
  const permissions = usePermissions();

  const [dashboardData, setDashboardData] = useState(mockDashboardData);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    // Mock API call - replace with actual implementation
    setTimeout(() => {
      setDashboardData(mockDashboardData);
      setLoading(false);
    }, 1000);
  }, []);

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "success";
      case "degraded":
        return "warning";
      case "down":
        return "error";
      default:
        return "default";
    }
  };

  const formatPercentageChange = (value: number) => {
    const isPositive = value > 0;
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {isPositive ? (
          <TrendingUp color="success" />
        ) : (
          <TrendingDown color="error" />
        )}
        <Typography
          variant="body2"
          color={isPositive ? "success.main" : "error.main"}
          fontWeight="medium"
        >
          {isPositive ? "+" : ""}
          {value.toFixed(1)}%
        </Typography>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          System overview and administrative tools for super administrators.
        </Typography>
      </Box>

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
                  <Typography variant="h4" color="primary">
                    {dashboardData.overview.total_users.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                  {formatPercentageChange(
                    dashboardData.overview.monthly_growth.users
                  )}
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
                  <Typography variant="h4" color="primary">
                    {dashboardData.overview.total_masjids}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Masjids
                  </Typography>
                  {formatPercentageChange(
                    dashboardData.overview.monthly_growth.masjids
                  )}
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
                  <Typography variant="h4" color="warning.main">
                    {dashboardData.overview.pending_applications}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Applications
                  </Typography>
                  {formatPercentageChange(
                    dashboardData.overview.monthly_growth.applications
                  )}
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
                  <Typography variant="h4" color="success.main">
                    {dashboardData.overview.active_admins}
                  </Typography>
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
                    onClick={() => navigate("/admin/users")}
                  >
                    User Management
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CheckCircle />}
                    onClick={() => navigate("/admin/display-management")}
                  >
                    Display Management
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Analytics />}
                    onClick={() => navigate("/admin/analytics")}
                  >
                    View Analytics
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities & Pending Tasks */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <List dense>
                {dashboardData.recent_activities.slice(0, 5).map((activity) => (
                  <ListItem key={activity.id}>
                    <ListItemIcon>
                      {getActivityIcon(activity.icon)}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description}
                      secondary={new Date(activity.timestamp).toLocaleString(
                        "ms-MY"
                      )}
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Button
                  size="small"
                  onClick={() => navigate("/admin/activity-log")}
                >
                  View All Activities
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Tasks
              </Typography>
              <List dense>
                {dashboardData.pending_tasks.map((task) => (
                  <ListItem key={task.id}>
                    <ListItemIcon>
                      <Schedule color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="body2">{task.title}</Typography>
                          <Chip
                            label={task.priority}
                            size="small"
                            color={getPriorityColor(task.priority) as any}
                          />
                        </Box>
                      }
                      secondary={`Due: ${new Date(task.due_date).toLocaleDateString("ms-MY")}`}
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Button size="small" onClick={() => navigate("/admin/tasks")}>
                  View All Tasks
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Health
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="API Status"
                    secondary={
                      <Chip
                        label={dashboardData.system_health.api_status}
                        color={
                          getStatusColor(
                            dashboardData.system_health.api_status
                          ) as any
                        }
                        size="small"
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Database Status"
                    secondary={
                      <Chip
                        label={dashboardData.system_health.database_status}
                        color={
                          getStatusColor(
                            dashboardData.system_health.database_status
                          ) as any
                        }
                        size="small"
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="External Services"
                    secondary={
                      <Chip
                        label={dashboardData.system_health.external_services}
                        color={
                          getStatusColor(
                            dashboardData.system_health.external_services
                          ) as any
                        }
                        size="small"
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Uptime"
                    secondary={`${dashboardData.system_health.uptime_percentage}%`}
                  />
                  <LinearProgress
                    variant="determinate"
                    value={dashboardData.system_health.uptime_percentage}
                    sx={{ width: 60, ml: 2 }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Last Backup"
                    secondary={new Date(
                      dashboardData.system_health.last_backup
                    ).toLocaleString("ms-MY")}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performing Masjids */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performing Masjids
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell align="right">Members</TableCell>
                      <TableCell align="right">Score</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.top_masjids.map((masjid) => (
                      <TableRow key={masjid.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {masjid.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {masjid.location}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {masjid.member_count}
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${masjid.activity_score}%`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/masjids/${masjid.id}`)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AdminDashboard;
