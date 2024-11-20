// Helper function to extract the subdomain or return "development" for localhost
export const getSubdomain = () => {
  const { hostname } = window.location;

  if (hostname === "localhost") return "development";

  const parts = hostname.split(".");
  return parts.length >= 3 ? parts[0] : null;
};

// Export the dynamic subdomain
export const dynamicSubdomain = getSubdomain();

// Base configuration
const baseConfig = {
  version: {
    BUILD: process.env.REACT_APP_BUILD_VERSION || "v2.0.0", // Default to v2.0.0 if not provided
  },
  url: {
    CADANGAN_API_BASE_URL: "",
    TETAPAN_API_BASE_URL: "",
  },
};

// Docker environment configuration
const docker = {
  ...baseConfig,
  url: {
    CADANGAN_API_BASE_URL: `https://${dynamicSubdomain}.${process.env.REACT_APP_DOMAIN}/public`,
    TETAPAN_API_BASE_URL: `https://${dynamicSubdomain}.${process.env.REACT_APP_DOMAIN}/public`,
  },
};

// Development environment configuration
const development = {
  ...baseConfig,
  url: {
    CADANGAN_API_BASE_URL: "http://localhost:8084",
    TETAPAN_API_BASE_URL: "http://localhost:8086",
  },
};

// Export the final configuration based on the environment
// If subdomain is 'localhost', it will always return development
export const config = dynamicSubdomain === "development" || process.env.REACT_APP_ENV === "development" ? development : docker;