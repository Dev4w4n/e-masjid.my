import axios from 'axios'
import { config } from '../../Config'
const apiServer = config.url.CADANGAN_API_BASE_URL

export const saveCadangan = async (data) => {
  try {
    const response = await axios.post(`${apiServer}/cadangan`,data)
    return response.data
  } catch (error) {
    throw error;
  }
}
