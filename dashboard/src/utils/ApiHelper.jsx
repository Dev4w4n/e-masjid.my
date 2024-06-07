import axios from 'axios'

import { keycloak } from '@/utils/Keycloak'

// Create an Axios instance
const axiosInstance = axios.create()

// Add a request interceptor to append headers
axiosInstance.interceptors.request.use(
  function (config) {
    config.headers['Authorization'] = keycloak.token ? `Bearer ${keycloak.token}` : 'no-token'
    return config
  },
  function (error) {
    return Promise.reject(error)
  },
)

export { axiosInstance }
