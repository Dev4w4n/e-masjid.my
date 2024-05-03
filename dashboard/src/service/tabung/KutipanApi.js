import { config } from '@/config'
import { axiosInstance } from '@/utils/ApiHelper'

const apiServer = config.url.TABUNG_API_BASE_URL

export const getKutipanByTabung = async (id) => {
  const response = await axiosInstance.get(`${apiServer}/kutipan/tabung/${id}`)
  return response.data
}

export const getKutipanByTabungBetweenCreateDate = async (id, fromDate, toDate, page, size) => {
  const response = await axiosInstance.get(
    `${apiServer}/kutipan/tabung/${id}/betweenCreateDate?fromDate=${fromDate}&toDate=${toDate}&page=${
      page ?? 0
    }
      &size=${size ?? 0}`,
  )
  return response.data
}

export const getKutipan = async (id) => {
  const response = await axiosInstance.get(`${apiServer}/kutipan/${id}`)
  return response.data
}

export const saveKutipan = async (kutipan) => {
  const response = await axiosInstance.post(`${apiServer}/kutipan`, kutipan)
  return response.data
}

export const updateKutipan = async (id, updatedKutipanData) => {
  const response = await axiosInstance.put(`${apiServer}/kutipan/${id}`, updatedKutipanData)
  return response.data
}

export const deleteKutipan = async (id) => {
  const response = await axiosInstance.delete(`${apiServer}/kutipan/${id}`)
  return response.data
}
