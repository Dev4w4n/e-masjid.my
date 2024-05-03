import { axiosInstance } from '@/utils/ApiHelper'
import { config } from '@/config'
const apiServer = config.url.TABUNG_API_BASE_URL

export const getTabung = async () => {
  const response = await axiosInstance.get(`${apiServer}/tabung`)
  return response.data
}

export const getTabungById = async (id) => {
  const response = await axiosInstance.get(`${apiServer}/tabung/${id}`)
  return response.data
}

export const saveTabung = async (tabung) => {
  const response = await axiosInstance.post(`${apiServer}/tabung`, tabung)
  return response.data
}

export const deleteTabung = async (id) => {
  const response = await axiosInstance.delete(`${apiServer}/tabung/${id}`)
  return response.data
}
