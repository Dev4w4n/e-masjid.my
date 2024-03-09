const prod = {
    version: {
      BUILD: 'v1.3-beta.1',
    },
    url: {
      TETAPAN_API_BASE_URL: 'https://www.e-masjid.my/api',
      CADANGAN_API_BASE_URL: 'https://www.e-masjid.my/api',
      TETAPAN_API_BASE_URL: 'https://www.e-masjid.my/api',
    },
  }
  
  const dev = {
    version: {
      BUILD: 'v1.3-beta.1',
    },
    url: {
      CADANGAN_API_BASE_URL: 'http://localhost:8084',
      TETAPAN_API_BASE_URL: 'http://localhost:8086',
    },
  }
  
  export const config = process.env.REACT_APP_ENV === 'development' ? dev : prod
  