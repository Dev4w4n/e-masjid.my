import axios from 'axios'
import { config } from '../../Config'
const apiServer = config.url.KHAIRAT_API_BASE_URL

export const getDependentsByMemberId = async (memberId) => {
  try {
    const response = await axios.get(`${apiServer}/dependents/findByMemberId/${memberId}`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export const saveDependent = async (data, memberId) => {
  try {
    const response = await axios.post(`${apiServer}/dependents/save/${memberId}`, data)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export const deleteDependent = async (id) => {
  try {
    const response = await axios.delete(`${apiServer}/dependents/delete/${id}`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}
