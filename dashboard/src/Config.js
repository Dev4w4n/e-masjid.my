const prod = {
  version: {
    BUILD: 'v1.3-beta.1',
  },
  url: {
    KHAIRAT_API_BASE_URL: 'https://www.e-masjid.my/api',
    TABUNG_API_BASE_URL: 'https://www.e-masjid.my/api',
    CADANGAN_API_BASE_URL: 'https://www.e-masjid.my/api',
    TETAPAN_API_BASE_URL: 'https://www.e-masjid.my/api',
    LOGOUT_URL: 'https://www.e-masjid.my/web',
  },
}

const dev = {
  version: {
    BUILD: 'v1.3-beta.1',
  },
  url: {
    KHAIRAT_API_BASE_URL: 'http://localhost:8081',
    TABUNG_API_BASE_URL: 'http://localhost:8082',
    CADANGAN_API_BASE_URL: 'http://localhost:8083',
    TETAPAN_API_BASE_URL: 'http://localhost:8085',
    LOGOUT_URL: 'http://localhost:3001',
  },
}

export const config = process.env.REACT_APP_ENV === 'development' ? dev : prod
