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

  jakim_zone_code: z
    .string()
    .regex(/^[A-Z]{3}[0-9]{2}$/, {
      message:
        "Zone code must be in format: 3 letters + 2 digits (e.g., WLY01)",
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

const jakimZones = [
  // Kuala Lumpur & Federal Territory
  {
    value: "WLY01",
    label: "WLY01 - Kuala Lumpur, Putrajaya",
    state: "Kuala Lumpur",
  },
  { value: "WLY02", label: "WLY02 - Labuan", state: "Labuan" },

  // Johor
  { value: "JHR01", label: "JHR01 - Pulau Aur dan Pemanggil", state: "Johor" },
  {
    value: "JHR02",
    label: "JHR02 - Johor Bahru, Kota Tinggi, Mersing, Kulai",
    state: "Johor",
  },
  { value: "JHR03", label: "JHR03 - Kluang, Pontian", state: "Johor" },
  {
    value: "JHR04",
    label: "JHR04 - Batu Pahat, Muar, Segamat, Gemas Johor, Tangkak",
    state: "Johor",
  },

  // Kedah
  {
    value: "KDH01",
    label: "KDH01 - Kota Setar, Kubang Pasu, Pokok Sena",
    state: "Kedah",
  },
  { value: "KDH02", label: "KDH02 - Kuala Muda, Yan, Pendang", state: "Kedah" },
  { value: "KDH03", label: "KDH03 - Padang Terap, Sik", state: "Kedah" },
  { value: "KDH04", label: "KDH04 - Baling", state: "Kedah" },
  { value: "KDH05", label: "KDH05 - Bandar Baharu, Kulim", state: "Kedah" },
  { value: "KDH06", label: "KDH06 - Langkawi", state: "Kedah" },
  { value: "KDH07", label: "KDH07 - Puncak Gunung Jerai", state: "Kedah" },

  // Kelantan
  {
    value: "KTN01",
    label:
      "KTN01 - Kota Bharu, Bachok, Pasir Mas, Tumpat, Pasir Puteh, Kuala Krai, Machang",
    state: "Kelantan",
  },
  {
    value: "KTN02",
    label: "KTN02 - Gua Musang, Jeli, Jajahan Kecil Lojing",
    state: "Kelantan",
  },

  // Melaka
  { value: "MLK01", label: "MLK01 - Seluruh Negeri Melaka", state: "Malacca" },

  // Negeri Sembilan
  { value: "NGS01", label: "NGS01 - Tampin, Jempol", state: "Negeri Sembilan" },
  {
    value: "NGS02",
    label: "NGS02 - Jelebu, Kuala Pilah, Rembau",
    state: "Negeri Sembilan",
  },
  {
    value: "NGS03",
    label: "NGS03 - Port Dickson, Seremban",
    state: "Negeri Sembilan",
  },

  // Pahang
  { value: "PHG01", label: "PHG01 - Pulau Tioman", state: "Pahang" },
  {
    value: "PHG02",
    label: "PHG02 - Kuantan, Pekan, Rompin, Muadzam Shah",
    state: "Pahang",
  },
  {
    value: "PHG03",
    label: "PHG03 - Jerantut, Temerloh, Maran, Bera, Chenor, Jengka",
    state: "Pahang",
  },
  { value: "PHG04", label: "PHG04 - Bentong, Lipis, Raub", state: "Pahang" },
  {
    value: "PHG05",
    label: "PHG05 - Genting Sempah, Janda Baik, Bukit Tinggi",
    state: "Pahang",
  },
  {
    value: "PHG06",
    label: "PHG06 - Cameron Highlands, Genting Higlands, Bukit Fraser",
    state: "Pahang",
  },

  // Perak
  {
    value: "PRK01",
    label: "PRK01 - Tapah, Slim River, Tanjung Malim",
    state: "Perak",
  },
  {
    value: "PRK02",
    label: "PRK02 - Kuala Kangsar, Sg. Siput, Ipoh, Batu Gajah, Kampar",
    state: "Perak",
  },
  {
    value: "PRK03",
    label: "PRK03 - Lenggong, Pengkalan Hulu, Grik",
    state: "Perak",
  },
  { value: "PRK04", label: "PRK04 - Temengor, Belum", state: "Perak" },
  {
    value: "PRK05",
    label:
      "PRK05 - Kg Gajah, Teluk Intan, Bagan Datuk, Seri Iskandar, Beruas, Parit, Lumut, Sitiawan, Pulau Pangkor",
    state: "Perak",
  },
  {
    value: "PRK06",
    label: "PRK06 - Selama, Taiping, Bagan Serai, Parit Buntar",
    state: "Perak",
  },
  { value: "PRK07", label: "PRK07 - Bukit Larut", state: "Perak" },

  // Perlis
  { value: "PLS01", label: "PLS01 - Seluruh Negeri Perlis", state: "Perlis" },

  // Penang
  {
    value: "PNG01",
    label: "PNG01 - Seluruh Negeri Pulau Pinang",
    state: "Penang",
  },

  // Sabah
  {
    value: "SBH01",
    label:
      "SBH01 - Bahagian Sandakan (Timur), Bukit Garam, Semawang, Temanggong, Tambisan, Bandar Sandakan, Sukau",
    state: "Sabah",
  },
  {
    value: "SBH02",
    label:
      "SBH02 - Beluran, Telupid, Pinangah, Terusan, Kuamut, Bahagian Sandakan (Barat)",
    state: "Sabah",
  },
  {
    value: "SBH03",
    label:
      "SBH03 - Lahad Datu, Silabukan, Kunak, Sahabat, Semporna, Tungku, Bahagian Tawau (Timur)",
    state: "Sabah",
  },
  {
    value: "SBH04",
    label: "SBH04 - Tawau, Balong, Merotai, Kalabakan, Bahagian Tawau (Barat)",
    state: "Sabah",
  },
  {
    value: "SBH05",
    label: "SBH05 - Kudat, Kota Marudu, Pitas, Pulau Banggi, Bahagian Kudat",
    state: "Sabah",
  },
  { value: "SBH06", label: "SBH06 - Gunung Kinabalu", state: "Sabah" },
  {
    value: "SBH07",
    label:
      "SBH07 - Kota Kinabalu, Ranau, Kota Belud, Tuaran, Penampang, Papar, Putatan, Bahagian Pantai Barat",
    state: "Sabah",
  },
  {
    value: "SBH08",
    label:
      "SBH08 - Pensiangan, Keningau, Tambunan, Nabawan, Bahagian Pendalaman (Atas)",
    state: "Sabah",
  },
  {
    value: "SBH09",
    label:
      "SBH09 - Beaufort, Kuala Penyu, Sipitang, Tenom, Long Pasia, Membakut, Weston, Bahagian Pendalaman (Bawah)",
    state: "Sabah",
  },

  // Sarawak
  {
    value: "SWK01",
    label: "SWK01 - Limbang, Lawas, Sundar, Trusan",
    state: "Sarawak",
  },
  {
    value: "SWK02",
    label: "SWK02 - Miri, Niah, Bekenu, Sibuti, Marudi",
    state: "Sarawak",
  },
  {
    value: "SWK03",
    label: "SWK03 - Pandan, Belaga, Suai, Tatau, Sebauh, Bintulu",
    state: "Sarawak",
  },
  {
    value: "SWK04",
    label:
      "SWK04 - Sibu, Mukah, Dalat, Song, Igan, Oya, Balingian, Kanowit, Kapit",
    state: "Sarawak",
  },
  {
    value: "SWK05",
    label: "SWK05 - Sarikei, Matu, Julau, Rajang, Daro, Bintangor, Belawai",
    state: "Sarawak",
  },
  {
    value: "SWK06",
    label:
      "SWK06 - Lubok Antu, Sri Aman, Roban, Debak, Kabong, Lingga, Engkelili, Betong, Spaoh, Pusa, Saratok",
    state: "Sarawak",
  },
  {
    value: "SWK07",
    label: "SWK07 - Serian, Simunjan, Samarahan, Sebuyau, Meludam",
    state: "Sarawak",
  },
  {
    value: "SWK08",
    label: "SWK08 - Kuching, Bau, Lundu, Sematan",
    state: "Sarawak",
  },
  {
    value: "SWK09",
    label: "SWK09 - Zon Khas (Kampung Patarikan)",
    state: "Sarawak",
  },

  // Selangor
  {
    value: "SGR01",
    label:
      "SGR01 - Gombak, Petaling, Sepang, Hulu Langat, Hulu Selangor, Shah Alam",
    state: "Selangor",
  },
  {
    value: "SGR02",
    label: "SGR02 - Kuala Selangor, Sabak Bernam",
    state: "Selangor",
  },
  { value: "SGR03", label: "SGR03 - Klang, Kuala Langat", state: "Selangor" },

  // Terengganu
  {
    value: "TRG01",
    label: "TRG01 - Kuala Terengganu, Marang",
    state: "Terengganu",
  },
  { value: "TRG02", label: "TRG02 - Besut, Setiu", state: "Terengganu" },
  { value: "TRG03", label: "TRG03 - Hulu Terengganu", state: "Terengganu" },
  { value: "TRG04", label: "TRG04 - Dungun, Kemaman", state: "Terengganu" },
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
      jakim_zone_code: "WLY01", // Default to Kuala Lumpur
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
            website_url: masjidData.website_url || "",
            address: {
              address_line_1: masjidData.address.address_line_1,
              address_line_2: masjidData.address.address_line_2 || "",
              city: masjidData.address.city,
              state: masjidData.address.state as MalaysianState,
              postcode: masjidData.address.postcode,
              country: masjidData.address.country as "MYS",
            },
            capacity: masjidData.capacity || undefined,
            facilities: Array.isArray(masjidData.facilities)
              ? masjidData.facilities
              : [],
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
        website_url: data.website_url || null,
        capacity: data.capacity || null,
        facilities: data.facilities || [],
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
        } else if (error.message.includes("website_url")) {
          errorMessage =
            "Please enter a valid website URL starting with http:// or https://.";
        } else if (error.message.includes("capacity")) {
          errorMessage = "Please enter a valid capacity (positive number).";
        } else if (error.message.includes("facilities")) {
          errorMessage =
            "There was an issue with the facilities list. Please check for duplicates or invalid entries.";
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

                  {watch("prayer_times_source") === "jakim" && (
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="jakim_zone_code"
                        control={control}
                        render={({ field }) => (
                          <FormControl
                            fullWidth
                            error={!!errors.jakim_zone_code}
                          >
                            <InputLabel>JAKIM Zone *</InputLabel>
                            <Select {...field} label="JAKIM Zone *">
                              {jakimZones
                                .filter(
                                  (zone) =>
                                    !watch("address.state") ||
                                    zone.state === watch("address.state") ||
                                    zone.state === "Kuala Lumpur" // Always show KL zones
                                )
                                .map((zone) => (
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
                          </FormControl>
                        )}
                      />
                    </Grid>
                  )}

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
