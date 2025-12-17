import React, { useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Avatar,
  ListItemIcon,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Logout,
  Settings,
  AccountCircle,
  Home,
  Mosque,
} from "@mui/icons-material";
import { useUser, useProfile, useAuthActions } from "@masjid-suite/auth";
import { useTranslation } from "@masjid-suite/i18n";
import { Footer } from "./Footer";

/**
 * Main layout component with simple header navigation
 */
function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const user = useUser();
  const profile = useProfile();
  const { signOut } = useAuthActions();
  const { t } = useTranslation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] =
    useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleSignOut = async () => {
    try {
      handleProfileMenuClose();
      await signOut();
      navigate("/auth/signin", { replace: true });
    } catch (error) {
      console.error("Sign out failed:", error);
      navigate("/auth/signin", { replace: true });
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CssBaseline />

      {/* App Bar */}
      <AppBar position="sticky" elevation={2}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            {/* Logo */}
            <Link
              to="/"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexGrow: isMobile ? 1 : 0,
              }}
            >
              <Box
                component="img"
                src="/emasjid-500x500.png"
                alt="Open E Masjid Logo"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                }}
              />
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: "bold",
                  color: "white",
                  display: { xs: "none", sm: "block" },
                }}
              >
                Open E Masjid
              </Typography>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: "flex", gap: 2, ml: 4, flexGrow: 1 }}>
                <Button
                  component={Link}
                  to="/"
                  sx={{ color: "white" }}
                  startIcon={<Home />}
                >
                  {t("nav.home")}
                </Button>
                <Button
                  component={Link}
                  to="/masjids"
                  sx={{ color: "white" }}
                  startIcon={<Mosque />}
                >
                  {t("nav.masjids")}
                </Button>
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                sx={{ ml: "auto" }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* User Profile / Auth */}
            {user && !isMobile && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  onClick={handleProfileMenuOpen}
                  size="small"
                  aria-controls={profileMenuAnchor ? "account-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={profileMenuAnchor ? "true" : undefined}
                >
                  <Avatar
                    sx={{ width: 36, height: 36 }}
                    {...(profile?.avatar_url && { src: profile.avatar_url })}
                  >
                    {user.email?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
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
              </Box>
            )}

            {/* Auth Links for non-logged in */}
            {!user && !isMobile && (
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  component={Link}
                  to="/auth/signin"
                  sx={{ color: "white" }}
                >
                  {t("auth.login")}
                </Button>
                <Button
                  component={Link}
                  to="/auth/signup"
                  variant="outlined"
                  sx={{ color: "white", borderColor: "white" }}
                >
                  {t("auth.register")}
                </Button>
              </Box>
            )}
          </Toolbar>

          {/* Mobile Menu */}
          {mobileMenuOpen && isMobile && (
            <Box
              sx={{ py: 2, borderTop: 1, borderColor: "rgba(255,255,255,0.2)" }}
            >
              <Button
                component={Link}
                to="/"
                fullWidth
                sx={{ color: "white", justifyContent: "flex-start", mb: 1 }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.home")}
              </Button>
              <Button
                component={Link}
                to="/masjids"
                fullWidth
                sx={{ color: "white", justifyContent: "flex-start", mb: 1 }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.masjids")}
              </Button>
              {user ? (
                <>
                  <Divider
                    sx={{ my: 1, borderColor: "rgba(255,255,255,0.2)" }}
                  />
                  <Button
                    component={Link}
                    to="/profile"
                    fullWidth
                    sx={{ color: "white", justifyContent: "flex-start", mb: 1 }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("nav.my_profile")}
                  </Button>
                  <Button
                    fullWidth
                    sx={{ color: "white", justifyContent: "flex-start" }}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                  >
                    {t("nav.logout")}
                  </Button>
                </>
              ) : (
                <>
                  <Divider
                    sx={{ my: 1, borderColor: "rgba(255,255,255,0.2)" }}
                  />
                  <Button
                    component={Link}
                    to="/auth/signin"
                    fullWidth
                    sx={{ color: "white", justifyContent: "flex-start", mb: 1 }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("auth.login")}
                  </Button>
                  <Button
                    component={Link}
                    to="/auth/signup"
                    fullWidth
                    variant="outlined"
                    sx={{ color: "white", borderColor: "white" }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("auth.register")}
                  </Button>
                </>
              )}
            </Box>
          )}
        </Container>
      </AppBar>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default" }}>
        <Outlet />
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
}

export default Layout;
