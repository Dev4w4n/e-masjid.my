import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Collapse,
  Typography,
} from "@mui/material";
import {
  Dashboard,
  AccountCircle,
  Mosque,
  People,
  Settings,
  ExpandLess,
  ExpandMore,
  AdminPanelSettings,
  PersonAdd,
  Business,
} from "@mui/icons-material";
import { useProfile, usePermissions } from "@masjid-suite/auth";

interface SidebarProps {
  open: boolean;
  onClose?: () => void;
  width?: number;
}

interface NavItem {
  text: string;
  icon: React.ReactElement;
  path?: string;
  onClick?: () => void;
  children?: NavItem[];
  requiredRole?: "super_admin" | "masjid_admin" | "community_member";
}

export function Sidebar({ open, onClose, width = 280 }: SidebarProps) {
  const profile = useProfile();
  const { isSuperAdmin, isMasjidAdmin, hasAdminPrivileges } = usePermissions();

  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleItemExpand = (itemText: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemText)
        ? prev.filter((item) => item !== itemText)
        : [...prev, itemText]
    );
  };

  const navigationItems: NavItem[] = [
    {
      text: "Dashboard",
      icon: <Dashboard />,
      path: "/dashboard",
    },
    {
      text: "Profile",
      icon: <AccountCircle />,
      path: "/profile",
    },
    ...(hasAdminPrivileges()
      ? [
          {
            text: "Administration",
            icon: <AdminPanelSettings />,
            children: [
              ...(isSuperAdmin()
                ? [
                    {
                      text: "Manage Masjids",
                      icon: <Mosque />,
                      path: "/admin/masjids",
                    },
                    {
                      text: "Manage Users",
                      icon: <People />,
                      path: "/admin/users",
                    },
                    {
                      text: "System Settings",
                      icon: <Settings />,
                      path: "/admin/settings",
                    },
                  ]
                : []),
              ...(isMasjidAdmin()
                ? [
                    {
                      text: "My Masjid",
                      icon: <Business />,
                      path: "/admin/my-masjid",
                    },
                    {
                      text: "Members",
                      icon: <PersonAdd />,
                      path: "/admin/members",
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
    {
      text: "Settings",
      icon: <Settings />,
      path: "/settings",
    },
  ];

  const hasPermission = (item: NavItem): boolean => {
    if (!item.requiredRole) return true;

    switch (item.requiredRole) {
      case "super_admin":
        return isSuperAdmin();
      case "masjid_admin":
        return isMasjidAdmin();
      case "community_member":
        return profile?.role !== "public-user" && profile?.role !== undefined;
      default:
        return true;
    }
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    if (!hasPermission(item)) return null;

    const isExpanded = expandedItems.includes(item.text);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <React.Fragment key={item.text}>
        <ListItem disablePadding sx={{ pl: level * 2 }}>
          <ListItemButton
            onClick={() => {
              if (hasChildren) {
                handleItemExpand(item.text);
              } else if (item.onClick) {
                item.onClick();
              } else if (item.path) {
                // Navigate to path (would be handled by router)
                console.log("Navigate to:", item.path);
                if (onClose) onClose();
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
            {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map((child) => renderNavItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerContent = (
    <Box
      sx={{ width, height: "100%", display: "flex", flexDirection: "column" }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Masjid Suite
        </Typography>
        {profile && (
          <Typography variant="body2" color="text.secondary">
            {profile.full_name}
          </Typography>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <List>{navigationItems.map((item) => renderNavItem(item))}</List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        <Typography variant="caption" color="text.secondary">
          Masjid Suite v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant="temporary"
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        "& .MuiDrawer-paper": {
          width,
          boxSizing: "border-box",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
