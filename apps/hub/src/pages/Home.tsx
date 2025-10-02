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
import { useUser, useProfile, usePermissions } from "@masjid-suite/auth";
import { useTranslation } from "@masjid-suite/i18n";

/**
 * Home/Dashboard page component
 */
function Home() {
  const user = useUser();
  const profile = useProfile();
  const permissions = usePermissions();
  const { t } = useTranslation();

  const stats = [
    { label: t('masjid.total'), value: "3", icon: <Mosque /> },
    { label: t('admin.registered_users'), value: "24", icon: <People /> },
    { label: t('admin.admin_applications'), value: "2", icon: <AdminPanelSettings /> },
  ];

  const quickActions = [
    {
      title: t('profile.my_profile'),
      description: t('home.view_edit_info'),
      icon: <Person />,
      link: "/profile",
      color: "primary" as const,
    },
    {
      title: t('masjid.browse'),
      description: t('home.discover_masjids'),
      icon: <LocationOn />,
      link: "/masjids",
      color: "secondary" as const,
    },
  ];

  // Add admin-specific actions
  if (permissions.hasAdminPrivileges()) {
    quickActions.push({
      title: t('admin.admin_dashboard'),
      description: t('home.manage_apps_users'),
      icon: <AdminPanelSettings />,
      link: "/admin/dashboard",
      color: "secondary" as const,
    });
  }

  // Add super admin actions
  if (permissions.isSuperAdmin()) {
    quickActions.push({
      title: t('masjid.create'),
      description: t('home.add_new_masjid'),
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
          {t('common.welcome')},{" "}
          {profile?.full_name || user?.email?.split("@")[0] || "User"}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('home.subtitle')}
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
          {t('home.quick_actions')}
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
                    {action.title}
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
                  {t('home.complete_profile')}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {t('home.complete_profile_desc')}
                </Typography>
                <Button
                  component={Link}
                  to="/profile"
                  variant="contained"
                  color="warning"
                  startIcon={<Person />}
                >
                  {t('home.complete_profile')}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {t('home.recent_activity')}
        </Typography>
        <Card>
          <CardContent>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              {t('home.no_activity')}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default Home;
