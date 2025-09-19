import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Delete,
  LocationOn,
  Phone,
  Email,
  Language,
  People,
  Schedule,
  CheckCircle,
  Info,
  Share,
  Mosque,
  AccessTime,
} from "@mui/icons-material";
import { usePermissions } from "@masjid-suite/auth";
import { masjidService } from "@masjid-suite/supabase-client";

// Fallback masjid data structure for compatibility
const defaultMasjid = {
  id: "",
  name: "Masjid Not Found",
  registration_number: "",
  email: "",
  phone_number: "",
  description: "Masjid data could not be loaded.",
  website_url: "",
  address: {
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postcode: "",
    country: "MYS",
  },
  facilities: [],
  prayer_times_source: "jakim",
  status: "active",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  capacity: 0,
  stats: {
    total_members: 0,
    active_programs: 0,
    monthly_visitors: 0,
  },
};

const mockPrayerTimes = {
  date: "2024-03-15",
  times: {
    fajr: "05:45",
    syuruk: "07:05",
    dhuhr: "13:15",
    asr: "16:30",
    maghrib: "19:20",
    isha: "20:35",
  },
  source: "JAKIM Malaysia",
};

/**
 * Masjid detail view component
 */
function MasjidView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const permissions = usePermissions();

  const [masjid, setMasjid] = useState(defaultMasjid);
  const [prayerTimes, setPrayerTimes] = useState(mockPrayerTimes);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Load masjid data
  useEffect(() => {
    if (id) {
      setLoading(true);
      setError(null);

      // Fetch masjid data from Supabase
      const fetchMasjidData = async () => {
        try {
          const masjidData = await masjidService.getMasjid(id);
          setMasjid({
            ...masjidData,
            // Add missing fields with defaults for compatibility
            website_url: masjidData.email
              ? `https://${masjidData.name.toLowerCase().replace(/\s+/g, "")}.org`
              : null,
            facilities: ["Prayer Hall", "Ablution Area", "Parking"], // Default facilities
            prayer_times_source: "jakim",
            capacity: 200, // Default capacity
            stats: {
              total_members: 150,
              active_programs: 5,
              monthly_visitors: 800,
            },
          });
          setPrayerTimes(mockPrayerTimes); // Keep prayer times as mock for now
        } catch (err) {
          console.error("Error fetching masjid:", err);
          setError(
            err instanceof Error ? err.message : "Failed to fetch masjid data"
          );
          // Fallback to default data
          setMasjid(defaultMasjid);
          setPrayerTimes(mockPrayerTimes);
        } finally {
          setLoading(false);
        }
      };

      fetchMasjidData();
    }
  }, [id]);

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
    const parts = [
      address.address_line_1,
      address.address_line_2,
      address.city,
      address.state,
      address.postcode,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const handleDelete = async () => {
    try {
      // Mock API call - replace with actual implementation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Deleting masjid:", id);
      navigate("/masjids");
    } catch (error) {
      console.error("Failed to delete masjid:", error);
      setError("Failed to delete masjid. Please try again.");
    }
    setDeleteDialogOpen(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: masjid.name,
        text: `Check out ${masjid.name} - ${masjid.description.substring(0, 100)}...`,
        url: window.location.href,
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      // Could show a toast notification here
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading masjid information...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate("/masjids")}>Back to Masjids</Button>
      </Container>
    );
  }

  if (!masjid) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Masjid not found.
        </Alert>
        <Button onClick={() => navigate("/masjids")}>Back to Masjids</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/masjids")}
          sx={{ mb: 2 }}
        >
          Back to Masjids
        </Button>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
                <Mosque />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1">
                  {masjid.name}
                </Typography>
                {masjid.registration_number && (
                  <Typography variant="body2" color="text.secondary">
                    {masjid.registration_number}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Chip
                label={masjid.status}
                color={getStatusColor(masjid.status) as any}
                size="small"
              />
              {masjid.capacity && (
                <Chip
                  icon={<People />}
                  label={`Capacity: ${masjid.capacity}`}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton onClick={handleShare}>
              <Share />
            </IconButton>

            {permissions.canManageMasjids() && (
              <>
                <Button
                  component={Link}
                  to={`/masjids/${id}/edit`}
                  variant="outlined"
                  startIcon={<Edit />}
                >
                  Edit
                </Button>

                {permissions.isSuperAdmin() && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Delete
                  </Button>
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Information */}
        <Grid item xs={12} md={8}>
          {/* Description */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                About
              </Typography>
              <Typography variant="body1" paragraph>
                {masjid.description}
              </Typography>
            </CardContent>
          </Card>

          {/* Contact & Address */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contact & Location
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <List dense>
                    {masjid.phone_number && (
                      <ListItem>
                        <ListItemIcon>
                          <Phone color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Phone"
                          secondary={
                            <a
                              href={`tel:${masjid.phone_number}`}
                              style={{
                                color: "inherit",
                                textDecoration: "none",
                              }}
                            >
                              {masjid.phone_number}
                            </a>
                          }
                        />
                      </ListItem>
                    )}

                    {masjid.email && (
                      <ListItem>
                        <ListItemIcon>
                          <Email color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Email"
                          secondary={
                            <a
                              href={`mailto:${masjid.email}`}
                              style={{
                                color: "inherit",
                                textDecoration: "none",
                              }}
                            >
                              {masjid.email}
                            </a>
                          }
                        />
                      </ListItem>
                    )}

                    {masjid.website_url && (
                      <ListItem>
                        <ListItemIcon>
                          <Language color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Website"
                          secondary={
                            <a
                              href={masjid.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "inherit" }}
                            >
                              {masjid.website_url}
                            </a>
                          }
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <ListItem>
                    <ListItemIcon>
                      <LocationOn color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Address"
                      secondary={formatAddress(masjid.address)}
                    />
                  </ListItem>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Facilities */}
          {masjid.facilities && masjid.facilities.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Facilities
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {masjid.facilities.map((facility, index) => (
                    <Chip
                      key={index}
                      icon={<CheckCircle />}
                      label={facility}
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Prayer Times */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AccessTime color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Prayer Times</Typography>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mb: 2 }}
              >
                {new Date(prayerTimes.date).toLocaleDateString("en-MY", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>

              <List dense>
                {Object.entries(prayerTimes.times).map(([prayer, time]) => (
                  <ListItem key={prayer} sx={{ py: 0.5 }}>
                    <ListItemText
                      primary={prayer.charAt(0).toUpperCase() + prayer.slice(1)}
                      secondary={time}
                      primaryTypographyProps={{ variant: "body2" }}
                      secondaryTypographyProps={{
                        variant: "body2",
                        fontWeight: "medium",
                      }}
                    />
                  </ListItem>
                ))}
              </List>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                Source: {prayerTimes.source}
              </Typography>
            </CardContent>
          </Card>

          {/* Statistics */}
          {masjid.stats && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Statistics
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="h4" color="primary">
                        {masjid.stats.total_members}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Members
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="h4" color="primary">
                        {masjid.stats.active_programs}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Programs
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="h4" color="primary">
                        {masjid.stats.monthly_visitors.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Monthly Visitors
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Meta Information */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Information
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Info color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Created"
                    secondary={new Date(masjid.created_at).toLocaleDateString(
                      "en-MY"
                    )}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Schedule color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Last Updated"
                    secondary={new Date(masjid.updated_at).toLocaleDateString(
                      "en-MY"
                    )}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Schedule color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Prayer Times"
                    secondary={`${masjid.prayer_times_source} (${masjid.prayer_times_source === "jakim" ? "JAKIM" : masjid.prayer_times_source === "auto" ? "Auto-detect" : "Manual"})`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Masjid</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{masjid.name}</strong>? This
            action cannot be undone and will remove all associated data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MasjidView;
