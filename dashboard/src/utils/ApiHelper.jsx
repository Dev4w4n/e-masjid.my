import axios from 'axios'
import { keycloak } from '@/utils/Keycloak'

// Create an Axios instance
const axiosInstance = axios.create()

// Add a request interceptor to append headers
axiosInstance.interceptors.request.use(
  function (config) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    config.headers['Bearer'] = keycloak.token ? keycloak.token : 'no-token'
    return config
  },
  function (error) {
    return Promise.reject(error)
  },
)

export { axiosInstance }
