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
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Check,
  Close,
  Visibility,
  Schedule,
  YouTube,
  Image as ImageIcon,
  Person,
  CalendarToday,
  Article,
  DragIndicator,
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
  createDisplay,
  masjidService,
} from "@masjid-suite/supabase-client";
import supabase from "@masjid-suite/supabase-client";
import { getContentForAdmin } from "../../services/contentService";
import { updateDisplay } from "../../services/displayService";
import { DisplayContent, Tables } from "@masjid-suite/shared-types";
import { useUser } from "@masjid-suite/auth";

type TvDisplay = Tables<"tv_displays">;
type Masjid = Tables<"masjids">;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Content approval interfaces
interface PendingContent {
  id: string;
  title: string;
  description?: string | null;
  type: "image" | "youtube_video" | "text_announcement";
  url: string;
  duration: number;
  start_date: string;
  end_date: string;
  submitted_by: string;
  submitted_at: string;
  submitter_name?: string;
  masjid_id: string;
  masjid_name?: string;
}

interface ApprovalDialogState {
  open: boolean;
  content: PendingContent | null;
  action: "approve" | "reject";
  notes: string;
  duration: number;
  start_date: string;
  end_date: string;
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
  content: DisplayContent;
  onRemove: (contentId: string) => void;
}

function SortableContentItem({ content, onRemove }: SortableContentItemProps) {
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
      }}
      secondaryAction={
        <Button
          variant="outlined"
          size="small"
          color="error"
          onClick={() => onRemove(content.id)}
        >
          Remove
        </Button>
      }
    >
      <IconButton
        {...attributes}
        {...listeners}
        size="small"
        sx={{ mr: 2, cursor: "grab" }}
      >
        <DragIndicator />
      </IconButton>
      <ListItemText
        primary={content.title}
        secondary={`${content.type} • ${content.duration}s`}
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

  // Content assignment state
  const [availableContent, setAvailableContent] = useState<DisplayContent[]>(
    []
  );
  const [assignedContent, setAssignedContent] = useState<DisplayContent[]>([]);
  const [contentLoading, setContentLoading] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Content approval state
  const [pendingContent, setPendingContent] = useState<PendingContent[]>([]);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [dialogState, setDialogState] = useState<ApprovalDialogState>({
    open: false,
    content: null,
    action: "approve",
    notes: "",
    duration: 10,
    start_date: new Date().toISOString().split("T")[0]!,
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]!,
  });

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
    loadPendingContent(); // Also load pending content
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

  const handleSaveSettings = async () => {
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
  const handleAssign = async (contentId: string) => {
    if (!selectedDisplayId) return;

    try {
      await assignContent(selectedDisplayId, contentId);
      const contentToAssign = availableContent.find((c) => c.id === contentId);
      if (contentToAssign) {
        setAssignedContent([...assignedContent, contentToAssign]);
      }
      enqueueSnackbar("Content assigned successfully!", { variant: "success" });
    } catch (err) {
      enqueueSnackbar("Failed to assign content.", { variant: "error" });
      console.error(err);
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
  const loadPendingContent = async () => {
    if (!selectedMasjidId) return;

    try {
      setApprovalLoading(true);

      const { data, error: fetchError } = await supabase
        .from("display_content")
        .select(
          `
          id,
          title,
          description,
          type,
          url,
          duration,
          start_date,
          end_date,
          submitted_by,
          created_at,
          masjid_id,
          masjids!inner(name)
        `
        )
        .eq("status", "pending")
        .eq("masjid_id", selectedMasjidId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const transformedData: PendingContent[] = (data || [])
        .filter(
          (item) =>
            item.type === "image" ||
            item.type === "youtube_video" ||
            item.type === "text_announcement"
        )
        .map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          type: item.type as "image" | "youtube_video" | "text_announcement",
          url: item.url,
          duration: item.duration,
          start_date: item.start_date,
          end_date: item.end_date,
          submitted_by: item.submitted_by,
          submitted_at: item.created_at || "",
          submitter_name: "User",
          masjid_id: item.masjid_id,
          masjid_name: item.masjids?.name || "Unknown Masjid",
        }));

      setPendingContent(transformedData);
    } catch (err: any) {
      console.error("Failed to load pending content:", err);
      enqueueSnackbar("Failed to load pending content", { variant: "error" });
    } finally {
      setApprovalLoading(false);
    }
  };

  // Handle approval/rejection
  const handleApprovalAction = async () => {
    if (!dialogState.content) return;

    try {
      const updateData = {
        approved_by: user!.id,
        approved_at: new Date().toISOString(),
        approval_notes: dialogState.notes || null,
        updated_at: new Date().toISOString(),
      };

      if (dialogState.action === "approve") {
        const { error: updateError } = await supabase
          .from("display_content")
          .update({
            status: "active",
            duration: dialogState.duration,
            start_date: dialogState.start_date,
            end_date: dialogState.end_date,
            ...updateData,
          })
          .eq("id", dialogState.content.id);

        if (updateError) throw updateError;
        enqueueSnackbar("Content approved successfully!", {
          variant: "success",
        });
      } else {
        const { error: updateError } = await supabase
          .from("display_content")
          .update({
            status: "rejected",
            rejection_reason: dialogState.notes,
            ...updateData,
          })
          .eq("id", dialogState.content.id);

        if (updateError) throw updateError;
        enqueueSnackbar("Content rejected successfully!", {
          variant: "success",
        });
      }

      // Remove from pending list and refresh available content
      setPendingContent((prev) =>
        prev.filter((item) => item.id !== dialogState.content!.id)
      );

      // Refresh available content if it was approved
      if (dialogState.action === "approve") {
        fetchAllContent();
      }

      setDialogState({
        open: false,
        content: null,
        action: "approve",
        notes: "",
        duration: 10,
        start_date: new Date().toISOString().split("T")[0]!,
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]!,
      });
    } catch (err: any) {
      console.error("Failed to update content status:", err);
      enqueueSnackbar("Failed to update content status", { variant: "error" });
    }
  };

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

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-MY", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Format date for input field
  const formatDateForInput = (dateString: string) => {
    return new Date(dateString).toISOString().split("T")[0]!;
  };

  // Get default values for approval dialog
  const getDefaultApprovalValues = (content: PendingContent | null) => {
    if (!content) {
      const today = new Date().toISOString().split("T")[0]!;
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]!;
      return { duration: 10, start_date: today, end_date: nextWeek };
    }
    return {
      duration: content.duration,
      start_date: formatDateForInput(content.start_date),
      end_date: formatDateForInput(content.end_date),
    };
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
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Display Management
      </Typography>

      {/* Masjid Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Select Masjid</InputLabel>
              <Select
                value={selectedMasjidId}
                label="Select Masjid"
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
            <FormControl fullWidth disabled={!selectedMasjidId}>
              <InputLabel>Select Display</InputLabel>
              <Select
                value={selectedDisplayId}
                label="Select Display"
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
              sx={{ height: 56 }}
            >
              Create New
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {selectedMasjidId && displays.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No displays found for this masjid. Please create displays first.
        </Alert>
      )}

      {selectedDisplayId && (
        <>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="display management tabs"
            >
              <Tab label="Display Settings" />
              <Tab label="Content Assignment" />
              <Tab label="Content Approvals" />
            </Tabs>
          </Box>

          {/* Display Settings Tab */}
          <TabPanel value={tabValue} index={0}>
            {displaySettings && (
              <Grid container spacing={3}>
                {/* General Settings */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        General Settings
                      </Typography>
                      <TextField
                        name="display_name"
                        label="Display Name"
                        value={displaySettings.display_name || ""}
                        onChange={handleSettingsChange}
                        fullWidth
                        margin="normal"
                      />
                      <TextField
                        name="description"
                        label="Description"
                        value={displaySettings.description || ""}
                        onChange={handleSettingsChange}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={2}
                      />
                      <TextField
                        name="location_description"
                        label="Location"
                        value={displaySettings.location_description || ""}
                        onChange={handleSettingsChange}
                        fullWidth
                        margin="normal"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            name="is_active"
                            checked={displaySettings.is_active || false}
                            onChange={handleSettingsChange}
                          />
                        }
                        label="Display Active"
                      />
                    </CardContent>
                  </Card>
                </Grid>

                {/* Physical Display */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Physical Display
                      </Typography>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Resolution</InputLabel>
                        <Select
                          name="resolution"
                          value={displaySettings.resolution || "1920x1080"}
                          label="Resolution"
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
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Orientation</InputLabel>
                        <Select
                          name="orientation"
                          value={displaySettings.orientation || "landscape"}
                          label="Orientation"
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
                            checked={displaySettings.is_touch_enabled || false}
                            onChange={handleSettingsChange}
                          />
                        }
                        label="Touch Enabled"
                      />
                    </CardContent>
                  </Card>
                </Grid>

                {/* Content Carousel */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Content Carousel
                      </Typography>
                      <TextField
                        name="carousel_interval"
                        label="Carousel Interval (seconds)"
                        type="number"
                        value={displaySettings.carousel_interval || 10}
                        onChange={handleSettingsChange}
                        fullWidth
                        margin="normal"
                      />
                      <TextField
                        name="max_content_items"
                        label="Max Content Items"
                        type="number"
                        value={displaySettings.max_content_items || 10}
                        onChange={handleSettingsChange}
                        fullWidth
                        margin="normal"
                      />
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Transition</InputLabel>
                        <Select
                          name="content_transition_type"
                          value={
                            displaySettings.content_transition_type || "fade"
                          }
                          label="Transition"
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
                        label="Auto-Refresh Interval (minutes)"
                        type="number"
                        value={displaySettings.auto_refresh_interval || 60}
                        onChange={handleSettingsChange}
                        fullWidth
                        margin="normal"
                      />
                    </CardContent>
                  </Card>
                </Grid>

                {/* Prayer Times */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Prayer Times Display
                      </Typography>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Position</InputLabel>
                        <Select
                          name="prayer_time_position"
                          value={displaySettings.prayer_time_position || "top"}
                          label="Position"
                          onChange={handleSelectChange}
                        >
                          <MenuItem value="top">Top</MenuItem>
                          <MenuItem value="bottom">Bottom</MenuItem>
                          <MenuItem value="left">Left</MenuItem>
                          <MenuItem value="right">Right</MenuItem>
                          <MenuItem value="hidden">Hidden</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Font Size</InputLabel>
                        <Select
                          name="prayer_time_font_size"
                          value={
                            displaySettings.prayer_time_font_size || "medium"
                          }
                          label="Font Size"
                          onChange={handleSelectChange}
                        >
                          <MenuItem value="small">Small</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="large">Large</MenuItem>
                          <MenuItem value="extra_large">Extra Large</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Layout</InputLabel>
                        <Select
                          name="prayer_time_layout"
                          value={
                            displaySettings.prayer_time_layout || "horizontal"
                          }
                          label="Layout"
                          onChange={handleSelectChange}
                        >
                          <MenuItem value="horizontal">
                            Horizontal (Side by Side)
                          </MenuItem>
                          <MenuItem value="vertical">
                            Vertical (Stacked)
                          </MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Alignment</InputLabel>
                        <Select
                          name="prayer_time_alignment"
                          value={
                            displaySettings.prayer_time_alignment || "center"
                          }
                          label="Alignment"
                          onChange={handleSelectChange}
                        >
                          <MenuItem value="left">Left</MenuItem>
                          <MenuItem value="center">Center</MenuItem>
                          <MenuItem value="right">Right</MenuItem>
                          <MenuItem value="top">Top</MenuItem>
                          <MenuItem value="bottom">Bottom</MenuItem>
                          <MenuItem value="space-between">
                            Space Between
                          </MenuItem>
                          <MenuItem value="space-around">Space Around</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        name="prayer_time_background_opacity"
                        label="Background Opacity (0-1)"
                        type="number"
                        value={
                          displaySettings.prayer_time_background_opacity || 0.8
                        }
                        onChange={handleSettingsChange}
                        fullWidth
                        margin="normal"
                        inputProps={{ step: "0.1", min: 0, max: 1 }}
                      />
                      <Box
                        sx={{ display: "flex", alignItems: "center", mt: 2 }}
                      >
                        <Typography>Font Color:</Typography>
                        <Chip
                          label={displaySettings.prayer_time_color || "#FFFFFF"}
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
                              displaySettings.show_sponsorship_amounts || false
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
              </Grid>
            )}

            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveSettings}
                disabled={saving || !displaySettings}
              >
                {saving ? <CircularProgress size={24} /> : "Save Settings"}
              </Button>
            </Box>
          </TabPanel>

          {/* Content Assignment Tab */}
          <TabPanel value={tabValue} index={1}>
            {contentLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Available Content
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Approved content from{" "}
                        {
                          userMasjids.find((m) => m.id === selectedMasjidId)
                            ?.name
                        }
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      {unassignedContent.length === 0 ? (
                        <Typography color="text.secondary">
                          No available content to assign
                        </Typography>
                      ) : (
                        <List>
                          {unassignedContent.map((content) => (
                            <ListItem
                              key={content.id}
                              secondaryAction={
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleAssign(content.id)}
                                >
                                  Assign
                                </Button>
                              }
                            >
                              <ListItemText
                                primary={content.title}
                                secondary={`${content.type} • ${content.duration}s`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Assigned Content
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Content currently assigned to this display
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      {assignedContent.length === 0 ? (
                        <Typography color="text.secondary">
                          No content assigned to this display
                        </Typography>
                      ) : (
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mb: 2 }}
                          >
                            Drag and drop to reorder content
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
                              <List>
                                {assignedContent.map((content) => (
                                  <SortableContentItem
                                    key={content.id}
                                    content={content}
                                    onRemove={handleRemove}
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

          {/* Content Approvals Tab */}
          <TabPanel value={tabValue} index={2}>
            {approvalLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
                <CircularProgress />
              </Box>
            ) : pendingContent.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h6" color="text.secondary">
                  No pending content submissions
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  All content has been reviewed or no new submissions yet.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {pendingContent.map((content) => (
                  <Grid item xs={12} md={6} lg={4} key={content.id}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        {/* Content Type Badge */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 2,
                          }}
                        >
                          <Chip
                            icon={
                              content.type === "image" ? (
                                <ImageIcon />
                              ) : content.type === "youtube_video" ? (
                                <YouTube />
                              ) : (
                                <Article />
                              )
                            }
                            label={
                              content.type === "image"
                                ? "Image"
                                : content.type === "youtube_video"
                                  ? "YouTube Video"
                                  : "Text Announcement"
                            }
                            color="primary"
                            size="small"
                          />
                          <Chip
                            icon={<Schedule />}
                            label={`${content.duration}s`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>

                        {/* Title */}
                        <Typography variant="h6" gutterBottom noWrap>
                          {content.title}
                        </Typography>

                        {/* Description */}
                        {content.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 2,
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {content.description}
                          </Typography>
                        )}

                        {/* Content Preview */}
                        {content.type === "image" ? (
                          <Box
                            sx={{
                              width: "100%",
                              height: 120,
                              backgroundColor: "grey.100",
                              borderRadius: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mb: 2,
                              backgroundImage: `url(${content.url})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          >
                            {!content.url && (
                              <ImageIcon
                                sx={{ fontSize: 48, color: "grey.400" }}
                              />
                            )}
                          </Box>
                        ) : content.type === "youtube_video" ? (
                          <Box
                            sx={{
                              width: "100%",
                              height: 120,
                              backgroundColor: "red.50",
                              borderRadius: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mb: 2,
                            }}
                          >
                            <YouTube sx={{ fontSize: 48, color: "red.500" }} />
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              width: "100%",
                              height: 120,
                              backgroundColor: "primary.50",
                              border: "1px solid",
                              borderColor: "primary.200",
                              borderRadius: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mb: 2,
                              p: 2,
                            }}
                          >
                            {content.url ? (
                              <Typography
                                variant="body2"
                                sx={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 4,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  textAlign: "center",
                                }}
                              >
                                {content.url}
                              </Typography>
                            ) : (
                              <Article
                                sx={{ fontSize: 48, color: "primary.main" }}
                              />
                            )}
                          </Box>
                        )}

                        {/* Metadata */}
                        <Stack spacing={1}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Person fontSize="small" color="action" />
                            <Typography variant="caption">
                              {content.submitter_name}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <CalendarToday fontSize="small" color="action" />
                            <Typography variant="caption">
                              {formatDate(content.start_date)} -{" "}
                              {formatDate(content.end_date)}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>

                      <CardActions
                        sx={{ justifyContent: "space-between", p: 2 }}
                      >
                        <Tooltip title="Preview Content">
                          <IconButton
                            size="small"
                            onClick={() => {
                              if (content.type === "text_announcement") {
                                // For text announcements, we could show a dialog or just skip preview
                                // For now, let's disable preview for text content since there's no URL
                                return;
                              }
                              window.open(content.url, "_blank");
                            }}
                            disabled={content.type === "text_announcement"}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>

                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Close />}
                            onClick={() => {
                              const defaults =
                                getDefaultApprovalValues(content);
                              setDialogState({
                                open: true,
                                content,
                                action: "reject",
                                notes: "",
                                ...defaults,
                              });
                            }}
                          >
                            Reject
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<Check />}
                            onClick={() => {
                              const defaults =
                                getDefaultApprovalValues(content);
                              setDialogState({
                                open: true,
                                content,
                                action: "approve",
                                notes: "",
                                ...defaults,
                              });
                            }}
                          >
                            Approve
                          </Button>
                        </Box>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>

          {/* Approval/Rejection Dialog */}
          <Dialog
            open={dialogState.open}
            onClose={() => setDialogState({ ...dialogState, open: false })}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              {dialogState.action === "approve"
                ? "Approve Content"
                : "Reject Content"}
            </DialogTitle>
            <DialogContent>
              {dialogState.content && (
                <>
                  <Typography variant="h6" gutterBottom>
                    {dialogState.content.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    Submitted by: {dialogState.content.submitter_name}
                  </Typography>

                  {/* Display settings for approval */}
                  {dialogState.action === "approve" && (
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12}>
                        <Typography
                          variant="subtitle2"
                          color="primary"
                          gutterBottom
                        >
                          Display Settings
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Duration (seconds)"
                          type="number"
                          inputProps={{ min: 5, max: 300 }}
                          value={dialogState.duration}
                          onChange={(e) =>
                            setDialogState({
                              ...dialogState,
                              duration: parseInt(e.target.value) || 10,
                            })
                          }
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Start Date"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          value={dialogState.start_date}
                          onChange={(e) =>
                            setDialogState({
                              ...dialogState,
                              start_date: e.target.value,
                            })
                          }
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="End Date"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          value={dialogState.end_date}
                          onChange={(e) =>
                            setDialogState({
                              ...dialogState,
                              end_date: e.target.value,
                            })
                          }
                          required
                        />
                      </Grid>
                    </Grid>
                  )}

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label={
                      dialogState.action === "approve"
                        ? "Approval Notes (optional)"
                        : "Rejection Reason (required)"
                    }
                    value={dialogState.notes}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setDialogState({ ...dialogState, notes: e.target.value })
                    }
                    required={dialogState.action === "reject"}
                  />
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() =>
                  setDialogState({
                    open: false,
                    content: null,
                    action: "approve",
                    notes: "",
                    duration: 10,
                    start_date: new Date().toISOString().split("T")[0]!,
                    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]!,
                  })
                }
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color={dialogState.action === "approve" ? "success" : "error"}
                onClick={handleApprovalAction}
                disabled={
                  dialogState.action === "reject" && !dialogState.notes.trim()
                }
              >
                {dialogState.action === "approve" ? "Approve" : "Reject"}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}

      {/* Create Display Dialog - Available even when no displays exist */}
      <Dialog
        open={createDisplayDialog}
        onClose={() => {
          setCreateDisplayDialog(false);
          setNewDisplayName("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New TV Display</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Display Name"
            fullWidth
            variant="outlined"
            value={newDisplayName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewDisplayName(e.target.value)
            }
            disabled={createLoading}
            placeholder="e.g., Main Hall Display, Entrance Screen"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateDisplayDialog(false);
              setNewDisplayName("");
            }}
            disabled={createLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateDisplay}
            disabled={createLoading || !newDisplayName.trim()}
          >
            {createLoading ? <CircularProgress size={20} /> : "Create Display"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DisplayManagement;
