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
  const [loading, setLoading] = useState(true)
  const [validated, setValidated] = useState(false)
  const inputNamaMasjid = useRef('')
  const inputAlamatMasjid = useRef('')
  const inputNoTelefonMasjid = useRef('')

  useEffect(() => {
    async function loadTetapan() {
      let data
      try {
        data = await getTetapanMasjid()
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
        //delay value assignment due to error occurs when values being set while page rendering
        setTimeout(() => {
          for(let t of data) {
            if (t.kunci === 'NAMA_MASJID') inputNamaMasjid.current.value = t.nilai
            if (t.kunci === 'ALAMAT_MASJID') inputAlamatMasjid.current.value = t.nilai
            if (t.kunci === 'NO_TEL_MASJID') inputNoTelefonMasjid.current.value = t.nilai
          }
        }, 10);
      }
    }
    
    loadTetapan()
  }, [])
  
  async function saveTetapan() {
    if (!inputNamaMasjid.current.value ||
       !inputAlamatMasjid.current.value ||
       !inputNoTelefonMasjid.current.value) {
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
        const tetapan = []
        tetapan.push({kunci: 'NAMA_MASJID', nilai: inputNamaMasjid.current.value})
        tetapan.push({kunci: 'ALAMAT_MASJID', nilai: inputAlamatMasjid.current.value})
        tetapan.push({kunci: 'NO_TEL_MASJID', nilai: inputNoTelefonMasjid.current.value})

        await saveTetapanMasjid(tetapan)
        saveNotification()
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  }

  const saveNotification = () => {
    toast.success('Maklumat telah disimpan', {
      position: 'top-center',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    })
    inputNamaMasjid.current.focus()
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
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
              <br />
              <div className="button-action-container">
                <CButton onClick={saveTetapan} color="primary" size="sm" tabIndex={4}
                className={`custom-action-button ${loading ? 'loading' : ''}`}>
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
