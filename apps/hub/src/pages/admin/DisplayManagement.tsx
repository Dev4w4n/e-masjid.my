import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Box,
  Chip,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Image as ImageIcon,
  DragIndicator,
  Settings,
  Animation,
  Refresh,
  CachedOutlined,
} from "@mui/icons-material";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SketchPicker, ColorResult } from "react-color";
import { useSnackbar } from "notistack";
import {
  getDisplaysByMasjid,
  getAssignedContent,
  assignContent,
  removeContent,
  updateContentOrder,
  updateContentSettings,
  createDisplay,
  masjidService,
} from "@masjid-suite/supabase-client";
import {
  ContentSettingsDialog,
  ContentSettings,
} from "../../components/ContentSettingsDialog";
import { BlackScreenScheduler } from "../../components/BlackScreenScheduler";
import { getContentForAdmin } from "../../services/contentService";
import { updateDisplay } from "../../services/displayService";
import {
  forceReloadDisplay,
  softReloadDisplay,
  clearDisplayCache,
} from "../../services/displayCommandService";
import {
  DisplayContent,
  Tables,
  DayOfWeek,
  BlackScreenScheduleType,
} from "@masjid-suite/shared-types";
import { useUser } from "@masjid-suite/auth";

type TvDisplay = Tables<"tv_displays">;
type Masjid = Tables<"masjids">;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </Box>
  );
}

// Sortable item component for drag-and-drop
interface SortableContentItemProps {
  content: DisplayContent & {
    carousel_duration?: number;
    transition_type?: "fade" | "slide" | "zoom" | "none";
    image_display_mode?: "contain" | "cover" | "fill" | "none";
  };
  onRemove: (contentId: string) => void;
  onEditSettings: (content: SortableContentItemProps["content"]) => void;
}

function SortableContentItem({
  content,
  onRemove,
  onEditSettings,
}: SortableContentItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: content.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isImageContent =
    content.type === "image" || content.type === "event_poster";

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        mb: 1,
        bgcolor: "background.paper",
        cursor: isDragging ? "grabbing" : "grab",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "center" },
        p: { xs: 1.5, sm: 2 },
      }}
      secondaryAction={
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexDirection: { xs: "row", sm: "row" },
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "flex-end", sm: "flex-start" },
            mt: { xs: 1, sm: 0 },
          }}
        >
          <Tooltip title="Edit Tetapan">
            <IconButton
              size="small"
              onClick={() => onEditSettings(content)}
              sx={{ color: "primary.main" }}
            >
              <Settings fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            size="small"
            color="error"
            onClick={() => onRemove(content.id)}
            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
          >
            Buang
          </Button>
        </Box>
      }
    >
      <IconButton
        {...attributes}
        {...listeners}
        size="small"
        sx={{
          mr: { xs: 1, sm: 2 },
          cursor: "grab",
          touchAction: "none",
          alignSelf: { xs: "flex-start", sm: "center" },
        }}
      >
        <DragIndicator />
      </IconButton>
      <ListItemText
        primary={content.title}
        secondaryTypographyProps={{ component: "div" }}
        sx={{ pr: { xs: 0, sm: 2 } }}
        secondary={
          <Box component="span">
            <Typography variant="body2" component="span" display="block">
              {content.type} • Paparan:{" "}
              {content.carousel_duration || content.duration || 10}s
            </Typography>
            <Box sx={{ mt: 0.5, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              <Chip
                size="small"
                label={content.transition_type || "fade"}
                icon={<Animation />}
                sx={{ height: 20, fontSize: "0.7rem" }}
              />
              {isImageContent && (
                <Chip
                  size="small"
                  label={content.image_display_mode || "contain"}
                  icon={<ImageIcon />}
                  sx={{ height: 20, fontSize: "0.7rem" }}
                />
              )}
            </Box>
          </Box>
        }
      />
    </ListItem>
  );
}

