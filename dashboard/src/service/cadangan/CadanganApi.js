import axios from 'axios'
import { config } from '../../Config'
const apiServer = config.url.CADANGAN_API_BASE_URL

export const getCadangan = async () => {
    const response = await axios.get(`${apiServer}/cadangan`)
    return response.data
}

export const updateCadangan = async (cadangan, id) => {
    const response = await axios.put(`${apiServer}/cadangan/${id}`, cadangan)
    return response.data
}