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

export const getTetapanNamaMasjid = async () => {
  try {
    const response = await axios.get(`${apiServer}/tetapan/NAMA_MASJID`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export const getTetapanZonMasjid = async () => {
	try {
		const response =await axios.get(`${apiServer}/tetapan/ZON_MASJID`)
		.then((response) => {
			return response.data.nilai
		})
		.catch((error) => {
			console.log("Error " + error.response.status + ": Tetapan Zon Masjid Tidak Dijumpai")
			return null
		})
		return response
	  } catch (error) {
		console.error(error)
	  }
	}