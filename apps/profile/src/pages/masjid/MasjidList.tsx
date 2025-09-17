import { useState } from "react";
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
} from "@mui/icons-material";
import { usePermissions } from "@masjid-suite/auth";
import { MalaysianState } from "@masjid-suite/shared-types";

// Mock data for demonstration
const mockMasjids = [
  {
    id: "01234567-89ab-cdef-0123-456789abcdef",
    name: "Masjid Jamek Sungai Rambai",
    registration_number: "MSJ-2024-001",
    email: "admin@masjidjameksungairambai.org",
    phone_number: "+60412345678",
    description:
      "Community mosque serving the Sungai Rambai area in Bukit Mertajam. Established in 1985, this mosque serves over 300 families and offers daily prayers, Friday sermons, and religious education programs.",
    address: {
      address_line_1: "Jalan Masjid Jamek",
      address_line_2: "Sungai Rambai",
      city: "Bukit Mertajam",
      state: "Penang",
      postcode: "14000",
      country: "MYS",
    },
    status: "active",
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "01234567-89ab-cdef-0123-456789abcde0",
    name: "Masjid Al-Hidayah",
    registration_number: "MSJ-2024-002",
    email: "contact@masjidalhidayah.my",
    phone_number: "+60387654321",
    description:
      "Modern community mosque in Shah Alam serving diverse Islamic community with multilingual services and youth programs.",
    address: {
      address_line_1: "No. 15, Jalan Masjid Al-Hidayah",
      address_line_2: "Seksyen 7",
      city: "Shah Alam",
      state: "Selangor",
      postcode: "40000",
      country: "MYS",
    },
    status: "active",
    created_at: "2024-02-01T10:00:00Z",
  },
  {
    id: "01234567-89ab-cdef-0123-456789abcde1",
    name: "Masjid Ar-Rahman",
    registration_number: "MSJ-2024-003",
    email: "info@masjidarrahman.org.my",
    phone_number: "+60361234567",
    description:
      "Historic mosque in Kuala Lumpur city center, known for its beautiful architecture and active community outreach programs.",
    address: {
      address_line_1: "Jalan Masjid India",
      address_line_2: "",
      city: "Kuala Lumpur",
      state: "Kuala Lumpur",
      postcode: "50100",
      country: "MYS",
    },
    status: "active",
    created_at: "2024-01-20T10:00:00Z",
  },
];

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
  const [masjids] = useState(mockMasjids);
  const [loading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter masjids based on search and state
  const filteredMasjids = masjids.filter((masjid) => {
    const matchesSearch =
      !searchTerm ||
      masjid.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      masjid.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      masjid.address.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesState =
      !selectedState || masjid.address.state === selectedState;

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
            Masjids
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Discover and connect with masjids in Malaysia.
          </Typography>
        </Box>

        {permissions.canManageMasjids() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate("/masjids/new")}
          >
            Add Masjid
          </Button>
        )}
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search masjids"
                placeholder="Search by name, description, or city"
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
                <InputLabel>Filter by State</InputLabel>
                <Select
                  value={selectedState}
                  label="Filter by State"
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  <MenuItem value="">All States</MenuItem>
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
                Filters
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
              Showing {filteredMasjids.length} of {masjids.length} masjids
            </Typography>
            {(searchTerm || selectedState) && (
              <Button
                size="small"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedState("");
                }}
              >
                Clear Filters
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
              No Masjids Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm || selectedState
                ? "Try adjusting your search criteria."
                : "No masjids have been added yet."}
            </Typography>
            {permissions.canManageMasjids() && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate("/masjids/new")}
              >
                Add First Masjid
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
                    {masjid.description.length > 120
                      ? `${masjid.description.substring(0, 120)}...`
                      : masjid.description}
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
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    component={Link}
                    to={`/masjids/${masjid.id}`}
                    startIcon={<Visibility />}
                    size="small"
                  >
                    View Details
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
