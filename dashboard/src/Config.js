const prod = {
  url: {
    KHAIRAT_API_BASE_URL: 'https://www.e-masjid.my/api',
    TABUNG_API_BASE_URL: 'https://www.e-masjid.my/api',
    CADANGAN_API_BASE_URL: 'https://www.e-masjid.my/api',
    LOGOUT_URL: 'https://www.e-masjid.my/web',
  },
}

const dev = {
  url: {
    KHAIRAT_API_BASE_URL: 'http://localhost:8081',
    TABUNG_API_BASE_URL: 'http://localhost:8082',
    CADANGAN_API_BASE_URL: 'http://localhost:8083',
    LOGOUT_URL: 'http://localhost:3001',
  },
}

export const config = process.env.REACT_APP_ENV === 'development' ? dev : prod
