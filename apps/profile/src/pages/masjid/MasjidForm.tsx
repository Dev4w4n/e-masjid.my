import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import { ArrowBack, Save } from "@mui/icons-material";
import { usePermissions } from "@masjid-suite/auth";
import { MalaysianState } from "@masjid-suite/shared-types";
import { masjidService, authService } from "@masjid-suite/supabase-client";

// Validation schema
const masjidSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must not exceed 100 characters"),

  registration_number: z
    .string()
    .optional()
    .refine((val) => !val || /^MSJ-\d{4}-\d{3}$/.test(val), {
      message: "Registration number must follow format MSJ-YYYY-XXX",
    }),

  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),

  phone_number: z
    .string()
    .optional()
    .refine((val) => !val || /^\+60[0-9]{8,9}$/.test(val), {
      message: "Phone number must be in Malaysian format (+60XXXXXXXX)",
    }),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must not exceed 1000 characters")
    .optional(),

  website_url: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),

  address: z.object({
    address_line_1: z
      .string()
      .min(5, "Address line 1 must be at least 5 characters")
      .max(100, "Address line 1 must not exceed 100 characters"),

    address_line_2: z
      .string()
      .max(100, "Address line 2 must not exceed 100 characters")
      .optional(),

    city: z
      .string()
      .min(2, "City must be at least 2 characters")
      .max(50, "City must not exceed 50 characters"),

    state: z.enum(
      [
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
      ],
      { errorMap: () => ({ message: "Please select a valid Malaysian state" }) }
    ),

    postcode: z.string().regex(/^\d{5}$/, "Postcode must be 5 digits"),

    country: z.literal("MYS"),
  }),

  capacity: z
    .number()
    .min(50, "Capacity must be at least 50 people")
    .max(10000, "Capacity must not exceed 10,000 people")
    .optional(),

  facilities: z.array(z.string()).optional(),

  prayer_times_source: z
    .enum(["manual", "jakim", "auto"], {
      errorMap: () => ({ message: "Please select a prayer times source" }),
    })
    .optional(),

  status: z
    .enum(["active", "inactive", "pending_verification"], {
      errorMap: () => ({ message: "Please select a valid status" }),
    })
    .optional(),
});

type MasjidFormData = z.infer<typeof masjidSchema>;

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

const facilityOptions = [
  "Parking",
  "Air Conditioning",
  "Wheelchair Access",
  "Library",
  "Islamic School",
  "Community Hall",
  "Kitchen",
  "Ablution Facilities",
  "Female Prayer Area",
  "Youth Center",
  "Funeral Services",
  "Audio System",
];

