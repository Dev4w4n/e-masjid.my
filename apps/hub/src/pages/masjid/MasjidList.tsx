import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Container,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Avatar,
  InputAdornment,
  Skeleton,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Search,
  Add,
  LocationOn,
  Phone,
  Email,
  Visibility,
  Edit,
  FilterList,
  Mosque,
  AdminPanelSettings,
} from "@mui/icons-material";
import { usePermissions } from "@masjid-suite/auth";
import { useTranslation } from "@masjid-suite/i18n";
import { MalaysianState, MasjidWithAdmins } from "@masjid-suite/shared-types";
import { masjidService } from "@masjid-suite/supabase-client";

const malaysianStates: MalaysianState[] = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Malacca",
  "Negeri Sembilan",
  "Pahang",
  "Penang",
  "Perak",
  "Perlis",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
  "Kuala Lumpur",
  "Labuan",
  "Putrajaya",
];

/**
 * Masjid list page component
 */
function MasjidList() {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const { t } = useTranslation();
  const [masjids, setMasjids] = useState<MasjidWithAdmins[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchMasjids = async () => {
      try {
        setLoading(true);
        const data = await masjidService.getAllMasjids();
        setMasjids(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        console.error("Failed to fetch masjids:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMasjids();
  }, []);

  // Filter masjids based on search and state
  const filteredMasjids = masjids.filter((masjid) => {
    const address = masjid.address as any; // Type assertion for JSONB
    const matchesSearch =
      !searchTerm ||
      masjid.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (masjid.description &&
        masjid.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (address?.city &&
        address.city.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesState = !selectedState || address?.state === selectedState;

    return matchesSearch && matchesState;
  });

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
    if (!address || typeof address !== "object") return "";
    const parts = [
      address.address_line_1,
      address.address_line_2,
      address.city,
      address.state,
      address.postcode,
    ].filter(Boolean);
    return parts.join(", ");
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
            {t("masjidList.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("masjidList.subtitle")}
          </Typography>
        </Box>

        {permissions.canManageMasjids() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate("/masjids/new")}
          >
            {t("masjidList.add_masjid")}
          </Button>
        )}
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t("masjidList.search_label")}
                placeholder={t("masjidList.search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* State Filter */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>{t("masjidList.filter_state")}</InputLabel>
                <Select
                  value={selectedState}
                  label={t("masjidList.filter_state")}
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  <MenuItem value="">{t("masjidList.all_states")}</MenuItem>
                  {malaysianStates.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Filter Toggle */}
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
              >
                {t("common.filters")}
              </Button>
            </Grid>
          </Grid>

          {/* Results Count */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t("masjidList.showing_count", {
                filtered: filteredMasjids.length,
                total: masjids.length,
              })}
            </Typography>
            {(searchTerm || selectedState) && (
              <Button
                size="small"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedState("");
                }}
              >
                {t("masjidList.clear_filters")}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Masjid Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Grid item xs={12} md={6} key={n}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton
                    variant="text"
                    width="40%"
                    height={20}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton variant="text" width="100%" height={60} />
                  <Skeleton variant="text" width="80%" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : filteredMasjids.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Avatar
              sx={{
                mx: "auto",
                mb: 2,
                bgcolor: "grey.100",
                width: 64,
                height: 64,
              }}
            >
              <Mosque sx={{ fontSize: "2rem", color: "grey.400" }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {t("masjidList.no_masjids")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm || selectedState
                ? t("masjidList.no_results_desc")
                : t("masjidList.no_masjids_desc")}
            </Typography>
            {permissions.canManageMasjids() && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate("/masjids/new")}
              >
                {t("masjidList.add_first")}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredMasjids.map((masjid) => (
            <Grid item xs={12} md={6} key={masjid.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition:
                    "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  {/* Header */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {masjid.name}
                      </Typography>
                      {masjid.registration_number && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {masjid.registration_number}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={masjid.status}
                      color={getStatusColor(masjid.status) as any}
                      size="small"
                    />
                  </Box>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {masjid.description && masjid.description.length > 120
                      ? `${masjid.description.substring(0, 120)}...`
                      : masjid.description || t("masjidList.no_description")}
                  </Typography>

                  {/* Address */}
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}
                  >
                    <LocationOn
                      color="action"
                      sx={{ mr: 1, mt: 0.5, fontSize: "1rem" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formatAddress(masjid.address)}
                    </Typography>
                  </Box>

                  {/* Contact */}
                  {masjid.phone_number && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Phone color="action" sx={{ mr: 1, fontSize: "1rem" }} />
                      <Typography variant="body2" color="text.secondary">
                        {masjid.phone_number}
                      </Typography>
                    </Box>
                  )}

                  {masjid.email && (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Email color="action" sx={{ mr: 1, fontSize: "1rem" }} />
                      <Typography variant="body2" color="text.secondary">
                        {masjid.email}
                      </Typography>
                    </Box>
                  )}

                  {/* Admins */}
                  {masjid.admins && masjid.admins.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Divider sx={{ mb: 1 }} />
                      <Typography
                        variant="subtitle2"
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <AdminPanelSettings
                          color="action"
                          sx={{ mr: 0.5, fontSize: "1.1rem" }}
                        />
                        {t("masjidList.administrators")}
                      </Typography>
                      <List dense disablePadding>
                        {masjid.admins.map((admin) => (
                          <ListItem key={admin.user_id} disableGutters>
                            <ListItemAvatar sx={{ minWidth: 32 }}>
                              <Avatar
                                sx={{
                                  width: 24,
                                  height: 24,
                                  fontSize: "0.8rem",
                                }}
                              >
                                {admin.full_name?.[0]}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={admin.full_name}
                              secondary={admin.assignment_status}
                              primaryTypographyProps={{ variant: "body2" }}
                              secondaryTypographyProps={{ variant: "caption" }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    component={Link}
                    to={`/masjids/${masjid.id}`}
                    startIcon={<Visibility />}
                    size="small"
                  >
                    {t("masjidList.view_details")}
                  </Button>

                  {permissions.canManageMasjids() && (
                    <IconButton
                      component={Link}
                      to={`/masjids/${masjid.id}/edit`}
                      size="small"
                      sx={{ ml: "auto" }}
                    >
                      <Edit />
                    </IconButton>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default MasjidList;
