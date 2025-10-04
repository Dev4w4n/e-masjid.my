import { useState, useEffect } from "react";
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
  Snackbar,
} from "@mui/material";
import {
  Visibility,
  Check,
  Close,
  Person,
  Mosque,
  Refresh,
  Email,
  Phone,
  Home,
} from "@mui/icons-material";
import { useProfile, usePermissions } from "@masjid-suite/auth";
import { UserApprovalService } from "@masjid-suite/user-approval";
import supabase from "@masjid-suite/supabase-client";

// Type for user approval with details
interface UserApprovalWithDetails {
  id: string;
  user_id: string;
  home_masjid_id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_notes: string | null;
  user?:
    | {
        email?: string;
        full_name?: string;
        phone_number?: string | null;
      }
    | undefined;
  masjid?:
    | {
        name?: string;
      }
    | undefined;
  address?: {
    address_line_1: string;
    address_line_2?: string | null;
    city: string;
    state: string;
    postcode: string;
    country: string;
    address_type: string;
  } | null;
}

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
      id={`approvals-tabpanel-${index}`}
      aria-labelledby={`approvals-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * User Approvals management component for masjid admins
 */
function UserApprovals() {
  const profile = useProfile();
  const permissions = usePermissions();

  const [approvals, setApprovals] = useState<UserApprovalWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedApproval, setSelectedApproval] =
    useState<UserApprovalWithDetails | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check permissions
  const isMasjidAdmin =
    permissions.isMasjidAdmin() || permissions.isSuperAdmin();

  // Load approvals using database query with RLS
  const loadApprovals = async () => {
    if (!isMasjidAdmin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get list of masjids the user administers
      const { data: masjidIds, error: masjidsError } = await supabase.rpc(
        "get_user_admin_masjids"
      );

      if (masjidsError) {
        throw masjidsError;
      }

      console.log("Masjid IDs user administers:", masjidIds);

      if (!masjidIds || masjidIds.length === 0) {
        setApprovals([]);
        console.log("User is not admin of any masjids");
        return;
      }

      // Get masjid details for the IDs
      const { data: masjidsData, error: masjidsDataError } = await supabase
        .from("masjids")
        .select("id, name")
        .in("id", masjidIds);

      if (masjidsDataError) {
        throw masjidsDataError;
      }

      console.log("Masjids data:", masjidsData);

      // Fetch approvals for all administered masjids using the database function
      const approvalPromises = (masjidsData || []).map(async (masjid) => {
        const { data, error } = await supabase.rpc(
          "get_user_approvals_history",
          { target_masjid_id: masjid.id }
        );

        if (error) {
          console.error(
            `Failed to load approvals for masjid ${masjid.name}:`,
            error
          );
          return [];
        }

        // Add masjid info to each approval
        return (data || []).map((approval: any) => ({
          ...approval,
          masjid_id: masjid.id,
          masjid_name: masjid.name,
        }));
      });

      const allApprovalsArrays = await Promise.all(approvalPromises);
      const allApprovals = allApprovalsArrays.flat();

      // Get user IDs to fetch addresses
      const userIds = allApprovals.map((item: any) => item.user_id);

      // Fetch primary addresses for all users
      let addressesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: addressesData, error: addressesError } = await supabase
          .from("profile_addresses")
          .select("*, profiles!inner(user_id)")
          .in("profiles.user_id", userIds)
          .eq("is_primary", true);

        if (!addressesError && addressesData) {
          addressesMap = addressesData.reduce(
            (acc, addr: any) => {
              acc[addr.profiles.user_id] = addr;
              return acc;
            },
            {} as Record<string, any>
          );
        }
      }

      // Transform the data to match our interface
      const transformedData: UserApprovalWithDetails[] = allApprovals.map(
        (item: any) => ({
          id: item.approval_id,
          user_id: item.user_id,
          home_masjid_id: item.masjid_id,
          status: item.status,
          created_at: item.requested_at,
          reviewed_at: item.reviewed_at,
          reviewed_by: null, // We have reviewer_email instead
          review_notes: item.review_notes,
          user: {
            email: item.user_email,
            full_name: item.user_full_name,
            phone_number: null, // Not returned by history function
          },
          masjid: {
            name: item.masjid_name,
          },
          address: addressesMap[item.user_id] || null,
        })
      );

      // Sort by created date descending
      transformedData.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setApprovals(transformedData);
    } catch (err) {
      console.error("Failed to load approvals:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load user approvals. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, [isMasjidAdmin]);

  // Real-time subscription
  useEffect(() => {
    if (!isMasjidAdmin) return;

    // Subscribe to user_approvals table changes
    // RLS will automatically filter to only relevant masjids
    const subscription = supabase
      .channel("user-approvals")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_approvals",
        },
        () => {
          console.log("User approval updated, reloading...");
          loadApprovals();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [isMasjidAdmin]);

  if (!isMasjidAdmin) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          You don't have permission to manage user approvals. Only masjid
          administrators can access this page.
        </Alert>
      </Container>
    );
  }

  // Filter approvals by status
  const pendingApprovals = approvals.filter((app) => app.status === "pending");
  const approvedApprovals = approvals.filter(
    (app) => app.status === "approved"
  );
  const rejectedApprovals = approvals.filter(
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

  const handleReview = (
    approval: UserApprovalWithDetails,
    action: "approve" | "reject"
  ) => {
    setSelectedApproval(approval);
    setReviewAction(action);
    setReviewNotes("");
    setDetailDialogOpen(false);
    setReviewDialogOpen(true);
  };

  const handleConfirmReview = async () => {
    if (!selectedApproval || !reviewAction || !profile?.id) return;

    // Validate notes for rejection
    if (reviewAction === "reject" && reviewNotes.trim().length < 5) {
      setError("Please provide a reason for rejection (minimum 5 characters).");
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      if (reviewAction === "approve") {
        const approveParams: any = {
          approval_id: selectedApproval.id,
          approver_id: profile.user_id,
        };
        if (reviewNotes.trim()) {
          approveParams.notes = reviewNotes.trim();
        }

        await UserApprovalService.approveUser(approveParams);
        setSuccessMessage(
          `User ${selectedApproval.user?.full_name || "Unknown"} has been approved and promoted to registered user.`
        );
      } else {
        await UserApprovalService.rejectUser({
          approval_id: selectedApproval.id,
          rejector_id: profile.user_id,
          notes: reviewNotes.trim(),
        });
        setSuccessMessage(
          `User ${selectedApproval.user?.full_name || "Unknown"}'s request has been rejected.`
        );
      }

      // Reload approvals
      await loadApprovals();

      setReviewDialogOpen(false);
      setSelectedApproval(null);
      setReviewAction(null);
      setReviewNotes("");
    } catch (err) {
      console.error("Failed to review approval:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to process approval. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewApproval = (approval: UserApprovalWithDetails) => {
    setSelectedApproval(approval);
    setDetailDialogOpen(true);
  };

  const handleRefresh = () => {
    loadApprovals();
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("ms-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderApprovalTable = (approvalList: UserApprovalWithDetails[]) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Masjid</TableCell>
            <TableCell>Submitted</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {approvalList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                  {loading ? "Loading..." : "No approvals found"}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            approvalList.map((approval) => (
              <TableRow key={approval.id} hover>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {approval.user?.full_name || "Unknown User"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {approval.user?.email || "No email"}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Mosque fontSize="small" color="action" />
                    <Typography variant="body2" fontWeight="medium">
                      {approval.masjid?.name || "Unknown Masjid"}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {formatDate(approval.created_at)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    label={approval.status}
                    color={getStatusColor(approval.status) as any}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewApproval(approval)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>

                    {approval.status === "pending" && (
                      <>
                        <Tooltip title="Approve">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleReview(approval, "approve")}
                            disabled={actionLoading}
                          >
                            <Check />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleReview(approval, "reject")}
                            disabled={actionLoading}
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
            User Approvals
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and approve public users joining your masjid community.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h3" color="warning.main">
                {pendingApprovals.length}
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
                {approvedApprovals.length}
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
                {rejectedApprovals.length}
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
                <Badge badgeContent={pendingApprovals.length} color="warning">
                  Pending
                </Badge>
              }
            />
            <Tab label="Approved" />
            <Tab label="Rejected" />
            <Tab label="All" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {renderApprovalTable(pendingApprovals)}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {renderApprovalTable(approvedApprovals)}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {renderApprovalTable(rejectedApprovals)}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {renderApprovalTable(approvals)}
        </TabPanel>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedApproval && (
          <>
            <DialogTitle>User Approval Details</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    User Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <Person sx={{ mr: 2, color: "text.secondary" }} />
                      <ListItemText
                        primary="Full Name"
                        secondary={
                          selectedApproval.user?.full_name || "Unknown"
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <Email sx={{ mr: 2, color: "text.secondary" }} />
                      <ListItemText
                        primary="Email"
                        secondary={selectedApproval.user?.email || "N/A"}
                      />
                    </ListItem>
                    {selectedApproval.user?.phone_number && (
                      <ListItem>
                        <Phone sx={{ mr: 2, color: "text.secondary" }} />
                        <ListItemText
                          primary="Phone"
                          secondary={selectedApproval.user.phone_number}
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>

                {selectedApproval.address && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Address
                    </Typography>
                    <List dense>
                      <ListItem>
                        <Home sx={{ mr: 2, color: "text.secondary" }} />
                        <ListItemText
                          primary="Address"
                          secondary={
                            <>
                              {selectedApproval.address.address_line_1}
                              {selectedApproval.address.address_line_2 && (
                                <>, {selectedApproval.address.address_line_2}</>
                              )}
                              <br />
                              {selectedApproval.address.postcode}{" "}
                              {selectedApproval.address.city}
                              <br />
                              {selectedApproval.address.state}
                            </>
                          }
                        />
                      </ListItem>
                    </List>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Masjid Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <Mosque sx={{ mr: 2, color: "text.secondary" }} />
                      <ListItemText
                        primary="Masjid Name"
                        secondary={selectedApproval.masjid?.name || "Unknown"}
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Request Details
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Submitted At"
                        secondary={formatDate(selectedApproval.created_at)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Status"
                        secondary={
                          <Chip
                            label={selectedApproval.status}
                            color={
                              getStatusColor(selectedApproval.status) as any
                            }
                            size="small"
                          />
                        }
                      />
                    </ListItem>
                  </List>
                </Grid>

                {selectedApproval.review_notes && (
                  <Grid item xs={12}>
                    <Alert
                      severity={
                        selectedApproval.status === "approved"
                          ? "success"
                          : "error"
                      }
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        Review Notes
                      </Typography>
                      <Typography variant="body2">
                        {selectedApproval.review_notes}
                      </Typography>
                      {selectedApproval.reviewed_at && (
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ mt: 1 }}
                        >
                          Reviewed on {formatDate(selectedApproval.reviewed_at)}
                        </Typography>
                      )}
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              {selectedApproval.status === "pending" && (
                <>
                  <Button
                    color="error"
                    onClick={() => handleReview(selectedApproval, "reject")}
                  >
                    Reject
                  </Button>
                  <Button
                    color="success"
                    variant="contained"
                    onClick={() => handleReview(selectedApproval, "approve")}
                  >
                    Approve
                  </Button>
                </>
              )}
              <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialogOpen}
        onClose={() => !actionLoading && setReviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {reviewAction === "approve" ? "Approve" : "Reject"} User Registration
        </DialogTitle>
        <DialogContent>
          {selectedApproval && (
            <>
              <Typography paragraph>
                You are about to {reviewAction}{" "}
                <strong>
                  {selectedApproval.user?.full_name || "this user"}
                </strong>
                's request to join{" "}
                <strong>{selectedApproval.masjid?.name || "the masjid"}</strong>
                .
              </Typography>

              {reviewAction === "approve" && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  After approval:
                  <ul style={{ marginTop: 8, marginBottom: 0 }}>
                    <li>User role will be changed to "registered"</li>
                    <li>User will not be able to change home masjid again</li>
                  </ul>
                </Alert>
              )}

              {reviewAction === "reject" && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  After rejection:
                  <ul style={{ marginTop: 8, marginBottom: 0 }}>
                    <li>User's home masjid will be cleared</li>
                    <li>User can select a different masjid</li>
                  </ul>
                </Alert>
              )}

              <TextField
                fullWidth
                multiline
                rows={4}
                label={
                  reviewAction === "reject"
                    ? "Rejection Reason (Required)"
                    : "Notes (Optional)"
                }
                placeholder={`Enter your ${reviewAction === "reject" ? "reason for rejection" : "notes"}...`}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                required={reviewAction === "reject"}
                error={
                  reviewAction === "reject" && reviewNotes.trim().length < 5
                }
                helperText={
                  reviewAction === "reject" && reviewNotes.trim().length < 5
                    ? "Rejection reason must be at least 5 characters"
                    : ""
                }
                sx={{ mt: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setReviewDialogOpen(false)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmReview}
            color={reviewAction === "approve" ? "success" : "error"}
            variant="contained"
            disabled={
              actionLoading ||
              (reviewAction === "reject" && reviewNotes.trim().length < 5)
            }
          >
            {actionLoading ? (
              <CircularProgress size={20} />
            ) : (
              `Confirm ${reviewAction}`
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessMessage(null)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default UserApprovals;
