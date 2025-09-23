import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  Save,
  Cancel,
  Person,
  Phone,
  Home,
  Add,
  Delete,
  Visibility,
} from "@mui/icons-material";
import { useAuth, useProfile } from "@masjid-suite/auth";
import {
  MALAYSIAN_STATES,
  isValidMalaysianPhone,
  isValidMalaysianPostcode,
} from "@masjid-suite/shared-types";

// Validation schema
const profileSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters"),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || isValidMalaysianPhone(val),
      "Please enter a valid Malaysian phone number"
    ),
  preferredLanguage: z.enum(["en", "ms", "zh", "ta"]),
  homeMasjidId: z.string().optional(),
});

const addressSchema = z.object({
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.enum(MALAYSIAN_STATES as [string, ...string[]]),
  postcode: z
    .string()
    .min(1, "Postcode is required")
    .refine(
      (val) => isValidMalaysianPostcode(val),
      "Please enter a valid Malaysian postcode"
    ),
  addressType: z.enum(["home", "work", "other"]),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type AddressFormData = z.infer<typeof addressSchema>;

/**
 * Profile editing page component
 */
function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { profile, refreshProfile } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [addresses, setAddresses] = useState<AddressFormData[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      preferredLanguage: "en",
      homeMasjidId: "",
    },
  });

  const {
    register: registerAddress,
    handleSubmit: handleSubmitAddress,
    control: controlAddress,
    formState: { errors: errorsAddress },
    reset: resetAddress,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "Selangor",
      postcode: "",
      addressType: "home",
    },
  });

  // Load profile data
  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.full_name || "",
        phoneNumber: profile.phone_number || "",
        preferredLanguage: profile.preferred_language || "en",
        homeMasjidId: profile.home_masjid_id || "",
      });
    }
  }, [profile, reset]);

  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      await updateProfile({
        full_name: data.fullName,
        phone_number: data.phoneNumber || null,
        preferred_language: data.preferredLanguage,
        home_masjid_id: data.homeMasjidId || null,
      });

      setSuccess(true);
      await refreshProfile();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Profile update error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitAddress = async (data: AddressFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real app, this would save to the database
      setAddresses((prev) => [...prev, data]);
      setShowAddAddress(false);
      resetAddress();

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Address save error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save address. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const removeAddress = (index: number) => {
    setAddresses((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your personal information and preferences.
        </Typography>
      </Box>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Person color="primary" />
                Personal Information
              </Typography>

              <Box
                component="form"
                onSubmit={handleSubmit(onSubmitProfile)}
                sx={{ mt: 2 }}
              >
                <Grid container spacing={2}>
                  {/* Full Name */}
                  <Grid item xs={12}>
                    <TextField
                      {...register("fullName")}
                      fullWidth
                      label="Full Name"
                      error={!!errors.fullName}
                      helperText={errors.fullName?.message}
                      disabled={isLoading}
                    />
                  </Grid>

                  {/* Email (Read-only) */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={user?.email || ""}
                      disabled
                      helperText="Email cannot be changed"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Chip
                              size="small"
                              label="Verified"
                              color="success"
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Phone Number */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      {...register("phoneNumber")}
                      fullWidth
                      label="Phone Number"
                      placeholder="+60123456789"
                      error={!!errors.phoneNumber}
                      helperText={
                        errors.phoneNumber?.message ||
                        "Malaysian format: +60123456789"
                      }
                      disabled={isLoading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Preferred Language */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="preferredLanguage"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth disabled={isLoading}>
                          <InputLabel>Preferred Language</InputLabel>
                          <Select {...field} label="Preferred Language">
                            <MenuItem value="en">English</MenuItem>
                            <MenuItem value="ms">Bahasa Malaysia</MenuItem>
                            <MenuItem value="zh">中文</MenuItem>
                            <MenuItem value="ta">தமிழ்</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  {/* Home Masjid */}
                  <Grid item xs={12}>
                    <Controller
                      name="homeMasjidId"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth disabled={isLoading}>
                          <InputLabel>Home Masjid (Optional)</InputLabel>
                          <Select {...field} label="Home Masjid (Optional)">
                            <MenuItem value="">None</MenuItem>
                            <MenuItem value="masjid-1">
                              Masjid Jamek Sungai Rambai
                            </MenuItem>
                            <MenuItem value="masjid-2">
                              Masjid Al-Hidayah
                            </MenuItem>
                            <MenuItem value="masjid-3">
                              Masjid Ar-Rahman
                            </MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>

                {/* Submit Buttons */}
                <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={
                      isLoading ? <CircularProgress size={20} /> : <Save />
                    }
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Profile"}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => navigate("/profile/view")}
                    disabled={isLoading}
                  >
                    View Profile
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Address Management */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Home color="primary" />
                Addresses
              </Typography>

              {/* Existing Addresses */}
              {addresses.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  {addresses.map((address, index) => (
                    <Card key={index} variant="outlined" sx={{ mb: 1, p: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {String(address.addressLine1)}
                          </Typography>
                          {address.addressLine2 && (
                            <Typography variant="body2" color="text.secondary">
                              {String(address.addressLine2)}
                            </Typography>
                          )}
                          <Typography variant="body2" color="text.secondary">
                            {String(address.city)}, {String(address.state)}{" "}
                            {String(address.postcode)}
                          </Typography>
                          <Chip
                            size="small"
                            label={String(address.addressType)}
                            sx={{ mt: 1 }}
                          />
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => removeAddress(index)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}

              {/* Add Address Button */}
              {!showAddAddress && (
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => setShowAddAddress(true)}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Add Address
                </Button>
              )}

              {/* Add Address Form */}
              {showAddAddress && (
                <Box
                  component="form"
                  onSubmit={handleSubmitAddress(onSubmitAddress)}
                >
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Add New Address
                  </Typography>

                  <TextField
                    {...registerAddress("addressLine1")}
                    fullWidth
                    label="Address Line 1"
                    size="small"
                    error={!!errorsAddress.addressLine1}
                    helperText={errorsAddress.addressLine1?.message}
                    disabled={isLoading}
                    sx={{ mb: 1 }}
                  />

                  <TextField
                    {...registerAddress("addressLine2")}
                    fullWidth
                    label="Address Line 2 (Optional)"
                    size="small"
                    disabled={isLoading}
                    sx={{ mb: 1 }}
                  />

                  <TextField
                    {...registerAddress("city")}
                    fullWidth
                    label="City"
                    size="small"
                    error={!!errorsAddress.city}
                    helperText={errorsAddress.city?.message}
                    disabled={isLoading}
                    sx={{ mb: 1 }}
                  />

                  <Controller
                    name="state"
                    control={controlAddress}
                    render={({ field }) => (
                      <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                        <InputLabel>State</InputLabel>
                        <Select {...field} label="State" disabled={isLoading}>
                          {MALAYSIAN_STATES.map((state) => (
                            <MenuItem key={state} value={state}>
                              {state}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />

                  <TextField
                    {...registerAddress("postcode")}
                    fullWidth
                    label="Postcode"
                    size="small"
                    error={!!errorsAddress.postcode}
                    helperText={errorsAddress.postcode?.message}
                    disabled={isLoading}
                    sx={{ mb: 1 }}
                  />

                  <Controller
                    name="addressType"
                    control={controlAddress}
                    render={({ field }) => (
                      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel>Type</InputLabel>
                        <Select {...field} label="Type" disabled={isLoading}>
                          <MenuItem value="home">Home</MenuItem>
                          <MenuItem value="work">Work</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="small"
                      startIcon={<Save />}
                      disabled={isLoading}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Cancel />}
                      onClick={() => {
                        setShowAddAddress(false);
                        resetAddress();
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Profile;
