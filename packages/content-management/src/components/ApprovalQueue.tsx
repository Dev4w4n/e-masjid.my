/**
 * ApprovalQueue Component
 *
 * Displays pending content items for masjid admin approval.
 * Shows content cards with approval/rejection actions.
 */

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Stack,
  Button,
  Skeleton,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import ContentCard from './ContentCard.js';
import {
  getPendingApprovals,
  approveContent,
  rejectContent,
} from '../services/approval-service.js';
import type { DisplayContent } from '../types/content.js';

interface ApprovalQueueProps {
  masjidId: string;
  currentUserId: string;
}

interface FilterState {
  type: string;
  dateRange: string;
  searchQuery: string;
}

const ApprovalQueue: React.FC<ApprovalQueueProps> = ({
  masjidId,
  currentUserId,
}) => {
  // State
  const [page, setPage] = React.useState(1);
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pendingItems, setPendingItems] = React.useState<DisplayContent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filters, setFilters] = React.useState<FilterState>({
    type: 'all',
    dateRange: 'all',
    searchQuery: '',
  });

  // Load pending approvals
  React.useEffect(() => {
    loadPendingApprovals();
  }, [masjidId]);

  const loadPendingApprovals = async () => {
    try {
      setIsLoading(true);
      const items = await getPendingApprovals(masjidId);
      setPendingItems(items.data as DisplayContent[]);
      setError(null);
    } catch (err) {
      setError(`Failed to load pending approvals: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const itemsPerPage = 12;

  // Filter and paginate content
  const filteredContent = React.useMemo(() => {
    if (!pendingItems) return [];

    return pendingItems.filter((item: DisplayContent) => {
      // Type filter
      if (filters.type !== 'all' && item.type !== filters.type) {
        return false;
      }

      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDescription = item.description
          ?.toLowerCase()
          .includes(query);
        if (!matchesTitle && !matchesDescription) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const submittedDate = new Date(item.submitted_at);
        const now = new Date();
        const daysDiff = Math.floor(
          (now.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        switch (filters.dateRange) {
          case 'today':
            if (daysDiff > 0) return false;
            break;
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
        }
      }

      return true;
    });
  }, [pendingItems, filters]);

  const paginatedContent = filteredContent.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredContent.length / itemsPerPage);

  // Handlers
  const handleApprove = async (contentId: string, notes?: string) => {
    setIsProcessing(contentId);
    setError(null);

    try {
      const request: any = { approver_id: currentUserId };
      if (notes) request.notes = notes;
      await approveContent(contentId, request);
      loadPendingApprovals(); // Refresh the list
    } catch (err) {
      setError(`Failed to approve content: ${err}`);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (contentId: string, reason: string) => {
    setIsProcessing(contentId);
    setError(null);

    try {
      await rejectContent(contentId, { rejector_id: currentUserId, reason });
      loadPendingApprovals(); // Refresh the list
    } catch (err) {
      setError(`Failed to reject content: ${err}`);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filtering
  };

  const handleRefresh = () => {
    setError(null);
    loadPendingApprovals();
  };

  // Content type options
  const contentTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'image', label: 'Images' },
    { value: 'youtube_video', label: 'YouTube Videos' },
    { value: 'text_announcement', label: 'Text Announcements' },
    { value: 'event_poster', label: 'Event Posters' },
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ];

  // Loading state
  if (isLoading) {
    return (
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          Content Approval Queue
        </Typography>
        <Grid container spacing={3}>
          {Array.from({ length: 6 }, (_, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={140} />
                <CardContent>
                  <Skeleton variant="text" sx={{ fontSize: '1.5rem' }} />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Skeleton variant="rectangular" width={80} height={32} />
                    <Skeleton variant="rectangular" width={80} height={32} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" component="h2">
          Content Approval Queue
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </Box>

      {/* Summary */}
      <Box mb={3}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            color="warning"
            label={`${pendingItems?.length || 0} pending approval`}
          />
          {filteredContent.length < (pendingItems?.length || 0) && (
            <Chip
              color="info"
              label={`${filteredContent.length} filtered results`}
            />
          )}
        </Stack>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by title or description..."
                value={filters.searchQuery}
                onChange={e =>
                  handleFilterChange('searchQuery', e.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Content Type</InputLabel>
                <Select
                  value={filters.type}
                  label="Content Type"
                  onChange={e => handleFilterChange('type', e.target.value)}
                >
                  {contentTypeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Submitted</InputLabel>
                <Select
                  value={filters.dateRange}
                  label="Submitted"
                  onChange={e =>
                    handleFilterChange('dateRange', e.target.value)
                  }
                >
                  {dateRangeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Content Grid */}
      {filteredContent.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Pending Content
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {pendingItems?.length === 0
                ? 'All content has been reviewed. Great job!'
                : 'No content matches your current filters.'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedContent.map((content: DisplayContent) => (
              <Grid item xs={12} md={6} lg={4} key={content.id}>
                <Box position="relative">
                  {isProcessing === content.id && (
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      bgcolor="rgba(255, 255, 255, 0.8)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      zIndex={10}
                      sx={{ borderRadius: 1 }}
                    >
                      <CircularProgress />
                    </Box>
                  )}
                  <ContentCard
                    content={content}
                    variant="approval"
                    onApprove={handleApprove}
                    onReject={handleReject}
                    currentUserId={currentUserId}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ApprovalQueue;
