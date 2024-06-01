const getSubdomain = () => {
  const parts = window.location.hostname.split('.')
  if (parts.length >= 3) {
    return parts[0]
  }
  return null
}

const subdomain = getSubdomain()
const dynamicSubdomain = subdomain === 'localhost' ? 'demo' : subdomain

const prod = {
    version: {
      BUILD: 'v2.0.0',
    },
    url: {
      KEYCLOAK_BASE_URL: 'https://loginv2.e-masjid.my',
      KEYCLOAK_REALM: dynamicSubdomain,
      KEYCLOAK_CLIENT_ID: `${dynamicSubdomain}-auth`,
      CADANGAN_API_BASE_URL: 'https://demoapi.e-masjid.my/api-public',
      TETAPAN_API_BASE_URL: 'https://demoapi.e-masjid.my/api-public',
    },
  }
  
  const dev = {
    version: {
      BUILD: 'v2.0.0',
    },
    url: {
      CADANGAN_API_BASE_URL: 'http://localhost:8084',
      TETAPAN_API_BASE_URL: 'http://localhost:8086',
    },
  }
  
  export const config = process.env.REACT_APP_ENV === 'development' ? dev : prod
  