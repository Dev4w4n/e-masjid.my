import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Grid,
  Avatar,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  Person,
  Mosque,
  AdminPanelSettings,
  Dashboard,
  TrendingUp,
  People,
  LocationOn,
} from "@mui/icons-material";
import { useAuth, usePermissions } from "@masjid-suite/auth";

/**
 * Home/Dashboard page component
 */
function Home() {
  const { user, profile, loading, error } = useAuth();
  const permissions = usePermissions();

  // Debug logging
  console.log("Home component render:", {
    hasUser: !!user,
    userId: user?.id,
    hasProfile: !!profile,
    loading,
    error,
  });

  // Show loading state if still loading
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        flexDirection="column"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your dashboard...
        </Typography>
      </Box>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
          flexDirection="column"
        >
          <Typography variant="h5" color="error" gutterBottom>
            Authentication Error
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {error}
          </Typography>
        </Box>
      </Container>
    );
  }

  const stats = [
    { label: "Total Masjids", value: "3", icon: <Mosque /> },
    { label: "Registered Users", value: "24", icon: <People /> },
    { label: "Admin Applications", value: "2", icon: <AdminPanelSettings /> },
  ];

  const quickActions = [
    {
      title: "My Profile",
      description: "View and edit your personal information",
      icon: <Person />,
      link: "/profile",
      color: "primary" as const,
    },
    {
      title: "Browse Masjids",
      description: "Discover masjids in your area",
      icon: <LocationOn />,
      link: "/masjids",
      color: "secondary" as const,
    },
  ];

  // Add admin-specific actions
  if (permissions.hasAdminPrivileges()) {
    quickActions.push({
      title: "Admin Dashboard",
      description: "Manage applications and users",
      icon: <AdminPanelSettings />,
      link: "/admin/dashboard",
      color: "secondary" as const,
    });
  }

  // Add super admin actions
  if (permissions.isSuperAdmin()) {
    quickActions.push({
      title: "Create Masjid",
      description: "Add a new masjid to the system",
      icon: <Mosque />,
      link: "/masjids/new",
      color: "primary" as const,
    });
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back,{" "}
          {profile?.full_name || user?.email?.split("@")[0] || "User"}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your Islamic community profile and connect with local masjids.
        </Typography>
      </Box>

      {/* Stats Overview (Admin Only) */}
      {permissions.hasAdminPrivileges() && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    width: 56,
                    height: 56,
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Dashboard color="primary" />
          Quick Actions
        </Typography>

        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flex: 1, p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: `${action.color}.main`,
                        mr: 2,
                        width: 48,
                        height: 48,
                      }}
                    >
                      {action.icon}
                    </Avatar>
                    <Typography variant="h6" component="h3">
                      {action.title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    {action.description}
                  </Typography>
                  <Button
                    component={Link}
                    to={action.link}
                    variant="contained"
                    color={action.color}
                    fullWidth
                  >
                    Go to {action.title}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Profile Completion Reminder */}
      {profile && !profile.is_complete && (
        <Card
          sx={{
            bgcolor: "warning.50",
            border: "1px solid",
            borderColor: "warning.main",
          }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "warning.main" }}>
                <TrendingUp />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Complete Your Profile
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Finish setting up your profile to get the most out of Masjid
                  Suite. Add your phone number, address, and select your home
                  masjid.
                </Typography>
                <Button
                  component={Link}
                  to="/profile"
                  variant="contained"
                  color="warning"
                  startIcon={<Person />}
                >
                  Complete Profile
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Recent Activity
        </Typography>
        <Card>
          <CardContent>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              No recent activity to display.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default Home;
