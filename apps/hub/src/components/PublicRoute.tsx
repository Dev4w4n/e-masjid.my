import { Navigate } from "react-router-dom";
import { useAuthStatus } from "@masjid-suite/auth";

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const status = useAuthStatus();

  if (status === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
