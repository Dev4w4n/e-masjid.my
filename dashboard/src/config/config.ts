// Helper function to extract the subdomain or return "development" for localhost
const getSubdomain = () => {
  const { hostname } = window.location
  if (hostname === 'localhost') return 'development'

  const parts = hostname.split('.')
  return parts.length >= 3 ? parts[0] : null
}
const dynamicSubdomain = getSubdomain()

const isDevelopment = process.env.REACT_APP_ENV === 'development'

const getBuildVersion = () => {
  if (isDevelopment) {
    return process.env.REACT_APP_BUILD_VERSION
  } else {
    return window?._env_?.REACT_APP_BUILD_VERSION
  }
}
const BUILD_VERSION = getBuildVersion()

const DOMAIN = isDevelopment ? process.env.REACT_APP_DOMAIN : window?._env_?.REACT_APP_DOMAIN
const KEYCLOAK_URL = isDevelopment
  ? process.env.REACT_APP_KEYCLOAK_BASE_URL
  : window?._env_?.REACT_APP_KEYCLOAK_BASE_URL

const docker = {
  version: {
    BUILD: BUILD_VERSION || 'v2.0.0', // Default to v2.0.0 if not provided
  },
  url: {
    USE_KEYCLOAK: true,
    KEYCLOAK_BASE_URL: `${KEYCLOAK_URL}`,
    KEYCLOAK_REALM: dynamicSubdomain,
    KEYCLOAK_CLIENT_ID: `${dynamicSubdomain}-auth`,
    LOGOUT_URL: `https://${dynamicSubdomain}.${DOMAIN}/web`,
    KHAIRAT_API_BASE_URL: `https://${dynamicSubdomain}.${DOMAIN}/secure`,
    TABUNG_API_BASE_URL: `https://${dynamicSubdomain}.${DOMAIN}/secure`,
    CADANGAN_API_BASE_URL: `https://${dynamicSubdomain}.${DOMAIN}/secure`,
    TETAPAN_API_BASE_URL: `https://${dynamicSubdomain}.${DOMAIN}/secure`,
    PETI_CADANGAN_URL: `https://${dynamicSubdomain}.${DOMAIN}/web#/cadangan`,
  },
}

const development = {
  version: {
    BUILD: BUILD_VERSION || 'v2.0.0',
  },
  url: {
    USE_KEYCLOAK: false,
    KEYCLOAK_BASE_URL: 'http://localhost:8080',
    KEYCLOAK_REALM: 'dev',
    KEYCLOAK_CLIENT_ID: 'dev-auth',
    LOGOUT_URL: 'http://localhost:3001',
    KHAIRAT_API_BASE_URL: 'http://localhost:8081',
    TABUNG_API_BASE_URL: 'http://localhost:8082',
    CADANGAN_API_BASE_URL: 'http://localhost:8083',
    TETAPAN_API_BASE_URL: 'http://localhost:8085',
    PETI_CADANGAN_URL: 'https://localhost:3001/web#/cadangan',
  },
}

if (!BUILD_VERSION) {
  console.warn('Warning: BUILD_VERSION is not defined. Using default value v2.0.0.')
}
console.log('isDevelopment:', isDevelopment)
console.log('BUILD_VERSION:', BUILD_VERSION)
console.log('dynamicSubdomain:', dynamicSubdomain)
console.log('DOMAIN:', DOMAIN)
console.log('KEYCLOAK_URL:', KEYCLOAK_URL)
console.log('process.env.REACT_APP_ENV:', process.env.REACT_APP_ENV)
console.log('process.env.REACT_APP_DOMAIN:', process.env.REACT_APP_DOMAIN)
console.log('process.env.REACT_APP_KEYCLOAK_BASE_URL:', process.env.REACT_APP_KEYCLOAK_BASE_URL)
console.log('window?._env_?.REACT_APP_DOMAIN:', window?._env_?.REACT_APP_DOMAIN)
console.log('window?._env_?.REACT_APP_BUILD_VERSION:', window?._env_?.REACT_APP_BUILD_VERSION)
console.log(
  'window?._env_?.REACT_APP_KEYCLOAK_BASE_URL:',
  window?._env_?.REACT_APP_KEYCLOAK_BASE_URL,
)

// Export the final configuration based on the environment
// If subdomain is 'localhost', it will always return development
export const config =
  dynamicSubdomain === 'development' || process.env.REACT_APP_ENV === 'development'
    ? development
    : docker
