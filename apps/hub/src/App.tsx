import { Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuthStatus, useUser, WithRole } from "@masjid-suite/auth";
import Layout from "./components/Layout";
import PublicRoute from "./components/PublicRoute";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Profile from "./pages/profile/Profile";
import ProfileView from "./pages/profile/ProfileView";
import MasjidList from "./pages/masjid/MasjidList";
import MasjidForm from "./pages/masjid/MasjidForm";
import MasjidView from "./pages/masjid/MasjidView";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateContent from "./pages/content/CreateContent";
import MyContent from "./pages/content/MyContent";
import DisplayManagement from "./pages/admin/DisplayManagement";
import Home from "./pages/Home";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useUser();
  const status = useAuthStatus();

  if (status === "initializing") {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  return <>{children}</>;
};

/**
 * Main App component with authentication and routing
 */
function App() {
  const status = useAuthStatus();

  if (status === "initializing") {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      {/* Authentication routes (no layout) */}
      <Route
        path="/auth/signin"
        element={
          <PublicRoute>
            <SignIn />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/signup"
        element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        }
      />

      {/* Main application routes (with layout) */}
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<Home />} />
        <Route path="masjids" element={<MasjidList />} />
        <Route path="masjids/:id" element={<MasjidView />} />

        {/* Protected routes */}
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile/view"
          element={
            <ProtectedRoute>
              <ProfileView />
            </ProtectedRoute>
          }
        />
        <Route
          path="masjids/new"
          element={
            <ProtectedRoute>
              <MasjidForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="masjids/:id/edit"
          element={
            <ProtectedRoute>
              <MasjidForm />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="admin"
          element={
            <ProtectedRoute>
              <WithRole role={["super_admin", "masjid_admin"]}>
                <AdminDashboard />
              </WithRole>
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/applications"
          element={
            <ProtectedRoute>
              <WithRole role="super_admin">
                <AdminApplications />
              </WithRole>
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/display-management"
          element={
            <ProtectedRoute>
              <WithRole role={["super_admin", "masjid_admin"]}>
                <DisplayManagement />
              </WithRole>
            </ProtectedRoute>
          }
        />

        {/* Content Management routes */}
        <Route
          path="content/create"
          element={
            <ProtectedRoute>
              <CreateContent />
            </ProtectedRoute>
          }
        />
        <Route
          path="content/my-content"
          element={
            <ProtectedRoute>
              <MyContent />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