const DisplayManagement = () => {
  // Common state
  const [userMasjids, setUserMasjids] = useState<Masjid[]>([]);
  const [selectedMasjidId, setSelectedMasjidId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const user = useUser();
  const { enqueueSnackbar } = useSnackbar();

  // Display settings state
  const [displays, setDisplays] = useState<TvDisplay[]>([]);
  const [selectedDisplayId, setSelectedDisplayId] = useState<string>("");
  const [displaySettings, setDisplaySettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showImageBgColorPicker, setShowImageBgColorPicker] = useState(false);

  // Content assignment state
  const [availableContent, setAvailableContent] = useState<DisplayContent[]>(
    []
  );
  const [assignedContent, setAssignedContent] = useState<DisplayContent[]>([]);
  const [contentLoading, setContentLoading] = useState(false);

  // Content settings dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [contentToAssign, setContentToAssign] = useState<{
    id: string;
    type: string;
    title: string;
  } | null>(null);
  const [contentToEdit, setContentToEdit] = useState<{
    id: string;
    type: string;
    title: string;
    currentSettings: ContentSettings;
  } | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Create display state
  const [createDisplayDialog, setCreateDisplayDialog] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Load user's admin masjids
  useEffect(() => {
    const fetchUserMasjids = async () => {
      try {
        setLoading(true);
        // Get masjids the user is admin of
        const masjidIds = await masjidService.getUserAdminMasjids();

        if (masjidIds.length === 0) {
          setError("You are not an admin of any masjid.");
          return;
        }

        // Fetch masjid details
        const masjidDetails = await Promise.all(
          masjidIds.map(async (id) => {
            const masjidData = await masjidService.getMasjid(id);
            return masjidData;
          })
        );

        setUserMasjids(masjidDetails.filter(Boolean) as Masjid[]);

        // Auto-select first masjid
        if (masjidDetails.length > 0 && masjidDetails[0]) {
          setSelectedMasjidId(masjidDetails[0].id);
        }
      } catch (err) {
        setError("Failed to fetch your masjids.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserMasjids();
  }, [user]);

  // Load displays when masjid is selected
  useEffect(() => {
    const fetchDisplays = async () => {
      if (!selectedMasjidId) return;

      try {
        setLoading(true);
        const data = await getDisplaysByMasjid(selectedMasjidId);
        setDisplays(data);

        // Auto-select first display
        if (data.length > 0) {
          setSelectedDisplayId(data[0]!.id);
        } else {
          setSelectedDisplayId("");
        }
      } catch (err) {
        setError("Failed to fetch displays.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDisplays();
  }, [selectedMasjidId]);

  // Load available content function
  const fetchAllContent = async () => {
    if (!selectedMasjidId) return;

    try {
      const content = await getContentForAdmin();
      // Filter content for selected masjid and only active content
      const masjidContent = content.filter(
        (c) => c.masjid_id === selectedMasjidId && c.status === "active"
      );
      setAvailableContent(masjidContent);
    } catch (err) {
      setError("Failed to fetch content.");
      console.error(err);
    }
  };

  // Load content when masjid is selected
  useEffect(() => {
    fetchAllContent();
  }, [selectedMasjidId]);

  // Load assigned content when display is selected
  useEffect(() => {
    const fetchAssignedContent = async () => {
      if (!selectedDisplayId) {
        setAssignedContent([]);
        return;
      }

      try {
        setContentLoading(true);
        const data = await getAssignedContent(selectedDisplayId);
        setAssignedContent(data);
      } catch (err) {
        setError("Failed to fetch assigned content.");
        console.error(err);
      } finally {
        setContentLoading(false);
      }
    };

    fetchAssignedContent();
  }, [selectedDisplayId]);

  // Load display settings when display is selected
  useEffect(() => {
    const loadDisplaySettings = async () => {
      if (!selectedDisplayId) {
        setDisplaySettings(null);
        return;
      }

      const selectedDisplay = displays.find((d) => d.id === selectedDisplayId);
      if (selectedDisplay) {
        setDisplaySettings(selectedDisplay);
      }
    };

    loadDisplaySettings();
  }, [selectedDisplayId, displays]);

  const handleMasjidChange = (event: SelectChangeEvent<string>) => {
    setSelectedMasjidId(event.target.value);
    setSelectedDisplayId(""); // Reset display selection
    setDisplaySettings(null);
    setAssignedContent([]);
  };

  const handleDisplayChange = (event: SelectChangeEvent<string>) => {
    setSelectedDisplayId(event.target.value);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Display settings handlers
  const handleSettingsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!displaySettings) return;
    const { name, value, type, checked } = event.target;
    setDisplaySettings({
      ...displaySettings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSelectChange = (event: SelectChangeEvent<any>) => {
    if (!displaySettings) return;
    const { name, value } = event.target;
    setDisplaySettings({ ...displaySettings, [name]: value });
  };

  const handleColorChange = (color: ColorResult) => {
    if (!displaySettings) return;
    setDisplaySettings({
      ...displaySettings,
      prayer_time_color: color.hex,
    });
  };

  const handleSaveDisplaySettings = async () => {
    if (!displaySettings) return;
    setSaving(true);
    try {
      const { id, created_at, updated_at, masjid_id, ...updateData } =
        displaySettings;
      const updatedDisplay = await updateDisplay(id, updateData);
      enqueueSnackbar("Display settings saved successfully!", {
        variant: "success",
      });

      // Update local state
      const updatedDisplays = displays.map((d) =>
        d.id === id ? (updatedDisplay as TvDisplay) : d
      );
      setDisplays(updatedDisplays);
      setDisplaySettings(updatedDisplay);
    } catch (err: any) {
      enqueueSnackbar(`Failed to save settings: ${err.message}`, {
        variant: "error",
      });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Content assignment handlers
  const loadAssignedContent = async () => {
    if (!selectedDisplayId) return;

    try {
      setContentLoading(true);
      const data = await getAssignedContent(selectedDisplayId);
      setAssignedContent(data);
    } catch (err) {
      console.error("Failed to reload assigned content:", err);
    } finally {
      setContentLoading(false);
    }
  };

  const handleOpenAssignDialog = (content: DisplayContent) => {
    setContentToAssign({
      id: content.id,
      type: content.type,
      title: content.title,
    });
    setAssignDialogOpen(true);
  };

  const handleAssignWithSettings = async (settings: ContentSettings) => {
    if (!selectedDisplayId || !contentToAssign) return;

    try {
      await assignContent(selectedDisplayId, contentToAssign.id, settings);

      // Reload assigned content to get the new settings
      await loadAssignedContent();

      setAssignDialogOpen(false);
      setContentToAssign(null);
      enqueueSnackbar("Content assigned successfully!", { variant: "success" });
    } catch (err) {
      enqueueSnackbar("Failed to assign content.", { variant: "error" });
      console.error(err);
      throw err; // Re-throw to show error in dialog
    }
  };

  const handleOpenEditDialog = (
    content: SortableContentItemProps["content"]
  ) => {
    setContentToEdit({
      id: content.id,
      type: content.type,
      title: content.title,
      currentSettings: {
        carousel_duration: content.carousel_duration || 10,
        transition_type: content.transition_type || "fade",
        image_display_mode: content.image_display_mode || "contain",
      },
    });
    setEditDialogOpen(true);
  };

  const handleSaveContentSettings = async (settings: ContentSettings) => {
    if (!selectedDisplayId || !contentToEdit) return;

    try {
      await updateContentSettings(
        selectedDisplayId,
        contentToEdit.id,
        settings
      );

      // Reload assigned content to show updated settings
      await loadAssignedContent();

      setEditDialogOpen(false);
      setContentToEdit(null);
      enqueueSnackbar("Settings updated successfully!", { variant: "success" });
    } catch (err) {
      enqueueSnackbar("Failed to update settings.", { variant: "error" });
      console.error(err);
      throw err; // Re-throw to show error in dialog
    }
  };

  const handleRemove = async (contentId: string) => {
    if (!selectedDisplayId) return;

    try {
      await removeContent(selectedDisplayId, contentId);
      setAssignedContent(assignedContent.filter((c) => c.id !== contentId));
      enqueueSnackbar("Content removed successfully!", { variant: "success" });
    } catch (err) {
      enqueueSnackbar("Failed to remove content.", { variant: "error" });
      console.error(err);
    }
  };

  // Handle drag end to reorder content
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = assignedContent.findIndex((item) => item.id === active.id);
    const newIndex = assignedContent.findIndex((item) => item.id === over.id);

    // Reorder the array
    const reorderedContent = arrayMove(assignedContent, oldIndex, newIndex);
    setAssignedContent(reorderedContent);

    // Update the order in the database
    try {
      const contentOrders = reorderedContent.map((content, index) => ({
        contentId: content.id,
        order: index,
      }));

      await updateContentOrder(selectedDisplayId, contentOrders);
      enqueueSnackbar("Content order updated successfully!", {
        variant: "success",
      });
    } catch (err) {
      enqueueSnackbar("Failed to update content order.", { variant: "error" });
      console.error(err);
      // Revert the order on error
      setAssignedContent(assignedContent);
    }
  };

  // Load pending content for approval

  // Create display handler
  const handleCreateDisplay = async () => {
    if (!selectedMasjidId || !newDisplayName.trim()) return;

    try {
      setCreateLoading(true);
      const newDisplay = await createDisplay({
        display_name: newDisplayName.trim(),
        masjid_id: selectedMasjidId,
      });

      // Update displays list
      setDisplays([...displays, newDisplay]);

      // Auto-select the new display
      setSelectedDisplayId(newDisplay.id);

      // Reset form and close dialog
      setNewDisplayName("");
      setCreateDisplayDialog(false);

      enqueueSnackbar("Display created successfully!", { variant: "success" });
    } catch (err: any) {
      enqueueSnackbar(`Failed to create display: ${err.message}`, {
        variant: "error",
      });
      console.error(err);
    } finally {
      setCreateLoading(false);
    }
  };

  const unassignedContent = availableContent.filter(
    (ac) => !assignedContent.some((asc) => asc.id === ac.id)
  );

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-teal-50/30">
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
        {/* Page Header with Legacy-inspired styling */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-3">
            Pengurusan{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-500">
              Paparan TV
            </span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Uruskan paparan TV masjid, tetapan kandungan, dan jadual tayangan
          </p>
        </div>

        {/* Masjid Selection - Mobile First */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            background: "white",
          }}
        >
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Pilih Masjid</InputLabel>
                <Select
                  value={selectedMasjidId}
                  label="Pilih Masjid"
                  onChange={handleMasjidChange}
                >
                  {userMasjids.map((masjid) => (
                    <MenuItem key={masjid.id} value={masjid.id}>
                      {masjid.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <FormControl fullWidth size="small" disabled={!selectedMasjidId}>
                <InputLabel>Pilih Paparan</InputLabel>
                <Select
                  value={selectedDisplayId}
                  label="Pilih Paparan"
                  onChange={handleDisplayChange}
                >
                  {displays.map((display) => (
                    <MenuItem key={display.id} value={display.id}>
                      {display.display_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                variant="outlined"
                fullWidth
                disabled={!selectedMasjidId}
                onClick={() => setCreateDisplayDialog(true)}
                size="small"
                sx={{
                  height: { xs: 40, md: 40 },
                  whiteSpace: { xs: "normal", md: "nowrap" },
                }}
              >
                Cipta Baru
              </Button>
            </Grid>
          </Grid>

          {/* Display Remote Control - Mobile Responsive */}
          {selectedDisplayId && (
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: 1,
                borderColor: "divider",
              }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1, fontSize: { xs: "0.875rem", md: "0.875rem" } }}
              >
                Kawalan Jauh
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                  "& .MuiButton-root": {
                    fontSize: { xs: "0.75rem", md: "0.875rem" },
                    minWidth: { xs: "auto", md: "auto" },
                  },
                }}
              >
                <Tooltip title="Muat semula penuh paparan TV">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Refresh />}
                    onClick={async () => {
                      try {
                        const success =
                          await forceReloadDisplay(selectedDisplayId);
                        if (success) {
                          enqueueSnackbar(
                            "Arahan muat semula dihantar ke paparan",
                            {
                              variant: "success",
                            }
                          );
                        } else {
                          enqueueSnackbar("Gagal menghantar arahan", {
                            variant: "warning",
                          });
                        }
                      } catch (error: any) {
                        enqueueSnackbar(`Ralat: ${error.message}`, {
                          variant: "error",
                        });
                      }
                    }}
                    sx={{ flex: { xs: "1 1 auto", sm: "0 1 auto" } }}
                  >
                    Hard Reload
                  </Button>
                </Tooltip>
                <Tooltip title="Muat semula kandungan sahaja">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Refresh />}
                    onClick={async () => {
                      try {
                        const success =
                          await softReloadDisplay(selectedDisplayId);
                        if (success) {
                          enqueueSnackbar(
                            "Arahan muat semula dihantar ke paparan",
                            {
                              variant: "success",
                            }
                          );
                        } else {
                          enqueueSnackbar("Gagal menghantar arahan", {
                            variant: "warning",
                          });
                        }
                      } catch (error: any) {
                        enqueueSnackbar(`Ralat: ${error.message}`, {
                          variant: "error",
                        });
                      }
                    }}
                    sx={{ flex: { xs: "1 1 auto", sm: "0 1 auto" } }}
                  >
                    Soft Reload
                  </Button>
                </Tooltip>
                <Tooltip title="Kosongkan cache paparan TV">
                  <Button
                    variant="outlined"
                    size="small"
                    color="warning"
                    startIcon={<CachedOutlined />}
                    onClick={async () => {
                      try {
                        const success =
                          await clearDisplayCache(selectedDisplayId);
                        if (success) {
                          enqueueSnackbar(
                            "Arahan kosongkan cache dihantar ke paparan",
                            {
                              variant: "success",
                            }
                          );
                        } else {
                          enqueueSnackbar("Gagal menghantar arahan", {
                            variant: "warning",
                          });
                        }
                      } catch (error: any) {
                        enqueueSnackbar(`Ralat: ${error.message}`, {
                          variant: "error",
                        });
                      }
                    }}
                    sx={{ flex: { xs: "1 1 auto", sm: "0 1 auto" } }}
                  >
                    Kosongkan Cache
                  </Button>
                </Tooltip>
              </Box>
            </Box>
          )}
        </Paper>

        {selectedMasjidId && displays.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              background: "white",
            }}
          >
            <Alert severity="info">
              Tiada paparan dijumpai untuk masjid ini. Sila cipta paparan
              dahulu.
            </Alert>
          </Paper>
        )}

        {selectedDisplayId && (
          <>
            {/* Tabs - Mobile Scrollable */}
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                mb: 2,
                bgcolor: "white",
                borderRadius: "8px 8px 0 0",
                "& .MuiTabs-root": {
                  minHeight: { xs: 48, md: 48 },
                },
                "& .MuiTab-root": {
                  fontSize: { xs: "0.875rem", md: "0.9375rem" },
                  minHeight: { xs: 48, md: 48 },
                  textTransform: "none",
                  fontWeight: 600,
                },
              }}
            >
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="tabs pengurusan paparan"
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
              >
                <Tab label="Tetapan Paparan" />
                <Tab label="Penugasan Kandungan" />
              </Tabs>
            </Box>

            {/* Display Settings Tab */}
            <TabPanel value={tabValue} index={0}>
              {displaySettings && (
                <Grid container spacing={{ xs: 2, md: 3 }}>
                  {/* General Settings */}
                  <Grid item xs={12} md={6}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        height: "100%",
                      }}
                    >
                      <CardContent>
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{
                            fontSize: { xs: "1.125rem", md: "1.25rem" },
                            fontWeight: 600,
                          }}
                        >
                          Tetapan Umum
                        </Typography>
                        <TextField
                          name="display_name"
                          label="Nama Paparan"
                          value={displaySettings.display_name || ""}
                          onChange={handleSettingsChange}
                          fullWidth
                          margin="normal"
                          size="small"
                        />
                        <TextField
                          name="description"
                          label="Penerangan"
                          value={displaySettings.description || ""}
                          onChange={handleSettingsChange}
                          fullWidth
                          margin="normal"
                          multiline
                          rows={2}
                          size="small"
                        />
                        <TextField
                          name="location_description"
                          label="Lokasi"
                          value={displaySettings.location_description || ""}
                          onChange={handleSettingsChange}
                          fullWidth
                          margin="normal"
                          size="small"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              name="is_active"
                              checked={displaySettings.is_active || false}
                              onChange={handleSettingsChange}
                            />
                          }
                          label="Paparan Aktif"
                        />
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Physical Display */}
                  <Grid item xs={12} md={6}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        height: "100%",
                      }}
                    >
                      <CardContent>
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{
                            fontSize: { xs: "1.125rem", md: "1.25rem" },
                            fontWeight: 600,
                          }}
                        >
                          Tetapan Skrin Fizikal
                        </Typography>
                        <FormControl fullWidth margin="normal" size="small">
                          <InputLabel>Resolusi</InputLabel>
                          <Select
                            name="resolution"
                            value={displaySettings.resolution || "1920x1080"}
                            label="Resolusi"
                            onChange={handleSelectChange}
                          >
                            <MenuItem value="1920x1080">
                              1920x1080 (Full HD)
                            </MenuItem>
                            <MenuItem value="3840x2160">
                              3840x2160 (4K UHD)
                            </MenuItem>
                            <MenuItem value="1366x768">1366x768 (HD)</MenuItem>
                          </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal" size="small">
                          <InputLabel>Orientasi</InputLabel>
                          <Select
                            name="orientation"
                            value={displaySettings.orientation || "landscape"}
                            label="Orientasi"
                            onChange={handleSelectChange}
                          >
                            <MenuItem value="landscape">Landscape</MenuItem>
                            <MenuItem value="portrait">Portrait</MenuItem>
                          </Select>
                        </FormControl>
                        <FormControlLabel
                          control={
                            <Switch
                              name="is_touch_enabled"
                              checked={
                                displaySettings.is_touch_enabled || false
                              }
                              onChange={handleSettingsChange}
                            />
                          }
                          label="Skrin Sentuh Diaktifkan"
                        />
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Content Carousel */}
                  <Grid item xs={12} md={6}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        height: "100%",
                      }}
                    >
                      <CardContent>
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{
                            fontSize: { xs: "1.125rem", md: "1.25rem" },
                            fontWeight: 600,
                          }}
                        >
                          Carousel Kandungan
                        </Typography>
                        <TextField
                          name="carousel_interval"
                          label="Selang Carousel (saat)"
                          type="number"
                          value={displaySettings.carousel_interval || 10}
                          onChange={handleSettingsChange}
                          fullWidth
                          margin="normal"
                          size="small"
                        />
                        <TextField
                          name="max_content_items"
                          label="Had Kandungan"
                          type="number"
                          value={displaySettings.max_content_items || 10}
                          onChange={handleSettingsChange}
                          fullWidth
                          margin="normal"
                          size="small"
                        />
                        <FormControl fullWidth margin="normal" size="small">
                          <InputLabel>Transisi</InputLabel>
                          <Select
                            name="content_transition_type"
                            value={
                              displaySettings.content_transition_type || "fade"
                            }
                            label="Transisi"
                            onChange={handleSelectChange}
                          >
                            <MenuItem value="fade">Fade</MenuItem>
                            <MenuItem value="slide">Slide</MenuItem>
                            <MenuItem value="zoom">Zoom</MenuItem>
                            <MenuItem value="none">None</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          name="auto_refresh_interval"
                          label="Selang Auto-Refresh (minit)"
                          type="number"
                          value={displaySettings.auto_refresh_interval || 60}
                          onChange={handleSettingsChange}
                          fullWidth
                          margin="normal"
                          size="small"
                        />
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Prayer Times */}
                  <Grid item xs={12} md={6}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        height: "100%",
                      }}
                    >
                      <CardContent>
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{
                            fontSize: { xs: "1.125rem", md: "1.25rem" },
                            fontWeight: 600,
                          }}
                        >
                          Paparan Waktu Solat
                        </Typography>
                        <FormControl fullWidth margin="normal" size="small">
                          <InputLabel>Posisi</InputLabel>
                          <Select
                            name="prayer_time_position"
                            value={
                              displaySettings.prayer_time_position || "top"
                            }
                            label="Posisi"
                            onChange={handleSelectChange}
                          >
                            <MenuItem value="top">Atas</MenuItem>
                            <MenuItem value="bottom">Bawah</MenuItem>
                            <MenuItem value="left">Kiri</MenuItem>
                            <MenuItem value="right">Kanan</MenuItem>
                            <MenuItem value="hidden">Tersembunyi</MenuItem>
                          </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal" size="small">
                          <InputLabel>Saiz Fon</InputLabel>
                          <Select
                            name="prayer_time_font_size"
                            value={
                              displaySettings.prayer_time_font_size || "medium"
                            }
                            label="Saiz Fon"
                            onChange={handleSelectChange}
                          >
                            <MenuItem value="small">Kecil</MenuItem>
                            <MenuItem value="medium">Sederhana</MenuItem>
                            <MenuItem value="large">Besar</MenuItem>
                            <MenuItem value="extra_large">
                              Sangat Besar
                            </MenuItem>
                          </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal" size="small">
                          <InputLabel>Susun Atur</InputLabel>
                          <Select
                            name="prayer_time_layout"
                            value={
                              displaySettings.prayer_time_layout || "horizontal"
                            }
                            label="Susun Atur"
                            onChange={handleSelectChange}
                          >
                            <MenuItem value="horizontal">
                              Mendatar (Sisi)
                            </MenuItem>
                            <MenuItem value="vertical">
                              Menegak (Bertindan)
                            </MenuItem>
                          </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal" size="small">
                          <InputLabel>Penjajaran</InputLabel>
                          <Select
                            name="prayer_time_alignment"
                            value={
                              displaySettings.prayer_time_alignment || "center"
                            }
                            label="Penjajaran"
                            onChange={handleSelectChange}
                          >
                            <MenuItem value="left">Kiri</MenuItem>
                            <MenuItem value="center">Tengah</MenuItem>
                            <MenuItem value="right">Kanan</MenuItem>
                            <MenuItem value="top">Atas</MenuItem>
                            <MenuItem value="bottom">Bawah</MenuItem>
                            <MenuItem value="space-between">
                              Jarak Antara
                            </MenuItem>
                            <MenuItem value="space-around">
                              Jarak Sekeliling
                            </MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          name="prayer_time_background_opacity"
                          label="Kelegapan Latar (0-1)"
                          type="number"
                          value={
                            displaySettings.prayer_time_background_opacity ||
                            0.8
                          }
                          onChange={handleSettingsChange}
                          fullWidth
                          margin="normal"
                          size="small"
                          inputProps={{ step: "0.1", min: 0, max: 1 }}
                        />
                        <Box
                          sx={{ display: "flex", alignItems: "center", mt: 2 }}
                        >
                          <Typography>Font Color:</Typography>
                          <Chip
                            label={
                              displaySettings.prayer_time_color || "#FFFFFF"
                            }
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            style={{
                              backgroundColor:
                                displaySettings.prayer_time_color || "#FFFFFF",
                              color: "#000",
                              marginLeft: "10px",
                            }}
                          />
                        </Box>
                        {showColorPicker && (
                          <Box sx={{ position: "relative", zIndex: 2 }}>
                            <Box sx={{ position: "absolute", top: "10px" }}>
                              <SketchPicker
                                color={
                                  displaySettings.prayer_time_color || "#FFFFFF"
                                }
                                onChangeComplete={handleColorChange}
                              />
                            </Box>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Image Display Settings */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Image Display
                        </Typography>
                        <FormControl fullWidth margin="normal">
                          <InputLabel>Display Mode</InputLabel>
                          <Select
                            name="image_display_mode"
                            value={
                              displaySettings.image_display_mode || "contain"
                            }
                            label="Display Mode"
                            onChange={handleSelectChange}
                          >
                            <MenuItem value="contain">
                              Fit (Maintain Aspect Ratio)
                            </MenuItem>
                            <MenuItem value="cover">Fill (May Crop)</MenuItem>
                            <MenuItem value="fill">Stretch to Fill</MenuItem>
                            <MenuItem value="none">Original Size</MenuItem>
                          </Select>
                        </FormControl>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mb: 2 }}
                        >
                          {displaySettings.image_display_mode === "contain" &&
                            "Images will fit within the screen while maintaining aspect ratio (recommended)"}
                          {displaySettings.image_display_mode === "cover" &&
                            "Images will fill the entire screen and may be cropped"}
                          {displaySettings.image_display_mode === "fill" &&
                            "Images will stretch to fill the screen (may distort)"}
                          {displaySettings.image_display_mode === "none" &&
                            "Images will display at their original size"}
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mt: 2 }}
                        >
                          <Typography>Background Color:</Typography>
                          <Chip
                            label={
                              displaySettings.image_background_color ||
                              "#000000"
                            }
                            onClick={() =>
                              setShowImageBgColorPicker(!showImageBgColorPicker)
                            }
                            style={{
                              backgroundColor:
                                displaySettings.image_background_color ||
                                "#000000",
                              color: "#FFFFFF",
                              marginLeft: "10px",
                              cursor: "pointer",
                            }}
                          />
                        </Box>
                        {showImageBgColorPicker && (
                          <Box sx={{ mt: 2 }}>
                            <SketchPicker
                              color={
                                displaySettings.image_background_color ||
                                "#000000"
                              }
                              onChangeComplete={(color) => {
                                handleSelectChange({
                                  target: {
                                    name: "image_background_color",
                                    value: color.hex,
                                  },
                                } as any);
                                setShowImageBgColorPicker(false);
                              }}
                            />
                          </Box>
                        )}
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mt: 1 }}
                        >
                          Background color for letterboxed/pillarboxed images
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Sponsorship */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Sponsorship
                        </Typography>
                        <FormControlLabel
                          control={
                            <Switch
                              name="show_sponsorship_amounts"
                              checked={
                                displaySettings.show_sponsorship_amounts ||
                                false
                              }
                              onChange={handleSettingsChange}
                            />
                          }
                          label="Show Sponsorship Amounts"
                        />
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Debug and Development */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Debug & Development
                        </Typography>
                        <FormControlLabel
                          control={
                            <Switch
                              name="show_debug_info"
                              checked={displaySettings.show_debug_info || false}
                              onChange={handleSettingsChange}
                            />
                          }
                          label="Show Debug Information"
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mt: 1 }}
                        >
                          Enable to show debugging views such as Display Status,
                          Display Info, Configuration Updated notifications, and
                          Offline Mode indicators on the TV display.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Black Screen Schedule */}
                  <Grid item xs={12}>
                    <BlackScreenScheduler
                      enabled={displaySettings.black_screen_enabled || false}
                      scheduleType={
                        (displaySettings.black_screen_schedule_type ||
                          "daily") as BlackScreenScheduleType
                      }
                      startTime={
                        displaySettings.black_screen_start_time || null
                      }
                      endTime={displaySettings.black_screen_end_time || null}
                      days={
                        (displaySettings.black_screen_days || []) as DayOfWeek[]
                      }
                      message={displaySettings.black_screen_message || null}
                      showClock={
                        displaySettings.black_screen_show_clock ?? true
                      }
                      onChange={(settings) => {
                        setDisplaySettings({
                          ...displaySettings,
                          ...settings,
                        });
                      }}
                      language="ms"
                    />
                  </Grid>
                </Grid>
              )}

              <Box
                sx={{
                  mt: 4,
                  display: "flex",
                  justifyContent: { xs: "stretch", sm: "flex-end" },
                  px: { xs: 2, md: 0 },
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveDisplaySettings}
                  disabled={saving || !displaySettings}
                  fullWidth={true}
                  sx={{
                    maxWidth: { xs: "100%", sm: 200 },
                    py: { xs: 1.5, sm: 1 },
                    fontSize: { xs: "1rem", sm: "0.875rem" },
                    fontWeight: 600,
                  }}
                >
                  {saving ? <CircularProgress size={24} /> : "Simpan Tetapan"}
                </Button>
              </Box>
            </TabPanel>

            {/* Content Assignment Tab - Mobile First */}
            <TabPanel value={tabValue} index={1}>
              {contentLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={{ xs: 2, md: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <CardContent>
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{ fontSize: { xs: "1.125rem", md: "1.25rem" } }}
                        >
                          Kandungan Tersedia
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Kandungan yang diluluskan dari{" "}
                          {
                            userMasjids.find((m) => m.id === selectedMasjidId)
                              ?.name
                          }
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        {unassignedContent.length === 0 ? (
                          <Typography color="text.secondary">
                            Tiada kandungan tersedia untuk ditugaskan
                          </Typography>
                        ) : (
                          <List
                            sx={{
                              "& .MuiListItem-root": { px: { xs: 1, md: 2 } },
                            }}
                          >
                            {unassignedContent.map((content) => (
                              <ListItem
                                key={content.id}
                                sx={{
                                  flexDirection: { xs: "column", sm: "row" },
                                  alignItems: { xs: "stretch", sm: "center" },
                                  gap: { xs: 1, sm: 0 },
                                }}
                                secondaryAction={
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() =>
                                      handleOpenAssignDialog(content)
                                    }
                                    sx={{
                                      fontSize: {
                                        xs: "0.75rem",
                                        sm: "0.875rem",
                                      },
                                      width: { xs: "100%", sm: "auto" },
                                    }}
                                  >
                                    Tugaskan
                                  </Button>
                                }
                              >
                                <ListItemText
                                  primary={content.title}
                                  secondary={`${content.type} • ${content.duration}s`}
                                  sx={{ pr: { xs: 0, sm: 2 } }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <CardContent>
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{ fontSize: { xs: "1.125rem", md: "1.25rem" } }}
                        >
                          Kandungan Ditugaskan
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Kandungan yang ditugaskan kepada paparan ini
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        {assignedContent.length === 0 ? (
                          <Typography color="text.secondary">
                            Tiada kandungan ditugaskan kepada paparan ini
                          </Typography>
                        ) : (
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "block",
                                mb: 2,
                                fontSize: { xs: "0.75rem", md: "0.75rem" },
                              }}
                            >
                              Seret dan lepas untuk menyusun semula kandungan
                            </Typography>
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={handleDragEnd}
                            >
                              <SortableContext
                                items={assignedContent.map((c) => c.id)}
                                strategy={verticalListSortingStrategy}
                              >
                                <List
                                  sx={{
                                    "& .MuiListItem-root": {
                                      px: { xs: 0, md: 1 },
                                    },
                                  }}
                                >
                                  {assignedContent.map((content) => (
                                    <SortableContentItem
                                      key={content.id}
                                      content={content}
                                      onRemove={handleRemove}
                                      onEditSettings={handleOpenEditDialog}
                                    />
                                  ))}
                                </List>
                              </SortableContext>
                            </DndContext>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </TabPanel>
          </>
        )}

        {/* Create Display Dialog - Mobile Optimized */}
        <Dialog
          open={createDisplayDialog}
          onClose={() => {
            setCreateDisplayDialog(false);
            setNewDisplayName("");
          }}
          maxWidth="sm"
          fullWidth
          fullScreen={false}
          PaperProps={{
            sx: {
              m: { xs: 2, sm: 3 },
              maxWidth: { xs: "calc(100% - 32px)", sm: 600 },
            },
          }}
        >
          <DialogTitle sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
            Cipta Paparan TV Baru
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nama Paparan"
              fullWidth
              variant="outlined"
              value={newDisplayName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewDisplayName(e.target.value)
              }
              disabled={createLoading}
              placeholder="cth: Paparan Dewan Utama, Skrin Pintu Masuk"
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: { xs: 2, md: 3 }, gap: 1 }}>
            <Button
              onClick={() => {
                setCreateDisplayDialog(false);
                setNewDisplayName("");
              }}
              disabled={createLoading}
              fullWidth={false}
              sx={{ minWidth: { xs: 100, sm: 120 } }}
            >
              Batal
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateDisplay}
              disabled={createLoading || !newDisplayName.trim()}
              fullWidth={false}
              sx={{ minWidth: { xs: 100, sm: 120 } }}
            >
              {createLoading ? <CircularProgress size={20} /> : "Cipta"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Content Settings Dialog - For Assigning */}
        {contentToAssign && (
          <ContentSettingsDialog
            open={assignDialogOpen}
            onClose={() => {
              setAssignDialogOpen(false);
              setContentToAssign(null);
            }}
            onSave={handleAssignWithSettings}
            contentType={contentToAssign.type as any}
            contentTitle={contentToAssign.title}
            mode="assign"
          />
        )}

        {/* Content Settings Dialog - For Editing */}
        {contentToEdit && (
          <ContentSettingsDialog
            open={editDialogOpen}
            onClose={() => {
              setEditDialogOpen(false);
              setContentToEdit(null);
            }}
            onSave={handleSaveContentSettings}
            contentType={contentToEdit.type as any}
            contentTitle={contentToEdit.title}
            initialSettings={contentToEdit.currentSettings}
            mode="edit"
          />
        )}
      </Container>
    </div>
  );
};

export default DisplayManagement;
