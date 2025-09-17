import { Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "@masjid-suite/auth";
import Layout from "./components/Layout";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Profile from "./pages/profile/Profile";
import ProfileView from "./pages/profile/ProfileView";
import MasjidList from "./pages/masjid/MasjidList";
import MasjidForm from "./pages/masjid/MasjidForm";
import MasjidView from "./pages/masjid/MasjidView";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Home from "./pages/Home";

/**
 * Loading component for authentication state
 */
function LoadingScreen() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress size={48} />
      <Typography variant="body1" color="text.secondary">
        Loading Masjid Suite...
      </Typography>
    </Box>
  );
}

/**
 * Main application component
 */
function App() {
  const { user, loading } = useAuth();

  // Show loading screen while authentication is being determined
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Authentication routes (no layout) */}
      <Route path="/auth/signin" element={<SignIn />} />
      <Route path="/auth/signup" element={<SignUp />} />

      {/* Main application routes (with layout) */}
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<Home />} />
        <Route path="masjids" element={<MasjidList />} />
        <Route path="masjids/:id" element={<MasjidView />} />

        {/* Protected routes */}
        <Route
          path="profile"
          element={user ? <Profile /> : <Navigate to="/auth/signin" replace />}
        />
        <Route
          path="profile/view"
          element={
            user ? <ProfileView /> : <Navigate to="/auth/signin" replace />
          }
        />
        <Route
          path="masjids/new"
          element={
            user ? <MasjidForm /> : <Navigate to="/auth/signin" replace />
          }
        />
        <Route
          path="masjids/:id/edit"
          element={
            user ? <MasjidForm /> : <Navigate to="/auth/signin" replace />
          }
        />

        {/* Admin routes */}
        <Route
          path="admin"
          element={
            user ? <AdminDashboard /> : <Navigate to="/auth/signin" replace />
          }
        />
        <Route
          path="admin/applications"
          element={
            user ? (
              <AdminApplications />
            ) : (
              <Navigate to="/auth/signin" replace />
            )
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
