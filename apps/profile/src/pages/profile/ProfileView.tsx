import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Grid,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Edit,
  Email,
  Phone,
  Language,
  Home,
  LocationOn,
  Verified,
  Settings,
} from "@mui/icons-material";
import { useAuth, useProfile } from "@masjid-suite/auth";

/**
 * Profile view page component (read-only display)
 */
function ProfileView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();

  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h6" gutterBottom>
              Profile Not Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please complete your profile setup.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => navigate("/profile")}
            >
              Setup Profile
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const getLanguageDisplay = (code: string) => {
    const languages = {
      en: "English",
      ms: "Bahasa Malaysia",
      zh: "中文",
      ta: "தமிழ்",
    };
    return languages[code as keyof typeof languages] || "English";
  };

  const getRoleDisplay = (role: string) => {
    const roles = {
      super_admin: "Super Administrator",
      masjid_admin: "Masjid Administrator",
      registered: "Registered Member",
      public: "Public User",
    };
    return roles[role as keyof typeof roles] || "Member";
  };

  const getRoleColor = (role: string) => {
    const colors = {
      super_admin: "error" as const,
      masjid_admin: "warning" as const,
      registered: "primary" as const,
      public: "default" as const,
    };
    return colors[role as keyof typeof colors] || "default";
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
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
            My Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View your personal information and preferences.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => navigate("/profile")}
        >
          Edit Profile
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              {/* Profile Header */}
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mr: 3,
                    bgcolor: "primary.main",
                    fontSize: "2rem",
                  }}
                >
                  {profile.full_name?.charAt(0).toUpperCase() || "U"}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" gutterBottom>
                    {profile.full_name || "Unnamed User"}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                      icon={<Verified />}
                      label={getRoleDisplay(profile.user_role || "public")}
                      color={getRoleColor(profile.user_role || "public")}
                      size="small"
                    />
                    {profile.is_complete && (
                      <Chip
                        icon={<Verified />}
                        label="Profile Complete"
                        color="success"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Profile Information */}
              <List disablePadding>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Email color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Address"
                    secondary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {user?.email || "Not provided"}
                        <Chip size="small" label="Verified" color="success" />
                      </Box>
                    }
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Phone color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phone Number"
                    secondary={profile.phone_number || "Not provided"}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Language color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Preferred Language"
                    secondary={getLanguageDisplay(
                      profile.preferred_language || "en"
                    )}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Home color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Home Masjid"
                    secondary={
                      profile.home_masjid_id ? (
                        <Link
                          to={`/masjids/${profile.home_masjid_id}`}
                          style={{ color: "inherit", textDecoration: "none" }}
                        >
                          View Masjid Details
                        </Link>
                      ) : (
                        "Not selected"
                      )
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Side Information */}
        <Grid item xs={12} md={4}>
          {/* Account Status */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Settings color="primary" />
                Account Status
              </Typography>

              <List disablePadding>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemText
                    primary="Member Since"
                    secondary={new Date(
                      profile.created_at
                    ).toLocaleDateString()}
                  />
                </ListItem>

                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemText
                    primary="Last Updated"
                    secondary={new Date(
                      profile.updated_at
                    ).toLocaleDateString()}
                  />
                </ListItem>

                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemText
                    primary="Profile Status"
                    secondary={
                      <Chip
                        label={profile.is_complete ? "Complete" : "Incomplete"}
                        color={profile.is_complete ? "success" : "warning"}
                        size="small"
                      />
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <LocationOn color="primary" />
                Addresses
              </Typography>

              {/* In a real app, this would load from profile_addresses table */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No addresses added yet.
              </Typography>

              <Button
                variant="outlined"
                size="small"
                startIcon={<Edit />}
                onClick={() => navigate("/profile")}
                fullWidth
              >
                Add Address
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "center" }}>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => navigate("/profile")}
        >
          Edit Profile
        </Button>
        <Button variant="outlined" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
}

export default ProfileView;
