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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Delete,
  LocationOn,
  Phone,
  Email,
  People,
  Schedule,
  Info,
  Share,
  Mosque,
  AccessTime,
  Language,
} from "@mui/icons-material";
import { usePermissions } from "@masjid-suite/auth";
import { masjidService } from "@masjid-suite/supabase-client";
import { useTodayPrayerTimes, MalaysianZone } from "@masjid-suite/prayer-times";
import { Database } from "@masjid-suite/shared-types";

type Masjid = Database["public"]["Tables"]["masjids"]["Row"];
type MasjidAdmin =
  Database["public"]["Functions"]["get_masjid_admin_list"]["Returns"][number];

/**
 * Masjid detail view component
 */
function MasjidView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const permissions = usePermissions();

  const [masjid, setMasjid] = useState<Masjid | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [admins, setAdmins] = useState<MasjidAdmin[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [adminsError, setAdminsError] = useState<string | null>(null);

  // Use the real prayer times hook with the masjid's zone code
  const {
    prayerTimes,
    loading: prayerTimesLoading,
    error: prayerTimesError,
  } = useTodayPrayerTimes(
    masjid?.id || null,
    (masjid?.jakim_zone_code as MalaysianZone) || null
  );

  // Load masjid data
  useEffect(() => {
    if (!id) {
      setError("No masjid ID provided.");
      setLoading(false);
      return;
    }

    const fetchMasjid = async () => {
      try {
        setLoading(true);
        const data = await masjidService.getMasjid(id);
        setMasjid(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        console.error("Failed to fetch masjid:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMasjid();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const fetchAdmins = async () => {
      try {
        setAdminsLoading(true);
        const adminData = await masjidService.getMasjidAdmins(id);
        setAdmins(adminData);
        setAdminsError(null);
      } catch (err: any) {
        setAdminsError(err.message);
        console.error("Failed to fetch masjid admins:", err);
      } finally {
        setAdminsLoading(false);
      }
    };

    fetchAdmins();
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
    if (!address || typeof address !== "object") return "No address provided.";
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
    // This remains a mock for now as delete logic can be complex
    try {
      console.log("Deleting masjid:", id);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate("/masjids");
    } catch (error) {
      console.error("Failed to delete masjid:", error);
      setError("Failed to delete masjid. Please try again.");
    }
    setDeleteDialogOpen(false);
  };

  const handleShare = () => {
    if (navigator.share && masjid) {
      navigator.share({
        title: masjid.name,
        text: `Check out ${masjid.name} - ${masjid.description?.substring(0, 100)}...`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Consider adding a toast notification for feedback
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

          {/* Admin List */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Committee
              </Typography>
              {adminsLoading ? (
                <CircularProgress size={24} />
              ) : adminsError ? (
                <Alert severity="error">{adminsError}</Alert>
              ) : admins.length > 0 ? (
                <List dense>
                  {admins.map((admin) => (
                    <ListItem key={admin.user_id}>
                      <ListItemIcon>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {admin.full_name.charAt(0)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={admin.full_name}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {admin.email}
                            </Typography>
                            {admin.phone_number && ` — ${admin.phone_number}`}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No administrators found for this masjid.
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Facilities */}
          {/* {masjid.facilities && masjid.facilities.length > 0 && (
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
          )} */}
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

              {prayerTimesLoading && (
                <Box>
                  <Skeleton
                    variant="text"
                    width="60%"
                    height={24}
                    sx={{ mb: 1 }}
                  />
                  {[...Array(6)].map((_, index) => (
                    <Skeleton
                      key={index}
                      variant="text"
                      height={40}
                      sx={{ mb: 0.5 }}
                    />
                  ))}
                </Box>
              )}

              {prayerTimesError && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Failed to load prayer times: {prayerTimesError}
                  {masjid?.jakim_zone_code
                    ? ` (Zone: ${masjid.jakim_zone_code})`
                    : " (No zone code configured)"}
                </Alert>
              )}

              {prayerTimes && (
                <>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mb: 2 }}
                  >
                    {new Date(prayerTimes.prayer_date).toLocaleDateString(
                      "en-MY",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </Typography>

                  <List dense>
                    <ListItem sx={{ py: 0.5 }}>
                      <ListItemText
                        primary="Fajr"
                        secondary={prayerTimes.fajr_time}
                        primaryTypographyProps={{ variant: "body2" }}
                        secondaryTypographyProps={{
                          variant: "body2",
                          fontWeight: "medium",
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ py: 0.5 }}>
                      <ListItemText
                        primary="Sunrise"
                        secondary={prayerTimes.sunrise_time}
                        primaryTypographyProps={{ variant: "body2" }}
                        secondaryTypographyProps={{
                          variant: "body2",
                          fontWeight: "medium",
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ py: 0.5 }}>
                      <ListItemText
                        primary="Dhuhr"
                        secondary={prayerTimes.dhuhr_time}
                        primaryTypographyProps={{ variant: "body2" }}
                        secondaryTypographyProps={{
                          variant: "body2",
                          fontWeight: "medium",
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ py: 0.5 }}>
                      <ListItemText
                        primary="Asr"
                        secondary={prayerTimes.asr_time}
                        primaryTypographyProps={{ variant: "body2" }}
                        secondaryTypographyProps={{
                          variant: "body2",
                          fontWeight: "medium",
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ py: 0.5 }}>
                      <ListItemText
                        primary="Maghrib"
                        secondary={prayerTimes.maghrib_time}
                        primaryTypographyProps={{ variant: "body2" }}
                        secondaryTypographyProps={{
                          variant: "body2",
                          fontWeight: "medium",
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ py: 0.5 }}>
                      <ListItemText
                        primary="Isha"
                        secondary={prayerTimes.isha_time}
                        primaryTypographyProps={{ variant: "body2" }}
                        secondaryTypographyProps={{
                          variant: "body2",
                          fontWeight: "medium",
                        }}
                      />
                    </ListItem>
                  </List>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    Source: {prayerTimes.source.replace("_", " ")}
                    {masjid?.jakim_zone_code &&
                      ` (Zone: ${masjid.jakim_zone_code})`}
                    <br />
                    Last updated:{" "}
                    {new Date(prayerTimes.fetched_at).toLocaleString("en-MY")}
                  </Typography>
                </>
              )}

              {!prayerTimes && !prayerTimesLoading && !prayerTimesError && (
                <Alert severity="info">
                  Prayer times will be displayed when a JAKIM zone code is
                  configured for this masjid.
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          {/* {masjid.stats && (
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
          )} */}

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
                    secondary={`${masjid.prayer_times_source ?? "Not Set"} (${
                      masjid.prayer_times_source === "jakim"
                        ? "JAKIM"
                        : masjid.prayer_times_source === "auto"
                          ? "Auto-detect"
                          : "Manual"
                    })`}
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
