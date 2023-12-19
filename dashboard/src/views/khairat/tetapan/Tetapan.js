import React, { useState, useEffect, useRef } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CButton,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CFormLabel,
  CFormInput,
  CSpinner,
} from '@coreui/react'
import { getTags, saveTag, deleteTag } from 'src/service/khairat/TagsApi'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const columns = [
  {
    key: 'Nama',
    _props: { className: 'w-25', scope: 'col' },
  },
  {
    key: 'Tindakan',
    _props: { className: 'w-25', scope: 'col' },
  },
]

const Tetapan = () => {
  const [tags, setTags] = useState([])
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const inputName = useRef()

  useEffect(() => {
    async function fetchTags() {
      try {
        const data = await getTags()
        const items = data.content.map((tag) => ({
          Nama: tag.name,
          Tindakan: (
            <CButton color="link" onClick={() => removeTag(tag.id)}>
              Buang
            </CButton>
          ),
        }))
        setTags(items)
        setLoading(false)
      } catch (error) {
        setError(error)
        setLoading(false)
      }
    }
    fetchTags()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const addTag = async () => {
    try {
      const inputValue = inputName.current.value
      inputName.current.value = ''
      const tag = {
        name: inputValue,
      }
      await saveTag(tag)
      setData(tag)
    } catch (error) {
      console.error(error)
      toast.error('Tiada akses untuk menyimpan rekod tag.', {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      })
    }
  }

  const removeTag = async (id) => {
    try {
      await deleteTag(id)
      setData(id)
    } catch (error) {
      toast.error('Tiada akses untuk membuang tag.', {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      })
    }
  }

  if (loading) {
    return <div><CSpinner color="primary" /></div>
  }
  if (error) {
    // return <div>Error: {error.message}</div>
    return <div>Tiada akses. Sila login kembali</div>
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <ToastContainer />
            <strong>Tetapan</strong>
          </CCardHeader>

          <CCardBody>
            <p className="text-medium-emphasis small">
              Kemaskini semua tetapan untuk semua modul khairat.
            </p>
            <CAccordion alwaysOpen>
              <CAccordionItem>
                <CAccordionHeader>Tag penandaan</CAccordionHeader>
                <CAccordionBody>
                  <div className="mb-3">
                    <CFormLabel htmlFor="txtNoHp">Nama tag</CFormLabel>
                    <CFormInput
                      maxLength={12}
                      ref={inputName}
                      type="text"
                      id="txtNoHp"
                      placeholder="Nama tag"
                    />
                  </div>
                  <div className="d-grid gap-2">
                    <CButton color="primary" size="sm" onClick={addTag}>
                      Tambah tag
                    </CButton>
                  </div>
                  <CTable columns={columns} items={tags} responsive="lg" />
                </CAccordionBody>
              </CAccordionItem>
            </CAccordion>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Tetapan
