// Helper function to extract the subdomain from the hostname
export const getSubdomain = () => {
  const parts = window.location.hostname.split(".");
  if (parts.length >= 3) {
    return parts[0];
  }
  return null;
};

// Export the dynamic subdomain
export const dynamicSubdomain = (() => {
  const subdomain = getSubdomain();
  return subdomain === "localhost" ? "development" : subdomain;
})();

// Base configuration
const baseConfig = {
  version: {
    BUILD: process.env.BUILD_VERSION || "v2.0.0", // Default to v2.0.0 if not provided
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
    CADANGAN_API_BASE_URL: `https://${dynamicSubdomain}.${process.env.DOMAIN}/public`,
    TETAPAN_API_BASE_URL: `https://${dynamicSubdomain}.${process.env.DOMAIN}/public`,
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
