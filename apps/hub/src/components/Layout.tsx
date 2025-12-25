import React, { useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
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
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home,
  Person,
  Mosque,
  Logout,
  Settings,
  Notifications,
  AccountCircle,
  ChevronLeft,
  ChevronRight,
  Add,
  ViewList,
  Tv,
} from "@mui/icons-material";
import {
  useUser,
  useProfile,
  useAuthActions,
  usePermissions,
  UserRole,
} from "@masjid-suite/auth";

// Navigation item type
interface NavigationItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  roles?: UserRole[];
  badge?: number;
}
import { useTranslation } from "@masjid-suite/i18n";

import { Footer } from "./Footer";

const drawerWidth = 240;

/**
 * Main layout component with simple header navigation
 */
function Layout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useUser();
  const profile = useProfile();
  const permissions = usePermissions();
  const { signOut } = useAuthActions();
  const { t } = useTranslation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [profileMenuAnchor, setProfileMenuAnchor] =
    useState<null | HTMLElement>(null);

  // Navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    const items: NavigationItem[] = [
      {
        text: t("nav.home"),
        icon: <Home />,
        path: "/",
        roles: ["public-user", "local-admin", "masjid-admin", "super-admin"],
      },
      {
        text: t("nav.masjids"),
        icon: <Mosque />,
        path: "/masjids",
        roles: ["public-user", "local-admin", "masjid-admin", "super-admin"],
      },
    ];

    // Add user-specific items
    if (user) {
      items.push(
        {
          text: t("nav.my_profile"),
          icon: <Person />,
          path: "/profile",
          roles: ["local-admin", "masjid-admin", "super-admin"],
        },
        {
          text: t("nav.create_content"),
          icon: <Add />,
          path: "/content/create",
          roles: ["local-admin", "masjid-admin", "super-admin"],
        },
        {
          text: t("nav.my_content"),
          icon: <ViewList />,
          path: "/content/my-content",
          roles: ["local-admin", "masjid-admin", "super-admin"],
        }
      );
    }

    // Add admin-specific items
    if (permissions.isSuperAdmin() || permissions.isMasjidAdmin()) {
      items.push({
        text: t("nav.manage_displays"),
        icon: <Tv />,
        path: "/admin/display-management",
        roles: ["masjid-admin", "super-admin"],
      });
    }

    return items.filter(
      (item) =>
        !item.roles ||
        item.roles.some((role: UserRole) => permissions.hasRole(role))
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
    try {
      handleProfileMenuClose();
      console.log("Signing out user...");

      // Set a timeout to ensure UI responds even if signOut hangs
      const signOutTimeout = setTimeout(() => {
        console.warn("Sign out taking too long, forcing navigation");
        navigate("/auth/signin", { replace: true });
      }, 3000); // 3 second timeout

      await signOut();
      clearTimeout(signOutTimeout);

      // Always navigate to signin after logout, regardless of current route
      navigate("/auth/signin", { replace: true });
    } catch (error) {
      console.error("Sign out failed:", error);
      // Still try to navigate to signin even if signOut fails
      navigate("/auth/signin", { replace: true });
    }
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
        <Box
          component="img"
          src="/emasjid-500x500.png"
          alt="Open E Masjid Logo"
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            mr: 2,
          }}
        />
        {drawerOpen && (
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: "bold", color: "text.primary" }}
          >
            Open E Masjid
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
                color: "text.primary",
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "inherit",
                  },
                  "& .MuiListItemText-primary": {
                    color: "inherit",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: drawerOpen ? 56 : "auto",
                  mr: drawerOpen ? 0 : "auto",
                  color: "inherit",
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
              {drawerOpen && (
                <ListItemText
                  primary={item.text}
                  sx={{ "& .MuiListItemText-primary": { color: "inherit" } }}
                />
              )}
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
                  color: "text.primary",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: drawerOpen ? 56 : "auto",
                    mr: drawerOpen ? 0 : "auto",
                    color: "inherit",
                  }}
                >
                  <Settings />
                </ListItemIcon>
                {drawerOpen && (
                  <ListItemText
                    primary="Settings"
                    sx={{ "& .MuiListItemText-primary": { color: "inherit" } }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          </List>
        </>
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
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
            {location.pathname === "/admin/display-management" &&
              "Display Management"}
            {location.pathname === "/content/create" && "Create Content"}
            {location.pathname === "/content/my-content" && "My Content"}
            {location.pathname.startsWith("/masjids/") && "Masjid Details"}
            {location.pathname.startsWith("/auth/") && "Authentication"}
          </Typography>

          {/* Right side actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Notifications */}
            {user && (
              <Tooltip title={t("nav.notifications")}>
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
                <Tooltip title={t("nav.settings")}>
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
                    {t("nav.my_profile")}
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
                    {t("nav.settings")}
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleSignOut}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    {t("nav.logout")}
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
                    {t("auth.login")}
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
                    {t("auth.register")}
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
              bgcolor: "background.paper",
              color: "text.primary",
            },
            "& .MuiListItemText-primary": {
              color: "text.primary",
            },
            "& .MuiListItemIcon-root": {
              color: "text.primary",
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
              bgcolor: "background.paper",
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
          bgcolor: "background.default",
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </Box>
  );
}

export default Layout;
