import { Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
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
 * Auth Route wrapper component - redirects authenticated users away from auth pages
 */
interface AuthRouteProps {
  children: React.ReactNode;
}

function AuthRoute({ children }: AuthRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
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

  // If user is already authenticated, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

/**
 * Protected Route wrapper component
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
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
}

/**
 * Main App component with authentication and routing
 */
function App() {
  const { loading } = useAuth();

  // Show loading spinner while checking authentication state
  if (loading) {
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
          <AuthRoute>
            <SignIn />
          </AuthRoute>
        }
      />
      <Route
        path="/auth/signup"
        element={
          <AuthRoute>
            <SignUp />
          </AuthRoute>
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
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/applications"
          element={
            <ProtectedRoute>
              <AdminApplications />
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
