import axios from 'axios'
import { config } from '../../Config'
const apiServer = config.url.TETAPAN_API_BASE_URL

export const getTetapanMasjid = async () => {
  try {
    const response = await axios.get(`${apiServer}/tetapan`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export const saveTetapanMasjid = async (data) => {
  try {
    const response = await axios.post(`${apiServer}/tetapan/senarai`, data)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export const getTetapanNamaMasjid = async () => {
  try {
    const response = await axios.get(`${apiServer}/tetapan/NAMA_MASJID`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}