/**
 * ContentCard Component
 *
 * Displays content items with approval status, actions, and metadata.
 * Used in both content lists and approval queues.
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  PlayCircleOutline as PlayIcon,
  Image as ImageIcon,
  Article as TextIcon,
  Event as EventIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import type { DisplayContent } from '../types/content.js';
import {
  getContentDisplayUrl,
  generateYouTubeThumbnail,
} from '../utils/content-url-helpers.js';

interface ContentCardProps {
  content: DisplayContent;
  variant?: 'default' | 'approval' | 'management';
  onApprove?: (contentId: string, notes?: string) => void;
  onReject?: (contentId: string, reason: string) => void;
  onDelete?: (contentId: string) => void;
  onEdit?: (contentId: string) => void;
  onView?: (contentId: string) => void;
  showActions?: boolean;
  currentUserId?: string;
}

interface DialogState {
  type: 'none' | 'approve' | 'reject';
  isOpen: boolean;
  text: string;
}

const ContentCard: React.FC<ContentCardProps> = ({
  content,
  variant = 'default',
  onApprove,
  onReject,
  onDelete,
  onEdit,
  onView,
  showActions = true,
  currentUserId,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [dialog, setDialog] = React.useState<DialogState>({
    type: 'none',
    isOpen: false,
    text: '',
  });

  const isMenuOpen = Boolean(anchorEl);
  const isOwnContent = currentUserId === content.submitted_by;

  // Content type icons
  const getContentIcon = () => {
    switch (content.type) {
      case 'youtube_video':
        return <PlayIcon color="primary" />;
      case 'image':
        return <ImageIcon color="secondary" />;
      case 'text_announcement':
        return <TextIcon color="info" />;
      case 'event_poster':
        return <EventIcon color="success" />;
      default:
        return <ImageIcon />;
    }
  };

  // Status chip styling
  const getStatusChip = () => {
    const statusConfig = {
      pending: { color: 'warning' as const, label: 'Pending Approval' },
      active: { color: 'success' as const, label: 'Active' },
      rejected: { color: 'error' as const, label: 'Rejected' },
      expired: { color: 'default' as const, label: 'Expired' },
    };

    const config = statusConfig[content.status] || statusConfig.pending;
    return <Chip size="small" color={config.color} label={config.label} />;
  };

  // Handle menu actions
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuAction = (action: string) => {
    handleMenuClose();

    switch (action) {
      case 'view':
        onView?.(content.id);
        break;
      case 'edit':
        onEdit?.(content.id);
        break;
      case 'delete':
        onDelete?.(content.id);
        break;
      case 'approve':
        setDialog({ type: 'approve', isOpen: true, text: '' });
        break;
      case 'reject':
        setDialog({ type: 'reject', isOpen: true, text: '' });
        break;
    }
  };

  // Handle dialog actions
  const handleDialogClose = () => {
    setDialog({ type: 'none', isOpen: false, text: '' });
  };

  const handleDialogConfirm = () => {
    if (dialog.type === 'approve' && onApprove) {
      onApprove(content.id, dialog.text || undefined);
    } else if (dialog.type === 'reject' && onReject) {
      onReject(content.id, dialog.text);
    }
    handleDialogClose();
  };

  // Get thumbnail or placeholder
  const getThumbnailUrl = (content: DisplayContent): string | null => {
    if (content.thumbnail_url) {
      return content.thumbnail_url;
    }
    if (content.type === 'youtube_video') {
      return generateYouTubeThumbnail(content.url);
    }
    if (content.type === 'image') {
      return content.url;
    }
    return null;
  };

  const thumbnailUrl = getThumbnailUrl(content);
  const hasMedia = thumbnailUrl && content.type !== 'text_announcement';

  // Format dates
  const submittedDate = content.submitted_at
    ? formatDistanceToNow(new Date(content.submitted_at), { addSuffix: true })
    : '';

  const scheduledDate = content.start_date
    ? new Date(content.start_date).toLocaleDateString('ms-MY')
    : '';

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
        elevation={variant === 'approval' ? 3 : 1}
      >
        {/* Status badge */}
        <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
          {getStatusChip()}
        </Box>

        {/* Action menu */}
        {showActions && (
          <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
            <IconButton
              size="small"
              onClick={handleMenuClick}
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
        )}

        {/* Media section */}
        {hasMedia && (
          <CardMedia
            component="img"
            height="140"
            image={thumbnailUrl}
            alt={content.title}
            sx={{ objectFit: 'cover' }}
          />
        )}

        {/* Content info */}
        <CardContent sx={{ flexGrow: 1, pt: hasMedia ? 2 : 5 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            {getContentIcon()}
            <Typography variant="h6" component="h3" noWrap sx={{ flexGrow: 1 }}>
              {content.title}
            </Typography>
          </Box>

          {content.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {content.description}
            </Typography>
          )}

          {/* Metadata */}
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Typography variant="caption" color="text.secondary">
              Duration: {content.duration}s
            </Typography>

            {submittedDate && (
              <Typography variant="caption" color="text.secondary">
                Submitted {submittedDate}
              </Typography>
            )}

            {scheduledDate && (
              <Typography variant="caption" color="text.secondary">
                Scheduled: {scheduledDate}
              </Typography>
            )}

            {content.sponsorship_amount && content.sponsorship_amount > 0 && (
              <Typography
                variant="caption"
                color="success.main"
                fontWeight="medium"
              >
                Sponsored: RM{content.sponsorship_amount.toFixed(2)}
              </Typography>
            )}

            {content.rejection_reason && (
              <Typography variant="caption" color="error.main">
                Reason: {content.rejection_reason}
              </Typography>
            )}
          </Box>
        </CardContent>

        {/* Approval actions for approval variant */}
        {variant === 'approval' && (onApprove || onReject) && (
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button
              size="small"
              color="success"
              variant="contained"
              onClick={() =>
                setDialog({ type: 'approve', isOpen: true, text: '' })
              }
              disabled={!onApprove}
              fullWidth
            >
              Approve
            </Button>
            <Button
              size="small"
              color="error"
              variant="outlined"
              onClick={() =>
                setDialog({ type: 'reject', isOpen: true, text: '' })
              }
              disabled={!onReject}
              fullWidth
            >
              Reject
            </Button>
          </CardActions>
        )}
      </Card>

      {/* Action menu */}
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {onView && (
          <MenuItem onClick={() => handleMenuAction('view')}>
            <ViewIcon fontSize="small" sx={{ mr: 1 }} />
            View
          </MenuItem>
        )}

        {isOwnContent && content.status === 'rejected' && onEdit && (
          <MenuItem onClick={() => handleMenuAction('edit')}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit & Resubmit
          </MenuItem>
        )}

        {variant === 'approval' && content.status === 'pending' && (
          <>
            <MenuItem onClick={() => handleMenuAction('approve')}>
              <Chip size="small" color="success" label="Approve" />
            </MenuItem>
            <MenuItem onClick={() => handleMenuAction('reject')}>
              <Chip size="small" color="error" label="Reject" />
            </MenuItem>
          </>
        )}

        {isOwnContent &&
          ['pending', 'rejected'].includes(content.status) &&
          onDelete && (
            <MenuItem
              onClick={() => handleMenuAction('delete')}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          )}
      </Menu>

      {/* Approval/Rejection Dialog */}
      <Dialog
        open={dialog.isOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialog.type === 'approve' ? 'Approve Content' : 'Reject Content'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Content: <strong>{content.title}</strong>
          </Typography>

          <TextField
            autoFocus
            multiline
            rows={3}
            fullWidth
            label={
              dialog.type === 'approve'
                ? 'Approval Notes (Optional)'
                : 'Rejection Reason (Required)'
            }
            value={dialog.text}
            onChange={e =>
              setDialog(prev => ({ ...prev, text: e.target.value }))
            }
            placeholder={
              dialog.type === 'approve'
                ? 'Add any notes for the content creator...'
                : 'Please provide a clear reason for rejection...'
            }
            required={dialog.type === 'reject'}
            error={dialog.type === 'reject' && !dialog.text.trim()}
            helperText={
              dialog.type === 'reject' && !dialog.text.trim()
                ? 'Rejection reason is required'
                : ''
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleDialogConfirm}
            color={dialog.type === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={dialog.type === 'reject' && !dialog.text.trim()}
          >
            {dialog.type === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ContentCard;
