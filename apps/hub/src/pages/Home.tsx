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
} from "@mui/material";
import {
  Person,
  Mosque,
  Dashboard,
  LocationOn,
  Add,
  ViewList,
  Tv,
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

  const quickActions = [
    {
      title: t("profile.my_profile"),
      description: t("home.view_edit_info"),
      icon: <Person />,
      link: "/profile",
      color: "primary" as const,
    },
    {
      title: t("masjid.browse"),
      description: t("home.discover_masjids"),
      icon: <LocationOn />,
      link: "/masjids",
      color: "secondary" as const,
    },
  ];

  // Add content creation actions
  if (user) {
    quickActions.push(
      {
        title: t("nav.create_content"),
        description: "Cipta kandungan baru untuk paparan",
        icon: <Add />,
        link: "/content/create",
        color: "primary" as const,
      },
      {
        title: t("nav.my_content"),
        description: "Lihat kandungan saya",
        icon: <ViewList />,
        link: "/content/my-content",
        color: "secondary" as const,
      }
    );
  }

  // Add admin-specific actions
  if (permissions.hasAdminPrivileges()) {
    quickActions.push({
      title: t("nav.manage_displays"),
      description: "Uruskan paparan TV masjid",
      icon: <Tv />,
      link: "/admin/display-management",
      color: "primary" as const,
    });
  }

  // Add super admin actions
  if (permissions.isSuperAdmin()) {
    quickActions.push({
      title: t("masjid.create"),
      description: t("home.add_new_masjid"),
      icon: <Mosque />,
      link: "/masjids/new",
      color: "secondary" as const,
    });
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 6, textAlign: "center" }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          {t("common.welcome")},{" "}
          <Box
            component="span"
            sx={{
              background: "linear-gradient(135deg, #2563EB 0%, #0D9488 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {profile?.full_name || user?.email?.split("@")[0] || "User"}
          </Box>
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 800, mx: "auto" }}
        >
          {t("home.subtitle")}
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
        >
          <Dashboard color="primary" />
          {t("home.quick_actions")}
        </Typography>

        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 8,
                  },
                }}
              >
                <CardContent sx={{ flex: 1, p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: `${action.color}.main`,
                        mr: 2,
                        width: 56,
                        height: 56,
                      }}
                    >
                      {action.icon}
                    </Avatar>
                  </Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    fontWeight="bold"
                  >
                    {action.title}
                  </Typography>
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
                    sx={{ mt: "auto" }}
                  >
                    {action.title}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}

export default Home;
