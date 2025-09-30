import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  IconButton,
  Grid,
  CircularProgress,
  Alert,
  SelectChangeEvent,
} from "@mui/material";
import { Edit, Delete, CheckCircle, Cancel } from "@mui/icons-material";
import {
  getContentForAdmin,
  updateContent,
  deleteContent,
  approveContent,
  rejectContent,
} from "../../services/contentService";
import { DisplayContent, ContentStatus } from "@masjid-suite/shared-types";
import { useUser } from "@masjid-suite/auth";

const getStatusChipColor = (status: ContentStatus) => {
  switch (status) {
    case "active":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "error";
    case "expired":
      return "default";
    default:
      return "default";
  }
};

const ContentManagement = () => {
  const [content, setContent] = useState<DisplayContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [selectedContent, setSelectedContent] = useState<DisplayContent | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const user = useUser();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const fetchedContent = await getContentForAdmin();
        setContent(fetchedContent);
      } catch (err) {
        setError("Failed to fetch content.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleApprove = async (id: string) => {
    if (!user) return;
    try {
      const updatedContent = await approveContent(id, user.id);
      setContent(content.map((c) => (c.id === id ? updatedContent : c)));
    } catch (err) {
      setError("Failed to approve content.");
      console.error(err);
    }
  };

  const handleOpenReject = (item: DisplayContent) => {
    setSelectedContent(item);
    setOpenReject(true);
  };

  const handleConfirmReject = async () => {
    if (selectedContent && user) {
      try {
        const updatedContent = await rejectContent(
          selectedContent.id,
          user.id,
          rejectionReason
        );
        setContent(
          content.map((c) => (c.id === selectedContent.id ? updatedContent : c))
        );
      } catch (err) {
        setError("Failed to reject content.");
        console.error(err);
      }
    }
    setOpenReject(false);
    setRejectionReason("");
    setSelectedContent(null);
  };

  const handleOpenEdit = (item: DisplayContent) => {
    setSelectedContent({ ...item });
    setOpenEdit(true);
  };

  const handleSaveEdit = async () => {
    if (selectedContent) {
      try {
        const {
          id,
          created_at,
          updated_at,
          masjid_id,
          submitted_by,
          submitted_at,
          ...updateData
        } = selectedContent;
        const updated = await updateContent(id, updateData);
        setContent(content.map((c) => (c.id === id ? updated : c)));
      } catch (err) {
        setError("Failed to save content.");
        console.error(err);
      }
    }
    setOpenEdit(false);
    setSelectedContent(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this content?")) {
      try {
        await deleteContent(id);
        setContent(content.filter((c) => c.id !== id));
      } catch (err) {
        setError("Failed to delete content.");
        console.error(err);
      }
    }
  };

  const handleEditChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    if (selectedContent) {
      setSelectedContent({
        ...selectedContent,
        [e.target.name]: e.target.value,
      });
    }
  };

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
        Content Management
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date Range</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {content.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.type.replace("_", " ")}</TableCell>
                <TableCell>
                  <Chip
                    label={item.status}
                    color={getStatusChipColor(item.status as ContentStatus)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(item.start_date).toLocaleDateString()} -{" "}
                  {new Date(item.end_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(item.submitted_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    {item.status === "pending" && (
                      <>
                        <IconButton
                          color="success"
                          size="small"
                          onClick={() => handleApprove(item.id)}
                        >
                          <CheckCircle />
                        </IconButton>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleOpenReject(item)}
                        >
                          <Cancel />
                        </IconButton>
                      </>
                    )}
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleOpenEdit(item)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="warning"
                      size="small"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Edit Content</DialogTitle>
        <DialogContent>
          {selectedContent && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="Title"
                  value={selectedContent.title}
                  onChange={handleEditChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  value={selectedContent.description}
                  onChange={handleEditChange}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="url"
                  label="URL"
                  value={selectedContent.url}
                  onChange={handleEditChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={selectedContent.type}
                    label="Type"
                    onChange={handleEditChange}
                  >
                    <MenuItem value="image">Image</MenuItem>
                    <MenuItem value="youtube_video">YouTube Video</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="duration"
                  label="Duration (seconds)"
                  type="number"
                  value={selectedContent.duration}
                  onChange={handleEditChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="start_date"
                  label="Start Date"
                  type="date"
                  value={selectedContent.start_date}
                  onChange={handleEditChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="end_date"
                  label="End Date"
                  type="date"
                  value={selectedContent.end_date}
                  onChange={handleEditChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog
        open={openReject}
        onClose={() => setOpenReject(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Reject Content</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Rejection"
            type="text"
            fullWidth
            variant="standard"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReject(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmReject}
            variant="contained"
            color="error"
          >
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ContentManagement;
