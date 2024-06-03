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
    USE_KEYCLOAK: true,
    KEYCLOAK_BASE_URL: `https://loginv2.e-masjid.my`,
    KEYCLOAK_REALM: dynamicSubdomain,
    KEYCLOAK_CLIENT_ID: `${dynamicSubdomain}-auth`,
    LOGOUT_URL: `https://${dynamicSubdomain}.e-masjid.my/web`,
    KHAIRAT_API_BASE_URL: `https://${dynamicSubdomain}.e-masjid.my/secure`,
    TABUNG_API_BASE_URL: `https://${dynamicSubdomain}.e-masjid.my/secure`,
    CADANGAN_API_BASE_URL: `https://${dynamicSubdomain}.e-masjid.my/secure`,
    TETAPAN_API_BASE_URL: `https://${dynamicSubdomain}.e-masjid.my/secure`,
    PETI_CADANGAN_URL: `https://${dynamicSubdomain}.e-masjid.my/web#/cadangan`,
  },
}

const dev = {
  version: {
    BUILD: 'v2.0.0',
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

export const config = process.env.REACT_APP_ENV === 'development' ? dev : prod