const prayerTimeSources = [
  { value: "jakim", label: "JAKIM (Automatic)" },
  { value: "auto", label: "Auto-detect Location" },
  { value: "manual", label: "Manual Entry" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending_verification", label: "Pending Verification" },
];

/**
 * Masjid form component for creating and editing masjids
 */
function MasjidForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const permissions = usePermissions();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Check permissions
  if (!permissions.canManageMasjids()) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          You don't have permission to manage masjids.
        </Alert>
      </Container>
    );
  }

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<MasjidFormData>({
    resolver: zodResolver(masjidSchema),
    defaultValues: {
      name: "",
      registration_number: "",
      email: "",
      phone_number: "",
      description: "",
      website_url: "",
      address: {
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "Selangor",
        postcode: "",
        country: "MYS",
      },
      capacity: undefined,
      facilities: [],
      prayer_times_source: "jakim",
      status: "active",
    },
  });

  const watchedFacilities = watch("facilities") || [];

  // Load masjid data for editing
  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);

      const loadMasjidData = async () => {
        try {
          const masjidData = await masjidService.getMasjid(id);

          // Transform the data to match form structure
          const formData = {
            name: masjidData.name,
            registration_number: masjidData.registration_number || "",
            email: masjidData.email || "",
            phone_number: masjidData.phone_number || "",
            description: masjidData.description || "",
            website_url: "", // Not stored in database yet
            address: {
              address_line_1: masjidData.address.address_line_1,
              address_line_2: masjidData.address.address_line_2 || "",
              city: masjidData.address.city,
              state: masjidData.address.state as MalaysianState,
              postcode: masjidData.address.postcode,
              country: masjidData.address.country as "MYS",
            },
            capacity: undefined, // Not stored in database yet
            facilities: [], // Not stored in database yet
            prayer_times_source: "jakim" as const,
            status: masjidData.status as
              | "active"
              | "inactive"
              | "pending_verification",
          };

          reset(formData);
        } catch (error) {
          console.error("Failed to load masjid data:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to load masjid data. Please try again.";
          setSubmitError(errorMessage);
        } finally {
          setLoading(false);
        }
      };

      loadMasjidData();
    }
  }, [isEdit, id, reset]);

  const onSubmit = async (data: MasjidFormData) => {
    try {
      setSubmitError(null);
      setLoading(true);

      // Get current user
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      // Prepare masjid data for API
      const masjidData = {
        name: data.name,
        registration_number: data.registration_number || null,
        email: data.email || null,
        phone_number: data.phone_number || null,
        description: data.description || null,
        address: {
          address_line_1: data.address.address_line_1,
          address_line_2: data.address.address_line_2 || null,
          city: data.address.city,
          state: data.address.state,
          postcode: data.address.postcode,
          country: data.address.country,
        },
        status: data.status || ("active" as const),
        created_by: currentUser.id,
      };

      let result;
      if (isEdit && id) {
        // Update existing masjid
        const { created_by, ...updateData } = masjidData;
        result = await masjidService.updateMasjid(id, updateData);
      } else {
        // Create new masjid
        result = await masjidService.createMasjid(masjidData);
      }

      console.log("Masjid saved successfully:", result);
      setSubmitSuccess(true);

      // Redirect after successful submission
      setTimeout(() => {
        if (isEdit) {
          navigate(`/masjids/${id}`);
        } else {
          navigate("/masjids");
        }
      }, 1500);
    } catch (error) {
      console.error("Failed to save masjid:", error);

      // Handle specific error types
      let errorMessage = "Failed to save masjid. Please try again.";

      if (error instanceof Error) {
        if (
          error.message.includes("Only super administrators can create masjids")
        ) {
          errorMessage =
            "You don't have permission to create masjids. Only super administrators can create new masjids.";
        } else if (error.message.includes("unique constraint")) {
          errorMessage =
            "A masjid with this registration number already exists. Please use a different registration number.";
        } else if (error.message.includes("Address must contain")) {
          errorMessage =
            "Please ensure all required address fields are filled correctly.";
        } else if (error.message.includes("Postcode must be")) {
          errorMessage = "Please enter a valid Malaysian postcode (5 digits).";
        } else if (error.message.includes("Phone number")) {
          errorMessage =
            "Please enter a valid Malaysian phone number starting with +60.";
        } else if (error.message.includes("Email")) {
          errorMessage = "Please enter a valid email address.";
        } else {
          errorMessage = error.message;
        }
      }

      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFacilityToggle = (facility: string) => {
    const current = watchedFacilities;
    const updated = current.includes(facility)
      ? current.filter((f) => f !== facility)
      : [...current, facility];
    setValue("facilities", updated);
  };

  if (loading && isEdit) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading masjid data...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/masjids")}
          sx={{ mb: 2 }}
        >
          Back to Masjids
        </Button>

        <Typography variant="h4" component="h1" gutterBottom>
          {isEdit ? "Edit Masjid" : "Add New Masjid"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isEdit
            ? "Update masjid information and settings."
            : "Create a new masjid profile for community management."}
        </Typography>
      </Box>

      {/* Success Message */}
      {submitSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Masjid {isEdit ? "updated" : "created"} successfully! Redirecting...
        </Alert>
      )}

      {/* Error Message */}
      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Card>
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
                          fullWidth
                          label="Masjid Name *"
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
                          fullWidth
                          label="Registration Number"
                          placeholder="MSJ-2024-001"
                          error={!!errors.registration_number}
                          helperText={errors.registration_number?.message}
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
                          fullWidth
                          multiline
                          rows={4}
                          label="Description"
                          placeholder="Describe the masjid, its history, services, and community..."
                          error={!!errors.description}
                          helperText={errors.description?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type="email"
                          label="Email Address"
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
                          fullWidth
                          label="Phone Number"
                          placeholder="+60123456789"
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
                          fullWidth
                          label="Website URL"
                          placeholder="https://example.com"
                          error={!!errors.website_url}
                          helperText={errors.website_url?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Address */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
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
                          fullWidth
                          label="Address Line 1 *"
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
                          fullWidth
                          label="Address Line 2"
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
                          fullWidth
                          label="City *"
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
                          <InputLabel>State *</InputLabel>
                          <Select {...field} label="State *">
                            {malaysianStates.map((state) => (
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
                          fullWidth
                          label="Postcode *"
                          placeholder="12345"
                          error={!!errors.address?.postcode}
                          helperText={errors.address?.postcode?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Facilities & Settings */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Facilities & Settings
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="capacity"
                      control={control}
                      render={({ field: { value, onChange, ...field } }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type="number"
                          label="Capacity (people)"
                          placeholder="500"
                          value={value || ""}
                          onChange={(e) =>
                            onChange(
                              e.target.value
                                ? parseInt(e.target.value)
                                : undefined
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
                      name="prayer_times_source"
                      control={control}
                      render={({ field }) => (
                        <FormControl
                          fullWidth
                          error={!!errors.prayer_times_source}
                        >
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

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Facilities
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {facilityOptions.map((facility) => (
                        <Chip
                          key={facility}
                          label={facility}
                          clickable
                          color={
                            watchedFacilities.includes(facility)
                              ? "primary"
                              : "default"
                          }
                          variant={
                            watchedFacilities.includes(facility)
                              ? "filled"
                              : "outlined"
                          }
                          onClick={() => handleFacilityToggle(facility)}
                        />
                      ))}
                    </Box>
                  </Grid>

                  {permissions.isSuperAdmin() && (
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth error={!!errors.status}>
                            <InputLabel>Status</InputLabel>
                            <Select {...field} label="Status">
                              {statusOptions.map((status) => (
                                <MenuItem
                                  key={status.value}
                                  value={status.value}
                                >
                                  {status.label}
                                </MenuItem>
                              ))}
                            </Select>
                            {errors.status && (
                              <FormHelperText>
                                {errors.status.message}
                              </FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => navigate("/masjids")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                startIcon={
                  isSubmitting ? <CircularProgress size={20} /> : <Save />
                }
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? isEdit
                    ? "Updating..."
                    : "Creating..."
                  : isEdit
                    ? "Update Masjid"
                    : "Create Masjid"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}

export default MasjidForm;
