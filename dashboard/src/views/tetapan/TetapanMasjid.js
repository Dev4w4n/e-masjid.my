import React, { useState , useEffect, useRef } from 'react'
import {
  CCard,
  CCardBody,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CSpinner,
  CCardHeader,
  CButton,
  CCol,
  CRow,
} from '@coreui/react'
import { getTetapanMasjid, saveTetapanMasjid } from 'src/service/tetapan/TetapanMasjidApi'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const TetapanMasjid = () => {
  const [loading, setLoading] = useState(false)
  const [validated, setValidated] = useState(false)
  const inputNamaMasjid = useRef('')
  const inputAlamatMasjid = useRef('')
  const inputNoTelefonMasjid = useRef('')

  useEffect(() => {
    async function fetchTetapan() {
      try {
        const data = await getTetapanMasjid()
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchTetapan()
  }, [])
  
  async function saveTetapan() {
    if (!inputNamaMasjid.current.value ||
      !inputNoTelefonMasjid.current.value ||
      !inputAlamatMasjid.current.value) {
        setValidated(true)
        toast.error('Sila isi maklumat masjid dengan betul', {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
        })
    } else {
      try {
        const tetapan = {
          namaMasjid: inputNamaMasjid.current.value,
          noTelefonMasjid: inputNoTelefonMasjid.current.value,
          alamatMasjid: inputAlamatMasjid.current.value
        }
        setLoading(true)
        await saveTetapanMasjid(tetapan)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
  }

  if (loading) {
    return <div><CSpinner color="primary" /></div>
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <ToastContainer />
            <strong>Tetapan Masjid</strong>
          </CCardHeader>
          <CCardBody>
            <CForm id="tetapanForm" validated={validated}>
              <div className="mb-3">
                <CFormLabel htmlFor="txtNamaMasjid">Nama Masjid</CFormLabel>
                <CFormInput
                  ref={inputNamaMasjid}
                  type="text"
                  id="txtNamaMasjid"
                  placeholder="Masukkan nama masjid"
                  feedbackInvalid="Masukkan nama masjid"
                  required
                  tabIndex={1}
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="txtNoTelefonMasjid">Nombor Telefon Masjid</CFormLabel>
                <CFormInput
                  ref={inputNoTelefonMasjid}
                  type="text"
                  id="txtNoHp"
                  placeholder="Masukkan nombor telefon masjid"
                  feedbackInvalid="Masukkan nombor telefon masjid"
                  required
                  tabIndex={2}
                />
              </div>
              <div>
                <CFormLabel htmlFor="txtAlamatMasjid">Alamat Masjid</CFormLabel>
                <CFormTextarea
                  ref={inputAlamatMasjid}
                  id="txtAlamatMasjid"
                  rows={3}
                  placeholder="Masukkan alamat masjid"
                  feedbackInvalid="Masukkan alamat masjid"
                  required
                  tabIndex={3}>
                </CFormTextarea>
              </div>
              <br />
              <div className="d-grid gap-2">
                <CButton onClick={saveTetapan} color="primary" size="lg" tabIndex={4}>
                {loading ? (
                  <>
                    <CSpinner size="sm" color="primary" /> 
                    <span>Sila tunggu</span>
                  </>
                ) : (
                  "Simpan"
                )}
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default TetapanMasjid
