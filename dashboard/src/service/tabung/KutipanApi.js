import axios from 'axios'
import { config } from '../../Config'
const apiServer = config.url.TABUNG_API_BASE_URL

export const getKutipanByTabung = async (id) => {
  const response = await axios.get(`${apiServer}/kutipan/tabung/${id}`)
  return response.data
}

export const getKutipanByTabungBetweenCreateDate = async (id, fromDate, toDate, page, size) => {
  const response = await axios.get(`${apiServer}/kutipan/tabung/${id}/betweenCreateDate?fromDate=${fromDate}&toDate=${toDate}&page=${page ?? 0}&size=${size ?? 0}`)
  return response.data
}

export const getKutipan = async (id) => {
  const response = await axios.get(`${apiServer}/kutipan/${id}`)
  return response.data
}

export const saveKutipan = async (kutipan) => {
  const response = await axios.post(`${apiServer}/kutipan`, kutipan)
  return response.data
}
