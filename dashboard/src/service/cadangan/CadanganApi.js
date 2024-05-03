import { axiosInstance } from '@/utils/ApiHelper'
import { config } from '@/config'
const apiServer = config.url.CADANGAN_API_BASE_URL

export const getCadangan = async () => {
  const response = await axiosInstance.get(`${apiServer}/cadangan`)
  return response.data
}

export const getCadanganById = async (id) => {
  const response = await axiosInstance.get(`${apiServer}/cadangan/${id}`)
  return response.data
}

export const getCadanganCount = async () => {
  const response = await axiosInstance.get(`${apiServer}/cadangan/count`)
  return response.data
}

export const getCadanganByType = async (page, size, cadanganTypeId, isOpen) => {
  const response = await axiosInstance.get(
    `${apiServer}/cadangan?page=${page}&size=${size}&cadanganTypeId=${cadanganTypeId}&isOpen=${isOpen}`,
  )
  return response.data
}

export const getCadanganByOpen = async (page, size, isOpen) => {
  const response = await axiosInstance.get(
    `${apiServer}/cadangan?page=${page}&size=${size}&isOpen=${isOpen}`,
  )
  return response.data
}

export const updateCadangan = async (cadangan, id) => {
  const response = await axiosInstance.put(`${apiServer}/cadangan/${id}`, cadangan)
  return response.data
}
