import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStatus, useUser, WithRole } from "@masjid-suite/auth";
import LayoutSimple from "./components/LayoutSimple";
import PublicRoute from "./components/PublicRoute";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Profile from "./pages/profile/Profile";
import ProfileView from "./pages/profile/ProfileView";
import MasjidList from "./pages/masjid/MasjidList";
import MasjidForm from "./pages/masjid/MasjidForm";
import CreateContent from "./pages/content/CreateContent";
import MyContent from "./pages/content/MyContent";
import DisplayManagement from "./pages/admin/DisplayManagement";
import Home from "./pages/Home";

// Legacy-inspired loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50/30 to-teal-50/30">
    <div className="text-center">
      <div className="inline-block relative">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-gray-600 font-medium">Memuatkan...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useUser();
  const status = useAuthStatus();

  if (status === "initializing") {
    return <LoadingScreen />;
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
    return <LoadingScreen />;
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
      <Route path="/" element={<LayoutSimple />}>
        {/* Public routes */}
        <Route index element={<Home />} />
        <Route path="masjids" element={<MasjidList />} />
        {/* Masjid details page moved to papan-info app (/apps/papan-info/src/app/masjid/[id]/page.tsx) */}

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
