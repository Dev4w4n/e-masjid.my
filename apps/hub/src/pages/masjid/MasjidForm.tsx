import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { ArrowBack, Save } from "@mui/icons-material";
import {
  jakimZones,
  malaysianStates,
  prayerTimeSources,
  statusOptions,
} from "@masjid-suite/shared-types";
import { usePermissions } from "@masjid-suite/auth";
import { masjidService } from "@masjid-suite/supabase-client";

// The Zod schema is now the single source of truth for validation
import { masjidSchema, MasjidFormData } from "@masjid-suite/shared-types";

export const MasjidForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canManageMasjids } = usePermissions();
  const isEditMode = Boolean(id);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<MasjidFormData>({
    resolver: zodResolver(masjidSchema),
    defaultValues: {
      name: "",
      description: "",
      email: "",
      phone_number: "",
      registration_number: "",
      website_url: "",
      address: {
        address_line_1: "",
        address_line_2: "",
        city: "",
        postcode: "",
        state: "Selangor", // Default state
        country: "MYS",
      },
      capacity: 100,
      prayer_times_source: "jakim",
      jakim_zone_code: "WLY01",
      status: "pending_verification",
    },
  });

  const selectedState = watch("address.state");
  const prayerSource = watch("prayer_times_source");

  useEffect(() => {
    if (id) {
      const fetchMasjid = async () => {
        try {
          setLoading(true);
          setError(null);
          const masjid = await masjidService.getMasjid(id);
          if (masjid) {
            // Ensure address is an object before resetting
            const address =
              typeof masjid.address === "object" && masjid.address
                ? masjid.address
                : {
                    address_line_1: "",
                    address_line_2: "",
                    city: "",
                    postcode: "",
                    state: "Selangor",
                    country: "MYS",
                  };

            reset({
              ...masjid,
              address,
              capacity: masjid.capacity ?? undefined,
              email: masjid.email ?? undefined,
              phone_number: masjid.phone_number ?? undefined,
              registration_number: masjid.registration_number ?? undefined,
              website_url: masjid.website_url ?? undefined,
              jakim_zone_code: masjid.jakim_zone_code ?? undefined,
            });
          } else {
            setError(`Masjid with ID ${id} not found.`);
          }
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "An unknown error occurred"
          );
        } finally {
          setLoading(false);
        }
      };
      fetchMasjid();
    }
  }, [id, reset]);

  const onSubmit = async (data: MasjidFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (isEditMode && id) {
        // The 'created_by' field should not be sent on update
        const { created_by, ...updateData } = data as any;
        await masjidService.updateMasjid(id, updateData);
      } else {
        // Let the backend handle 'created_by' via RLS/triggers
        const { ...createData } = data as any;
        await masjidService.createMasjid(createData);
      }
      navigate("/masjids");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredJakimZones = jakimZones.filter(
    (zone) => zone.state === selectedState
  );

  // Check permissions
  if (!canManageMasjids()) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          You do not have permission to manage masjids.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container
        maxWidth="md"
        sx={{
          py: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/masjids")}
          sx={{ mb: 2 }}
        >
          Back to Masjids
        </Button>

        <Typography variant="h4" component="h1" gutterBottom>
          {isEditMode ? "Edit Masjid" : "Add New Masjid"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isEditMode
            ? "Update masjid information and settings."
            : "Create a new masjid profile for community management."}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Masjid Name"
                      fullWidth
                      required
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="registration_number"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Registration Number"
                      fullWidth
                      error={!!errors.registration_number}
                      helperText={errors.registration_number?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email Address"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="phone_number"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Phone Number"
                      fullWidth
                      error={!!errors.phone_number}
                      helperText={errors.phone_number?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="website_url"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Website URL"
                      fullWidth
                      error={!!errors.website_url}
                      helperText={errors.website_url?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      multiline
                      rows={4}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Address
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="address.address_line_1"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Address Line 1"
                      fullWidth
                      required
                      error={!!errors.address?.address_line_1}
                      helperText={errors.address?.address_line_1?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="address.address_line_2"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Address Line 2"
                      fullWidth
                      error={!!errors.address?.address_line_2}
                      helperText={errors.address?.address_line_2?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="address.city"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="City"
                      fullWidth
                      required
                      error={!!errors.address?.city}
                      helperText={errors.address?.city?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="address.state"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.address?.state}>
                      <InputLabel>State</InputLabel>
                      <Select {...field} label="State" required>
                        {malaysianStates.map((state: string) => (
                          <MenuItem key={state} value={state}>
                            {state}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.address?.state && (
                        <FormHelperText>
                          {errors.address.state.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="address.postcode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Postcode"
                      fullWidth
                      required
                      error={!!errors.address?.postcode}
                      helperText={errors.address?.postcode?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="address.country"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Country"
                      fullWidth
                      disabled
                      error={!!errors.address?.country}
                      helperText={errors.address?.country?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Configuration
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="capacity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Capacity"
                      type="number"
                      fullWidth
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value)
                        )
                      }
                      error={!!errors.capacity}
                      helperText={errors.capacity?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.status}>
                      <InputLabel>Status</InputLabel>
                      <Select {...field} label="Status">
                        {statusOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.status && (
                        <FormHelperText>{errors.status.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Prayer Time Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="prayer_times_source"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.prayer_times_source}>
                      <InputLabel>Prayer Times Source</InputLabel>
                      <Select {...field} label="Prayer Times Source">
                        {prayerTimeSources.map((source) => (
                          <MenuItem key={source.value} value={source.value}>
                            {source.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.prayer_times_source && (
                        <FormHelperText>
                          {errors.prayer_times_source.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              {prayerSource === "jakim" && (
                <Grid item xs={12} md={6}>
                  <Controller
                    name="jakim_zone_code"
                    control={control}
                    render={({ field }) => (
                      <FormControl
                        fullWidth
                        error={!!errors.jakim_zone_code}
                        disabled={filteredJakimZones.length === 0}
                      >
                        <InputLabel>JAKIM Zone</InputLabel>
                        <Select {...field} label="JAKIM Zone">
                          {filteredJakimZones.map((zone) => (
                            <MenuItem key={zone.value} value={zone.value}>
                              {zone.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.jakim_zone_code && (
                          <FormHelperText>
                            {errors.jakim_zone_code.message}
                          </FormHelperText>
                        )}
                        {filteredJakimZones.length === 0 && (
                          <FormHelperText>
                            Select a state to see available zones.
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
              )}
            </Grid>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 4,
              }}
            >
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ArrowBack />}
                onClick={() => navigate("/masjids")}
              >
                Back to List
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<Save />}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : isEditMode
                    ? "Save Changes"
                    : "Create Masjid"}
              </Button>
            </Box>
          </CardContent>
        </form>
      </Card>
    </Container>
  );
};

export default MasjidForm;
