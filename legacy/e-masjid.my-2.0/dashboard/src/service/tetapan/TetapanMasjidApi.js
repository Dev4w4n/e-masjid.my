import { config } from '@/config'
import { axiosInstance } from '@/utils/ApiHelper'

const apiServer = config.url.TETAPAN_API_BASE_URL

export const getTetapanMasjid = async () => {
  try {
    const response = await axiosInstance.get(`${apiServer}/tetapan`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export const saveTetapanMasjid = async (data) => {
  try {
    const response = await axiosInstance.post(`${apiServer}/tetapan/senarai`, data)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export const getTetapanNamaMasjid = async () => {
  try {
    const response = await axiosInstance.get(`${apiServer}/tetapan/NAMA_MASJID`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}
