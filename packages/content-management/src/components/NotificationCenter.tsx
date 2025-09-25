/**
 * NotificationCenter Component
 *
 * Real-time notification display for content approval updates
 * with dismissal, navigation, and notification management.
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  Chip,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  Collapse,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  Close as CloseIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Schedule as PendingIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  MarkAsUnread as UnreadIcon,
  DoneAll as MarkAllReadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

// Mock notification type and hook for now - will be properly implemented later
interface NotificationData {
  id: string;
  type:
    | 'content_approved'
    | 'content_rejected'
    | 'content_pending'
    | 'content_updated';
  title: string;
  message: string;
  created_at: string;
  read_at?: string | null;
}

// Mock hook - will be replaced with actual implementation
const useNotifications = ({ masjidId }: { masjidId: string }) => {
  return {
    notifications: [] as NotificationData[],
    unreadCount: 0,
    isLoading: false,
    error: null as string | null,
    markAsRead: async (id: string) => {},
    markAllAsRead: async () => {},
    dismissNotification: async (id: string) => {},
    refreshNotifications: () => {},
  };
};

export interface NotificationCenterProps {
  /** Current user's masjid ID */
  masjidId: string;
  /** Optional custom positioning */
  position?: 'fixed' | 'static' | 'absolute';
  /** Maximum height for the notification panel */
  maxHeight?: number;
  /** Whether to show as dropdown or inline */
  variant?: 'dropdown' | 'inline';
  /** Custom CSS classes */
  className?: string;
  /** Callback when notification is clicked */
  onNotificationClick?: (notification: NotificationData) => void;
  /** Callback when notification is dismissed */
  onNotificationDismiss?: (notificationId: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  masjidId,
  position = 'static',
  maxHeight = 400,
  variant = 'dropdown',
  className,
  onNotificationClick,
  onNotificationDismiss,
}) => {
  // State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(true);

  // Get notifications from hook
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    refreshNotifications,
  } = useNotifications({ masjidId });

  // Filter notifications based on settings
  const filteredNotifications = showUnreadOnly
    ? notifications.filter(n => !n.read_at)
    : notifications;

  // Handle dropdown toggle
  const handleToggleDropdown = (event: React.MouseEvent<HTMLElement>) => {
    if (variant === 'dropdown') {
      setAnchorEl(anchorEl ? null : event.currentTarget);
    } else {
      setExpanded(!expanded);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setExpanded(false);
  };

  // Handle notification actions
  const handleNotificationClick = async (notification: NotificationData) => {
    // Mark as read
    if (!notification.read_at) {
      await markAsRead(notification.id);
    }

    // Call custom handler
    if (onNotificationClick) {
      onNotificationClick(notification);
    }

    // Close dropdown
    if (variant === 'dropdown') {
      handleClose();
    }
  };

  const handleDismiss = async (
    notificationId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    await dismissNotification(notificationId);

    if (onNotificationDismiss) {
      onNotificationDismiss(notificationId);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  // Get notification icon based on type
  const getNotificationIcon = (notification: NotificationData) => {
    switch (notification.type) {
      case 'content_approved':
        return <ApprovedIcon color="success" />;
      case 'content_rejected':
        return <RejectedIcon color="error" />;
      case 'content_pending':
        return <PendingIcon color="warning" />;
      case 'content_updated':
        return <InfoIcon color="info" />;
      default:
        return <NotificationIcon color="action" />;
    }
  };

  // Get notification color based on type
  const getNotificationColor = (
    notification: NotificationData
  ):
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' => {
    switch (notification.type) {
      case 'content_approved':
        return 'success';
      case 'content_rejected':
        return 'error';
      case 'content_pending':
        return 'warning';
      case 'content_updated':
        return 'info';
      default:
        return 'default';
    }
  };

  // Render notification item
  const renderNotificationItem = (notification: NotificationData) => (
    <ListItem
      key={notification.id}
      button
      onClick={() => handleNotificationClick(notification)}
      sx={{
        borderLeft: 4,
        borderLeftColor: !notification.read_at ? 'primary.main' : 'transparent',
        backgroundColor: !notification.read_at ? 'action.hover' : 'transparent',
        '&:hover': {
          backgroundColor: 'action.selected',
        },
      }}
    >
      <ListItemIcon>{getNotificationIcon(notification)}</ListItemIcon>

      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ flex: 1 }}>
              {notification.title}
            </Typography>
            <Chip
              size="small"
              label={notification.type.replace('content_', '')}
              color={getNotificationColor(notification)}
              variant="outlined"
            />
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {notification.message}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
              })}
            </Typography>
          </Box>
        }
      />

      <ListItemSecondaryAction>
        <Tooltip title="Dismiss">
          <IconButton
            edge="end"
            size="small"
            onClick={e => handleDismiss(notification.id, e)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </ListItemSecondaryAction>
    </ListItem>
  );

  // Render notification list
  const renderNotificationList = () => (
    <Box sx={{ maxHeight, overflow: 'auto' }}>
      {error && (
        <Alert severity="error" sx={{ m: 1 }}>
          {error}
        </Alert>
      )}

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {!isLoading && filteredNotifications.length === 0 && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <NotificationIcon
            sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            {showUnreadOnly ? 'No unread notifications' : 'No notifications'}
          </Typography>
        </Box>
      )}

      {filteredNotifications.length > 0 && (
        <List disablePadding>
          {filteredNotifications.map(renderNotificationItem)}
        </List>
      )}
    </Box>
  );

  // Render header actions
  const renderHeaderActions = () => (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        p: 1,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Button
        size="small"
        variant={showUnreadOnly ? 'contained' : 'outlined'}
        onClick={() => setShowUnreadOnly(!showUnreadOnly)}
        startIcon={<UnreadIcon />}
      >
        {showUnreadOnly ? 'Unread' : 'All'}
      </Button>

      {unreadCount > 0 && (
        <Button
          size="small"
          variant="outlined"
          onClick={handleMarkAllRead}
          startIcon={<MarkAllReadIcon />}
        >
          Mark All Read
        </Button>
      )}

      <Button
        size="small"
        variant="outlined"
        onClick={refreshNotifications}
        disabled={isLoading}
      >
        Refresh
      </Button>
    </Box>
  );

  // Render trigger button for dropdown variant
  const renderTrigger = () => (
    <Tooltip title="Notifications">
      <IconButton
        onClick={handleToggleDropdown}
        color="inherit"
        {...(className && { className })}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <>
        {renderTrigger()}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: {
              width: 400,
              maxHeight: maxHeight + 100, // Account for header
            },
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">Notifications</Typography>
          </Box>
          {renderHeaderActions()}
          {renderNotificationList()}
        </Menu>
      </>
    );
  }

  // Inline variant
  return (
    <Paper sx={{ position }} {...(className && { className })}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          cursor: 'pointer',
        }}
        onClick={handleToggleDropdown}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationIcon />
          </Badge>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <IconButton size="small">
          {expanded ? <CollapseIcon /> : <ExpandIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        {renderHeaderActions()}
        {renderNotificationList()}
      </Collapse>
    </Paper>
  );
};

export default NotificationCenter;
