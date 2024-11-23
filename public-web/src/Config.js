// Helper function to extract the subdomain or return "development" for localhost
export const getSubdomain = () => {
  const { hostname } = window.location;
  if (hostname === "localhost") return "development";

  const parts = hostname.split(".");
  return parts.length >= 3 ? parts[0] : null;
};
export const dynamicSubdomain = getSubdomain();

const isDevelopment = process.env.REACT_APP_ENV === "development";

export const getBuildVersion = () => {
  if (isDevelopment) {
    return process.env.REACT_APP_BUILD_VERSION;
  } else {
    return window?._env_?.REACT_APP_BUILD_VERSION;
  }
  // return process.env.REACT_APP_BUILD_VERSION;
}
export const BUILD_VERSION = getBuildVersion();

export const DOMAIN = isDevelopment
  ? process.env.REACT_APP_DOMAIN
  : window?._env_?.REACT_APP_DOMAIN;

// Base configuration
const baseConfig = {
  version: {
    BUILD: BUILD_VERSION || "v2.0.0", // Default to v2.0.0 if not provided
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
    CADANGAN_API_BASE_URL: `https://${dynamicSubdomain}.${DOMAIN}/public`,
    TETAPAN_API_BASE_URL: `https://${dynamicSubdomain}.${DOMAIN}/public`,
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

if (!BUILD_VERSION) {
  console.warn("Warning: BUILD_VERSION is not defined. Using default value 'v2.0.0'.");
}
console.log("isDevelopment:", isDevelopment)
console.log("BUILD_VERSION:", BUILD_VERSION)
console.log("dynamicSubdomain:", dynamicSubdomain)
console.log("DOMAIN:", DOMAIN)
console.log("process.env.REACT_APP_ENV:", process.env.REACT_APP_ENV)
console.log("process.env.REACT_APP_DOMAIN:", process.env.REACT_APP_DOMAIN)
console.log("window?._env_?.REACT_APP_DOMAIN:", window?._env_?.REACT_APP_DOMAIN)
console.log("window?._env_?.REACT_APP_BUILD_VERSION:", window?._env_?.REACT_APP_BUILD_VERSION)

// Export the final configuration based on the environment
// If subdomain is 'localhost', it will always return development
export const config = dynamicSubdomain === "development" || process.env.REACT_APP_ENV === "development" ? development : docker;