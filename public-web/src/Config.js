const prod = {
    version: {
      BUILD: 'v1.3-beta.1',
    },
    url: {
      CADANGAN_API_BASE_URL: 'https://www.e-masjid.my/api',
    },
  }
  
  const dev = {
    version: {
      BUILD: 'v1.3-beta.1',
    },
    url: {
      CADANGAN_API_BASE_URL: 'http://localhost:8083',
    },
  }
  
  export const config = process.env.REACT_APP_ENV === 'development' ? dev : prod
  