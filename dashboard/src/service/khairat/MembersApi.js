import axios from 'axios'
import { config } from '../../Config'
const apiServer = config.url.KHAIRAT_API_BASE_URL

export const saveMember = async (member) => {
  const response = await axios.post(`${apiServer}/members/save`, member)
  return response.data
}

export const searchMember = async (query) => {
  const response = await axios.get(`${apiServer}/members/findBy?query=${query}`)
  return response.data
}

export const searchMemberByTagId = async (id) => {
  const response = await axios.get(`${apiServer}/members/findByTag?tagId=${id}`)
  return response.data
}

export const loadMember = async (id) => {
  const response = await axios.get(`${apiServer}/members/find/${id}`)
  return response.data
}

export const getMemberCount = async () => {
  const response = await axios.get(`${apiServer}/members/count`)
  return response.data
}

export const getPaidMemberCountCurrentYear = async () => {
  const response = await axios.get(`${apiServer}/payment/totalMembersPaidForCurrentYear`)
  return response.data
}
