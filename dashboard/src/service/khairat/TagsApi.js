import { axiosInstance } from '@/utils/ApiHelper'
import { config } from '@/config'
const apiServer = config.url.KHAIRAT_API_BASE_URL

export const getTags = async () => {
  const response = await axiosInstance.get(`${apiServer}/tags/findAll?size=1000`)
  return response.data
}

export const saveTag = async (tag) => {
  const response = await axiosInstance.post(`${apiServer}/tags/save`, tag)
  return response.data
}

export const deleteTag = async (id) => {
  const response = await axiosInstance.delete(`${apiServer}/tags/delete/${id}`)
  return response.data
}
