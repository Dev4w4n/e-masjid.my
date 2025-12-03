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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from "@mui/material";
import { ArrowBack, Save, PersonAdd, Delete } from "@mui/icons-material";
import {
  jakimZones,
  malaysianStates,
  prayerTimeSources,
  statusOptions,
  UiJakimZone,
  masjidFormSchema,
  MasjidFormData,
} from "@masjid-suite/shared-types";
import { usePermissions } from "@masjid-suite/auth";
import { masjidService } from "@masjid-suite/supabase-client";
import { Database } from "@masjid-suite/shared-types";

type MasjidAdmin =
  Database["public"]["Functions"]["get_masjid_admin_list"]["Returns"][number];

// The Zod schema is now the single source of truth for validation

export const MasjidForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canManageMasjids, isSuperAdmin } = usePermissions();
  const isEditMode = Boolean(id);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Admin management state
  const [admins, setAdmins] = useState<MasjidAdmin[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<MasjidAdmin | null>(null);
  const [assignEmail, setAssignEmail] = useState("");
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<MasjidFormData>({
    resolver: zodResolver(masjidFormSchema),
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
            // Parse the address JSON string back to object
            let address;
            try {
              address =
                typeof masjid.address === "string"
                  ? JSON.parse(masjid.address)
                  : masjid.address;
            } catch {
              address = {
                address_line_1: "",
                address_line_2: "",
                city: "",
                postcode: "",
                state: "Selangor",
                country: "MYS",
              };
            }

            reset({
              name: masjid.name || "",
              description: masjid.description || "",
              email: masjid.email || "",
              phone_number: masjid.phone_number || "",
              registration_number: masjid.registration_number || "",
              website_url: masjid.website_url || "",
              address,
              capacity: masjid.capacity || 100,
              prayer_times_source: masjid.prayer_times_source || "jakim",
              jakim_zone_code: masjid.jakim_zone_code || "WLY01",
              status: masjid.status || "pending_verification",
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

  // Load admins in edit mode
  useEffect(() => {
    if (!id || !isEditMode) return;

    const fetchAdmins = async () => {
      try {
        setAdminsLoading(true);
        const adminData = await masjidService.getMasjidAdmins(id);
        setAdmins(adminData);
      } catch (err: any) {
        console.error("Failed to fetch masjid admins:", err);
      } finally {
        setAdminsLoading(false);
      }
    };

    fetchAdmins();
  }, [id, isEditMode]);

  const onSubmit = async (data: MasjidFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      console.log("Form data received:", data);
      console.log("Address object:", data.address);

      // Transform the data to match database expectations
      const transformedData = {
        ...data,
        // Keep address as object - Supabase will handle JSONB conversion
        // Convert empty strings to null for optional fields
        email: data.email || null,
        phone_number: data.phone_number || null,
        registration_number: data.registration_number || null,
        website_url: data.website_url || null,
        description: data.description || null,
        jakim_zone_code:
          data.prayer_times_source === "jakim" ? data.jakim_zone_code : null,
        capacity: data.capacity || null,
      };

      if (isEditMode && id) {
        // Remove fields that shouldn't be updated and might cause RLS issues
        const {
          created_by,
          id: formId,
          created_at,
          updated_at,
          // Handle prayer-related fields separately
          prayer_times_source,
          jakim_zone_code,
          ...updateData
        } = transformedData as any;

        console.log(
          "Update data to send (excluding prayer fields):",
          updateData
        );
        await masjidService.updateMasjid(id, updateData);

        // Try to update prayer-related fields separately if they have changed
        if (
          prayer_times_source !== undefined ||
          jakim_zone_code !== undefined
        ) {
          try {
            console.log("Updating prayer fields separately...");
            const prayerUpdates: any = {};
            if (prayer_times_source !== undefined) {
              prayerUpdates.prayer_times_source = prayer_times_source;
            }
            if (jakim_zone_code !== undefined) {
              prayerUpdates.jakim_zone_code = jakim_zone_code;
            }

            await masjidService.updateMasjid(id, prayerUpdates);
            console.log("Prayer fields updated successfully");
          } catch (prayerError) {
            console.warn("Failed to update prayer fields:", prayerError);
            // Don't fail the entire update - just show a warning
            const errorMessage =
              prayerError instanceof Error
                ? prayerError.message
                : String(prayerError);
            if (
              errorMessage.includes("must be masjid admin") ||
              errorMessage.includes("403") ||
              errorMessage.includes("Forbidden")
            ) {
              setError(
                "Masjid information updated successfully! However, prayer settings can only be modified by masjid admins."
              );
            } else {
              setError(
                "Masjid updated successfully, but prayer settings could not be updated due to permissions."
              );
            }
            // Still navigate to success page since main data was updated
            setTimeout(() => navigate("/masjids"), 2000); // Give user time to read the message
            return; // Exit early to show the message
          }
        }
      } else {
        await masjidService.createMasjid(transformedData as any);
      }
      navigate("/masjids");
    } catch (err) {
      console.error("Submit error:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredJakimZones = jakimZones.filter((zone: UiJakimZone) => {
    if (
      selectedState === "Kuala Lumpur" ||
      selectedState === "Putrajaya" ||
      selectedState === "Labuan"
    ) {
      return [
        "Wilayah Persekutuan",
        "Kuala Lumpur",
        "Putrajaya",
        "Labuan",
      ].includes(zone.state);
    }
    return zone.state === selectedState;
  });

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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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

            {/* Admin Management Section - Only in Edit Mode for Super Admin */}
            {isEditMode && isSuperAdmin() && (
              <>
                <Divider sx={{ my: 4 }} />
                <Typography variant="h6" gutterBottom>
                  Masjid Administrators
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={() => setAssignDialogOpen(true)}
                  >
                    Assign Admin
                  </Button>
                </Box>
                {adminsLoading ? (
                  <CircularProgress size={24} />
                ) : admins.length > 0 ? (
                  <List>
                    {admins.map((admin) => (
                      <ListItem key={admin.user_id}>
                        <ListItemText
                          primary={admin.full_name}
                          secondary={`${admin.email}${admin.phone_number ? ` — ${admin.phone_number}` : ""}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setRevokeDialogOpen(true);
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No administrators assigned to this masjid.
                  </Typography>
                )}
              </>
            )}

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

      {/* Assign Admin Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => {
          setAssignDialogOpen(false);
          setAssignEmail("");
          setAssignError(null);
          setAssignSuccess(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Masjid Admin</DialogTitle>
        <DialogContent>
          {assignError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {assignError}
            </Alert>
          )}
          {assignSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {assignSuccess}
            </Alert>
          )}
          <Typography variant="body2" sx={{ mb: 2, mt: 1 }}>
            Enter the user's email to assign them as an admin for this masjid.
          </Typography>
          <TextField
            label="User Email"
            type="email"
            value={assignEmail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAssignEmail(e.target.value)
            }
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAssignDialogOpen(false);
              setAssignEmail("");
              setAssignError(null);
              setAssignSuccess(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={assignSubmitting || !assignEmail}
            onClick={async () => {
              if (!id) return;
              setAssignSubmitting(true);
              setAssignError(null);
              setAssignSuccess(null);
              try {
                // Lookup user by email in users table
                const { data: users, error: lookupError } = await (masjidService as any).db
                  .client
                  .from("users")
                  .select("id,email")
                  .eq("email", assignEmail)
                  .limit(1);

                if (lookupError) throw new Error(lookupError.message);
                const found = users?.[0];
                if (!found) throw new Error("User not found with that email");

                await masjidService.assignAdmin({
                  masjid_id: id,
                  user_id: found.id,
                  status: "active",
                  approved_by: (await (masjidService as any).db.client.auth.getUser()).data.user?.id ?? undefined,
                  approved_at: new Date().toISOString(),
                } as any);

                setAssignSuccess("Admin assigned successfully");
                setAssignEmail("");
                const adminData = await masjidService.getMasjidAdmins(id);
                setAdmins(adminData);
                setTimeout(() => setAssignDialogOpen(false), 1500);
              } catch (err: any) {
                setAssignError(err.message || String(err));
              } finally {
                setAssignSubmitting(false);
              }
            }}
          >
            {assignSubmitting ? "Assigning..." : "Assign"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Revoke Admin Dialog */}
      <Dialog
        open={revokeDialogOpen}
        onClose={() => {
          setRevokeDialogOpen(false);
          setSelectedAdmin(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Revoke Admin Access</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to revoke admin access for{" "}
            <strong>{selectedAdmin?.full_name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setRevokeDialogOpen(false);
              setSelectedAdmin(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              if (!id || !selectedAdmin) return;
              try {
                await (masjidService as any).db
                  .client
                  .from("masjid_admins")
                  .delete()
                  .eq("masjid_id", id)
                  .eq("user_id", selectedAdmin.user_id);

                const adminData = await masjidService.getMasjidAdmins(id);
                setAdmins(adminData);
                setRevokeDialogOpen(false);
                setSelectedAdmin(null);
              } catch (err: any) {
                console.error("Failed to revoke admin:", err);
                setError(err.message || "Failed to revoke admin access");
              }
            }}
          >
            Revoke
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MasjidForm;
