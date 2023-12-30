import axios from 'axios'
import { config } from '../../Config'
const apiServer = config.url.CADANGAN_API_BASE_URL

export const getCadangan = async () => {
    const response = await axios.get(`${apiServer}/cadangan`)
    return response.data
}

export const getCadanganCount = async () => {
    const response = await axios.get(`${apiServer}/cadangan/count`)
    return response.data
}

export const getCadanganByType = async (page, size, cadanganTypeId, isOpen) => {
    const response = await axios.get(`${apiServer}/cadangan?page=${page}&size=${size}&cadanganTypeId=${cadanganTypeId}&isOpen=${isOpen}`)
    return response.data
}

export const updateCadangan = async (cadangan, id) => {
    const response = await axios.put(`${apiServer}/cadangan/${id}`, cadangan)
    return response.data
}