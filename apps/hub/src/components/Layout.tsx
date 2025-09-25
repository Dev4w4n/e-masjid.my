import React, { useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Avatar,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home,
  Person,
  Mosque,
  AdminPanelSettings,
  Assignment,
  Dashboard,
  Logout,
  Settings,
  Notifications,
  AccountCircle,
  ChevronLeft,
  ChevronRight,
  ContentPaste as ContentIcon,
} from "@mui/icons-material";
import { useAuth, usePermissions } from "@masjid-suite/auth";
import { useApprovalNotifications } from "@masjid-suite/content-management";

const drawerWidth = 240;

interface NavigationItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  roles?: Array<"public" | "registered" | "masjid_admin" | "super_admin">;
  badge?: number;
}

/**
 * Main layout component with responsive navigation
 */
function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const permissions = usePermissions();

  // Real-time approval notifications for admins
  const userMasjidIds = ["test-masjid"]; // TODO: Get from user profile/permissions
  const { pendingCount } = useApprovalNotifications(
    permissions.isSuperAdmin() ? userMasjidIds : []
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [profileMenuAnchor, setProfileMenuAnchor] =
    useState<null | HTMLElement>(null);

  // Navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    const items: NavigationItem[] = [
      {
        text: "Home",
        icon: <Home />,
        path: "/",
        roles: ["public", "registered", "masjid_admin", "super_admin"],
      },
      {
        text: "Masjids",
        icon: <Mosque />,
        path: "/masjids",
        roles: ["public", "registered", "masjid_admin", "super_admin"],
      },
    ];

    // Add user-specific items
    if (user) {
      items.push(
        {
          text: "My Profile",
          icon: <Person />,
          path: "/profile",
          roles: ["registered", "masjid_admin", "super_admin"],
        },
        {
          text: "My Content",
          icon: <ContentIcon />,
          path: "/content/my-content",
          roles: ["registered", "masjid_admin", "super_admin"],
        }
      );
    }

    // Add admin-specific items
    if (permissions.isSuperAdmin()) {
      items.push(
        {
          text: "Admin Dashboard",
          icon: <Dashboard />,
          path: "/admin",
          roles: ["super_admin"],
        },
        {
          text: "Applications",
          icon: <Assignment />,
          path: "/admin/applications",
          roles: ["super_admin"],
          badge: 8, // Mock badge count
        },
        {
          text: "Content Approvals",
          icon: <Assignment />,
          path: "/admin/approvals",
          roles: ["super_admin"],
          ...(pendingCount > 0 && { badge: pendingCount }), // Only include badge if > 0
        },
        {
          text: "Display Settings",
          icon: <Settings />,
          path: "/admin/display-settings",
          roles: ["super_admin"],
        }
      );
    }

    return items.filter(
      (item) =>
        !item.roles || item.roles.some((role) => permissions.hasRole(role))
    );
  };

  const navigationItems = getNavigationItems();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerToggleDesktop = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleSignOut = async () => {
    handleProfileMenuClose();
    await signOut();
    navigate("/auth/signin");
  };

  const isActivePath = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const drawer = (
    <Box>
      {/* Logo/Brand */}
      <Toolbar sx={{ px: 3 }}>
        <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
          <Mosque />
        </Avatar>
        {drawerOpen && (
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: "bold" }}
          >
            E-Masjid
          </Typography>
        )}
      </Toolbar>

      <Divider />

      {/* Navigation Items */}
      <List sx={{ px: 1 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={isActivePath(item.path)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                mx: 1,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "inherit",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: drawerOpen ? 56 : "auto",
                  mr: drawerOpen ? 0 : "auto",
                }}
              >
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              {drawerOpen && <ListItemText primary={item.text} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Bottom section for settings */}
      {user && (
        <>
          <Box sx={{ flexGrow: 1 }} />
          <Divider />
          <List sx={{ px: 1 }}>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/settings"
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  my: 1,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: drawerOpen ? 56 : "auto",
                    mr: drawerOpen ? 0 : "auto",
                  }}
                >
                  <Settings />
                </ListItemIcon>
                {drawerOpen && <ListItemText primary="Settings" />}
              </ListItemButton>
            </ListItem>
          </List>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerOpen ? drawerWidth : 64}px)` },
          ml: { md: `${drawerOpen ? drawerWidth : 64}px` },
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          {/* Mobile menu button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Desktop drawer toggle */}
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggleDesktop}
            sx={{ mr: 2, display: { xs: "none", md: "block" } }}
          >
            {drawerOpen ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>

          {/* Page title - could be dynamic based on route */}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {location.pathname === "/" && "Dashboard"}
            {location.pathname === "/masjids" && "Masjids"}
            {location.pathname === "/profile" && "My Profile"}
            {location.pathname === "/admin" && "Admin Dashboard"}
            {location.pathname === "/admin/applications" && "Applications"}
            {location.pathname.startsWith("/masjids/") && "Masjid Details"}
            {location.pathname.startsWith("/auth/") && "Authentication"}
          </Typography>

          {/* Right side actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Notifications */}
            {user && (
              <Tooltip title="Notifications">
                <IconButton color="inherit">
                  <Badge badgeContent={3} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            {/* User Profile */}
            {user ? (
              <>
                <Tooltip title="Account settings">
                  <IconButton
                    onClick={handleProfileMenuOpen}
                    size="small"
                    sx={{ ml: 2 }}
                    aria-controls={
                      profileMenuAnchor ? "account-menu" : undefined
                    }
                    aria-haspopup="true"
                    aria-expanded={profileMenuAnchor ? "true" : undefined}
                  >
                    <Avatar
                      sx={{ width: 32, height: 32 }}
                      {...(profile?.avatar_url && { src: profile.avatar_url })}
                    >
                      {user.email?.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={profileMenuAnchor}
                  id="account-menu"
                  open={Boolean(profileMenuAnchor)}
                  onClose={handleProfileMenuClose}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuItem
                    onClick={() => {
                      handleProfileMenuClose();
                      navigate("/profile");
                    }}
                  >
                    <ListItemIcon>
                      <AccountCircle fontSize="small" />
                    </ListItemIcon>
                    My Profile
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleProfileMenuClose();
                      navigate("/settings");
                    }}
                  >
                    <ListItemIcon>
                      <Settings fontSize="small" />
                    </ListItemIcon>
                    Settings
                  </MenuItem>
                  {permissions.isSuperAdmin() && (
                    <MenuItem
                      onClick={() => {
                        handleProfileMenuClose();
                        navigate("/admin");
                      }}
                    >
                      <ListItemIcon>
                        <AdminPanelSettings fontSize="small" />
                      </ListItemIcon>
                      Admin Dashboard
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem onClick={handleSignOut}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    Sign Out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Link to="/auth/signin" style={{ textDecoration: "none" }}>
                  <Typography
                    component="button"
                    sx={{
                      color: "inherit",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Sign In
                  </Typography>
                </Link>
                <Typography color="inherit">|</Typography>
                <Link to="/auth/signup" style={{ textDecoration: "none" }}>
                  <Typography
                    component="button"
                    sx={{
                      color: "inherit",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Sign Up
                  </Typography>
                </Link>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{
          width: { md: drawerOpen ? drawerWidth : 64 },
          flexShrink: { md: 0 },
        }}
        aria-label="navigation"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerOpen ? drawerWidth : 64,
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: "hidden",
            },
          }}
          open={drawerOpen}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerOpen ? drawerWidth : 64}px)` },
          minHeight: "100vh",
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;
