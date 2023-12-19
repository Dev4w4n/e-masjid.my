import axios from 'axios'
import { config } from '../../Config'
const apiServer = config.url.KHAIRAT_API_BASE_URL

export const getTags = async () => {
  const response = await axios.get(`${apiServer}/tags/findAll?size=1000`)
  return response.data
}

export const saveTag = async (tag) => {
  const response = await axios.post(`${apiServer}/tags/save`, tag)
  return response.data
}

export const deleteTag = async (id) => {
  const response = await axios.delete(`${apiServer}/tags/delete/${id}`)
  return response.data
}
