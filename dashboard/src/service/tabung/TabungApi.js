import axios from 'axios'
import { config } from '../../Config'
const apiServer = config.url.TABUNG_API_BASE_URL

export const getTabung = async () => {
  const response = await axios.get(`${apiServer}/tabung`)
  return response.data
}

export const getTabungById = async (id) => {
  const response = await axios.get(`${apiServer}/tabung/${id}`)
  return response.data
}

export const saveTabung = async (tabung) => {
  const response = await axios.post(`${apiServer}/tabung`, tabung)
  return response.data
}

export const deleteTabung = async (id) => {
  const response = await axios.delete(`${apiServer}/tabung/${id}`,)
  return response.data
}
