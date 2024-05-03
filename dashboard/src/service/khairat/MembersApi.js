import { axiosInstance } from '@/utils/ApiHelper'
import { config } from '@/config'
const apiServer = config.url.KHAIRAT_API_BASE_URL

export const saveMember = async (member) => {
  const response = await axiosInstance.post(`${apiServer}/members/save`, member)
  return response.data
}

export const searchMember = async (query) => {
  const response = await axiosInstance.get(`${apiServer}/members/findBy?query=${query}`)
  return response.data
}

export const searchMemberByTagId = async (id) => {
  const response = await axiosInstance.get(`${apiServer}/members/findByTag?tagId=${id}`)
  return response.data
}

export const loadMember = async (id) => {
  const response = await axiosInstance.get(`${apiServer}/members/find/${id}`)
  return response.data
}

export const getMemberCount = async () => {
  const response = await axiosInstance.get(`${apiServer}/members/count`)
  return response.data
}

export const getPaidMemberCountCurrentYear = async () => {
  const response = await axiosInstance.get(`${apiServer}/payment/totalMembersPaidForCurrentYear`)
  return response.data
}

export const saveMemberCsv = async (csvFile) => {
  let formData = new FormData()
  formData.append('file', csvFile)
  const response = await axiosInstance.post(`${apiServer}/members/saveCsv`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}
