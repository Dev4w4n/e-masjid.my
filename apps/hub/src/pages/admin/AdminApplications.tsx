import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
  Badge,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import {
  Visibility,
  Check,
  Close,
  Person,
  Mosque,
  Refresh,
} from "@mui/icons-material";
import { useProfile, usePermissions } from "@masjid-suite/auth";

// Mock data for admin applications
const mockApplications = [
  {
    id: "01234567-89ab-cdef-0123-456789abcdef",
    type: "masjid_admin",
    applicant: {
      id: "user1",
      full_name: "Ahmad Bin Abdullah",
      email: "ahmad.abdullah@example.com",
      phone_number: "+60123456789",
      ic_number: "901234-12-5678",
    },
    masjid: {
      id: "masjid1",
      name: "Masjid Al-Hidayah",
      registration_number: "MSJ-2024-002",
    },
    reason:
      "I have been actively involved in this masjid for over 10 years and would like to help with administrative duties. I have experience in community management and Islamic education.",
    supporting_documents: [
      { name: "ic_copy.pdf", url: "#" },
      { name: "recommendation_letter.pdf", url: "#" },
    ],
    status: "pending",
    submitted_at: "2024-03-10T14:30:00Z",
    reviewed_at: null,
    reviewed_by: null,
    reviewer_comments: null,
  },
  {
    id: "01234567-89ab-cdef-0123-456789abcde0",
    type: "masjid_admin",
    applicant: {
      id: "user2",
      full_name: "Fatimah Binti Mohamed",
      email: "fatimah.mohamed@example.com",
      phone_number: "+60987654321",
      ic_number: "851234-56-7890",
    },
    masjid: {
      id: "masjid2",
      name: "Masjid Ar-Rahman",
      registration_number: "MSJ-2024-003",
    },
    reason:
      "As a long-time member of this community, I want to contribute to masjid administration. I have a background in finance and can help with budget management.",
    supporting_documents: [
      { name: "ic_copy.pdf", url: "#" },
      { name: "qualification_cert.pdf", url: "#" },
    ],
    status: "approved",
    submitted_at: "2024-03-05T09:15:00Z",
    reviewed_at: "2024-03-08T16:45:00Z",
    reviewed_by: "Super Admin",
    reviewer_comments:
      "Excellent qualifications and community involvement. Approved for masjid admin role.",
  },
  {
    id: "01234567-89ab-cdef-0123-456789abcde1",
    type: "masjid_admin",
    applicant: {
      id: "user3",
      full_name: "Mohamed Bin Hassan",
      email: "mohamed.hassan@example.com",
      phone_number: "+60567891234",
      ic_number: "801234-98-7654",
    },
    masjid: {
      id: "masjid1",
      name: "Masjid Al-Hidayah",
      registration_number: "MSJ-2024-002",
    },
    reason:
      "Requesting admin access for organizing youth programs and managing events.",
    supporting_documents: [{ name: "ic_copy.pdf", url: "#" }],
    status: "rejected",
    submitted_at: "2024-03-01T11:20:00Z",
    reviewed_at: "2024-03-03T14:10:00Z",
    reviewed_by: "Super Admin",
    reviewer_comments:
      "Insufficient supporting documentation and limited community involvement history.",
  },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`applications-tabpanel-${index}`}
      aria-labelledby={`applications-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Admin applications management component
 */
function AdminApplications() {
  const profile = useProfile();
  const permissions = usePermissions();

  const [applications, setApplications] = useState(mockApplications);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewComments, setReviewComments] = useState("");
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(
    null
  );

  // Check permissions
  if (!permissions.isSuperAdmin()) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          You don't have permission to manage applications. Only super admins
          can access this page.
        </Alert>
      </Container>
    );
  }

  // Filter applications by status
  const pendingApplications = applications.filter(
    (app) => app.status === "pending"
  );
  const approvedApplications = applications.filter(
    (app) => app.status === "approved"
  );
  const rejectedApplications = applications.filter(
    (app) => app.status === "rejected"
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const handleReview = (application: any, action: "approve" | "reject") => {
    setSelectedApplication(application);
    setReviewAction(action);
    setReviewComments("");
    setReviewDialogOpen(true);
  };

  const handleConfirmReview = async () => {
    if (!selectedApplication || !reviewAction) return;

    try {
      setLoading(true);

      // Mock API call - replace with actual implementation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedApplication = {
        ...selectedApplication,
        status: reviewAction === "approve" ? "approved" : "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: profile?.full_name || "Super Admin",
        reviewer_comments: reviewComments,
      };

      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApplication.id ? updatedApplication : app
        )
      );

      setReviewDialogOpen(false);
      setSelectedApplication(null);
      setReviewAction(null);
      setReviewComments("");
    } catch (error) {
      console.error("Failed to review application:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (application: any) => {
    setSelectedApplication(application);
  };

  const refreshApplications = async () => {
    setLoading(true);
    // Mock API call - replace with actual implementation
    setTimeout(() => {
      setApplications(mockApplications);
      setLoading(false);
    }, 1000);
  };

  const renderApplicationTable = (applicationList: any[]) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Applicant</TableCell>
            <TableCell>Masjid</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Submitted</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {applicationList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                  No applications found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            applicationList.map((application) => (
              <TableRow key={application.id} hover>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {application.applicant.full_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {application.applicant.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {application.masjid.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {application.masjid.registration_number}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Chip
                    icon={<Mosque />}
                    label="Masjid Admin"
                    size="small"
                    variant="outlined"
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {new Date(application.submitted_at).toLocaleDateString(
                      "en-MY"
                    )}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(application.submitted_at).toLocaleTimeString(
                      "en-MY",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    label={application.status}
                    color={getStatusColor(application.status) as any}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewApplication(application)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>

                    {application.status === "pending" && (
                      <>
                        <Tooltip title="Approve">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleReview(application, "approve")}
                          >
                            <Check />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleReview(application, "reject")}
                          >
                            <Close />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

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
            Application Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and manage masjid administrator applications.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={refreshApplications}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h3" color="warning.main">
                {pendingApplications.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Review
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h3" color="success.main">
                {approvedApplications.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h3" color="error.main">
                {rejectedApplications.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rejected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
          >
            <Tab
              label={
                <Badge
                  badgeContent={pendingApplications.length}
                  color="warning"
                >
                  Pending
                </Badge>
              }
            />
            <Tab label="Approved" />
            <Tab label="Rejected" />
            <Tab label="All Applications" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {renderApplicationTable(pendingApplications)}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {renderApplicationTable(approvedApplications)}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {renderApplicationTable(rejectedApplications)}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {renderApplicationTable(applications)}
        </TabPanel>
      </Card>

      {/* Application Detail Dialog */}
      <Dialog
        open={selectedApplication && !reviewDialogOpen}
        onClose={() => setSelectedApplication(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedApplication && (
          <>
            <DialogTitle>Application Details</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Applicant Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Full Name"
                        secondary={selectedApplication.applicant.full_name}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Email"
                        secondary={selectedApplication.applicant.email}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Phone"
                        secondary={selectedApplication.applicant.phone_number}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="IC Number"
                        secondary={selectedApplication.applicant.ic_number}
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Masjid Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Masjid Name"
                        secondary={selectedApplication.masjid.name}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Registration Number"
                        secondary={
                          selectedApplication.masjid.registration_number
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Application Type"
                        secondary="Masjid Administrator"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Status"
                        secondary={
                          <Chip
                            label={selectedApplication.status}
                            color={
                              getStatusColor(selectedApplication.status) as any
                            }
                            size="small"
                          />
                        }
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Reason for Application
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedApplication.reason}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Supporting Documents
                  </Typography>
                  <List dense>
                    {selectedApplication.supporting_documents.map(
                      (doc: any, index: number) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={doc.name}
                            secondary="Click to download"
                          />
                          <ListItemSecondaryAction>
                            <Button size="small" href={doc.url}>
                              Download
                            </Button>
                          </ListItemSecondaryAction>
                        </ListItem>
                      )
                    )}
                  </List>
                </Grid>

                {selectedApplication.reviewer_comments && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Review Comments
                    </Typography>
                    <Alert
                      severity={
                        selectedApplication.status === "approved"
                          ? "success"
                          : "error"
                      }
                    >
                      <Typography variant="body2">
                        {selectedApplication.reviewer_comments}
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 1 }}
                      >
                        Reviewed by: {selectedApplication.reviewed_by} on{" "}
                        {new Date(
                          selectedApplication.reviewed_at
                        ).toLocaleDateString("en-MY")}
                      </Typography>
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              {selectedApplication.status === "pending" && (
                <>
                  <Button
                    color="error"
                    onClick={() => handleReview(selectedApplication, "reject")}
                  >
                    Reject
                  </Button>
                  <Button
                    color="success"
                    variant="contained"
                    onClick={() => handleReview(selectedApplication, "approve")}
                  >
                    Approve
                  </Button>
                </>
              )}
              <Button onClick={() => setSelectedApplication(null)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {reviewAction === "approve" ? "Approve" : "Reject"} Application
        </DialogTitle>
        <DialogContent>
          <Typography paragraph>
            You are about to {reviewAction} the application from{" "}
            <strong>{selectedApplication?.applicant.full_name}</strong> for{" "}
            <strong>{selectedApplication?.masjid.name}</strong>.
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Review Comments"
            placeholder={`Enter your comments for ${reviewAction === "approve" ? "approving" : "rejecting"} this application...`}
            value={reviewComments}
            onChange={(e) => setReviewComments(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmReview}
            color={reviewAction === "approve" ? "success" : "error"}
            variant="contained"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              `Confirm ${reviewAction}`
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminApplications;
