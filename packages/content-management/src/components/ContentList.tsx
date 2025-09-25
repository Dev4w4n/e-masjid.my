/**
 * ContentList Component
 *
 * Component for listing and managing user's submitted content
 * with filtering, status tracking, and content actions.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Alert,
  Avatar,
  Stack,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as FileCopyIcon,
  Visibility as VisibilityIcon,
  Clear as ClearIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Schedule as ScheduleIcon,
  Image as ImageIcon,
  VideoLibrary as VideoLibraryIcon,
  Article as ArticleIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

import type { DisplayContent, ContentStatus } from '../types/content.js';

// Placeholder helper functions - to be implemented later
const getContentUrl = (content: DisplayContent) => content.url;
const getContentThumbnail = (type: string, url: string) => {
  // Return placeholder thumbnails based on content type
  switch (type) {
    case 'image':
      return url;
    case 'youtube':
      return `https://img.youtube.com/vi/${url.split('/').pop()}/maxresdefault.jpg`;
    default:
      return undefined;
  }
};

// Content list filters interface
interface ContentListFilters {
  status?: ContentStatus[];
  content_type?: string[];
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  search?: string;
}

// Props interface
interface ContentListProps {
  content: DisplayContent[];
  masjidId: string;
  loading?: boolean;
  error?: string | null;
  // Callback functions
  onCreate?: () => void;
  onEdit?: (content: DisplayContent) => void;
  onDelete?: (content: DisplayContent) => void;
  onDuplicate?: (content: DisplayContent) => void;
  onView?: (content: DisplayContent) => void;
  onRefresh?: () => void;
  onFilterChange?: (filters: ContentListFilters) => void;
}

export const ContentList: React.FC<ContentListProps> = ({
  content,
  masjidId,
  loading = false,
  error = null,
  onCreate,
  onEdit,
  onDelete,
  onDuplicate,
  onView,
  onRefresh,
  onFilterChange,
}) => {
  // State management
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedContent, setSelectedContent] = useState<DisplayContent | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<ContentListFilters>({
    status: [],
    content_type: [],
    dateRange: { start: null, end: null },
    search: '',
  });

  const [filteredContent, setFilteredContent] =
    useState<DisplayContent[]>(content);

  // Filter content based on current filters
  useEffect(() => {
    let filtered = [...content];

    // Status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(item => filters.status!.includes(item.status));
    }

    // Content type filter
    if (filters.content_type && filters.content_type.length > 0) {
      filtered = filtered.filter(item =>
        filters.content_type!.includes(item.type)
      );
    }

    // Date range filter
    if (filters.dateRange?.start || filters.dateRange?.end) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.created_at || '');
        if (filters.dateRange!.start && itemDate < filters.dateRange!.start) {
          return false;
        }
        if (filters.dateRange!.end && itemDate > filters.dateRange!.end) {
          return false;
        }
        return true;
      });
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.title.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredContent(filtered);
    onFilterChange?.(filters);
  }, [content, filters, onFilterChange]);

  // Menu handlers
  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    content: DisplayContent
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedContent(content);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedContent(null);
  };

  // Action handlers
  const handleAction = (action: string) => {
    if (!selectedContent) return;

    switch (action) {
      case 'view':
        onView?.(selectedContent);
        break;
      case 'edit':
        onEdit?.(selectedContent);
        break;
      case 'duplicate':
        onDuplicate?.(selectedContent);
        break;
      case 'delete':
        setDeleteDialogOpen(true);
        break;
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedContent) {
      onDelete?.(selectedContent);
    }
    setDeleteDialogOpen(false);
    setSelectedContent(null);
  };

  // Status color mapping
  const getStatusColor = (status: ContentStatus) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'active':
        return 'success';
      case 'expired':
        return 'default';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  // Status icon mapping
  const getStatusIcon = (status: ContentStatus) => {
    switch (status) {
      case 'pending':
        return <PendingIcon />;
      case 'active':
        return <CheckCircleIcon />;
      case 'expired':
        return <ScheduleIcon />;
      case 'rejected':
        return <CancelIcon />;
      default:
        return <PendingIcon />;
    }
  };

  // Content type icon mapping
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon />;
      case 'youtube':
        return <VideoLibraryIcon />;
      case 'text_announcement':
        return <ArticleIcon />;
      case 'event_poster':
        return <EventIcon />;
      default:
        return <ArticleIcon />;
    }
  };

  // Get available content types from data
  const availableContentTypes = React.useMemo(() => {
    const types = new Set(content.map(item => item.type));
    return Array.from(types);
  }, [content]);

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter dialog handlers
  const handleFilterOpen = () => {
    setFilterDialogOpen(true);
  };

  const handleFilterClose = () => {
    setFilterDialogOpen(false);
  };

  const handleFilterReset = () => {
    setFilters({
      status: [],
      content_type: [],
      dateRange: { start: null, end: null },
      search: '',
    });
  };

  const handleFilterApply = () => {
    handleFilterClose();
  };

  // Loading skeleton
  if (loading) {
    return (
      <Card>
        <CardHeader title={<Skeleton width={200} />} />
        <CardContent>
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} height={60} style={{ marginBottom: 8 }} />
          ))}
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert
            severity="error"
            action={<Button onClick={onRefresh}>Retry</Button>}
          >
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const paginatedContent = filteredContent.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Card>
        <CardHeader
          title="Content Management"
          subheader={`${filteredContent.length} of ${content.length} items`}
          action={
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={handleFilterOpen}
                {...(Object.values(filters).some(value =>
                  Array.isArray(value) ? value.length > 0 : Boolean(value)
                ) && { color: 'primary' })}
              >
                Filter
              </Button>
              <IconButton onClick={onRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onCreate}
              >
                Add Content
              </Button>
            </Stack>
          }
        />

        <CardContent>
          {/* Search bar */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search content..."
              value={filters.search || ''}
              onChange={e =>
                setFilters(prev => ({ ...prev, search: e.target.value }))
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: filters.search && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setFilters(prev => ({ ...prev, search: '' }))
                      }
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Content table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Content</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Display Period</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedContent.map(item => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          alt={item.title}
                          variant="rounded"
                          sx={{ width: 56, height: 40 }}
                        >
                          {getContentTypeIcon(item.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" noWrap>
                            {item.title}
                          </Typography>
                          {item.description && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              {item.description.substring(0, 50)}
                              {item.description.length > 50 && '...'}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={getContentTypeIcon(item.type)}
                        label={item.type.replace('_', ' ')}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={getStatusIcon(item.status)}
                        label={item.status}
                        color={getStatusColor(item.status)}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {item.created_at
                          ? format(new Date(item.created_at), 'dd/MM/yyyy')
                          : '-'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.created_at
                          ? format(new Date(item.created_at), 'HH:mm')
                          : '-'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(item.start_date), 'dd/MM/yyyy')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        to {format(new Date(item.end_date), 'dd/MM/yyyy')}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <IconButton
                        onClick={e => handleMenuClick(e, item)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredContent.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('view')}>
          <ListItemIcon>
            <VisibilityIcon />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => handleAction('edit')}
          disabled={selectedContent?.status !== 'pending'}
        >
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleAction('duplicate')}>
          <ListItemIcon>
            <FileCopyIcon />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => handleAction('delete')}
          disabled={selectedContent?.status === 'active'}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Content</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedContent?.title}"? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={handleFilterClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filter Content</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Status Filter */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  multiple
                  value={filters.status || []}
                  onChange={e =>
                    setFilters(prev => ({
                      ...prev,
                      status: e.target.value as ContentStatus[],
                    }))
                  }
                  label="Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Content Type Filter */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Content Type</InputLabel>
                <Select
                  multiple
                  value={filters.content_type || []}
                  onChange={e =>
                    setFilters(prev => ({
                      ...prev,
                      content_type: e.target.value as string[],
                    }))
                  }
                  label="Content Type"
                >
                  {availableContentTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFilterReset}>Reset</Button>
          <Button onClick={handleFilterClose}>Cancel</Button>
          <Button onClick={handleFilterApply} variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentList;
