import React, { useState, useEffect, useRef } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CFormInput,
  CFormSelect,
  CButton,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CTable,
  CSpinner,
  CFormCheck,
} from '@coreui/react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getTabung, saveTabung, deleteTabung } from 'src/service/tabung/TabungApi'

const columns = [
  {
    key: 'Nama',
    _props: { className: 'w-25', scope: 'col' },
  },
  {
    key: 'JenisTabung',
    _props: { className: 'w-25', scope: 'col' },
  },
  {
    key: 'Sen',
    _props: { className: 'w-15', scope: 'col' },
  },
  {
    key: 'Tindakan',
    _props: { className: 'w-25', scope: 'col' },
  },
]

const tabungList = [
  'Pilih jenis tabung',
  { label: 'Harian', value: '1' },
  { label: 'Mingguan', value: '2' },
  { label: 'Biasa', value: '3' },
];

const Tetapan = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const inputName = useRef()
  const selectRef = useRef(null)
  const enableCents = useRef(null)
  const [selectedTabung, setSelectedTabung] = useState('')
  const [tabung, setTabung] = useState([])
  const [data, setData] = useState([])

  useEffect(() => {
    async function fetchTabung() {
      try {
        const data = await getTabung()
        if (data.length > 0) {
          const items = data.map((tabung) => ({
            Nama: tabung.name,
            JenisTabung: tabung.tabungType.name,
            Sen: tabung.cents ? 'Ya' : 'Tidak',
            Tindakan: (
              <CButton color="link" onClick={() => removeTabung(tabung.id)}>
                Buang
              </CButton>
            ),
          }))
          setTabung(items)
        }
        setLoading(false)
      } catch (error) {
        setError(error)
        setLoading(false)
      }
    }
    fetchTabung()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const addTabung = async () => {
    try {
      const inputValue = inputName.current.value
      inputName.current.value = ''
      const enableCentValue = enableCents.current.checked
      enableCents.current.checked = false
      const tabung = {
        cents: enableCentValue,
        name: inputValue,
        tabungType : {
          id: parseInt(selectRef.current.value)
        },
      }
      await saveTabung(tabung)
      setData(tabung)
    } catch (error) {
      toast.error('Tiada akses untuk menyimpan rekod tabung.', {
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

  const removeTabung = async (id) => {
    try {
      await deleteTabung(id)
      setData(id)
    } catch (error) {
      toast.error('Tiada akses untuk membuang tabung.', {
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

  const handleSelectChange = (value) => {
    setSelectedTabung(value);
  };


  if (loading) {
    return <div><CSpinner color="primary" /></div>
  }
  if (error) {
    return <div>Error: {error.message}</div>
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
              Kemaskini semua tetapan untuk semua modul tabung.
            </p>
            <CAccordion alwaysOpen>
              <CAccordionItem>
                <CAccordionHeader>Tabung</CAccordionHeader>
                <CAccordionBody>
                  <div className="mb-3">
                    <CRow>
                    <CCol>
                      <CFormInput
                        maxLength={32}
                        ref={inputName}
                        type="text"
                        id="txtNama"
                        placeholder="Nama tabung"
                      />
                    </CCol>
                    <CCol>
                      <CFormSelect
                        aria-label="Pilih jenis tabung"
                        options={tabungList}
                        value={selectedTabung}
                        ref={selectRef}
                        onChange={(e) => handleSelectChange(e.target.value)}
                      />
                    </CCol>
                    <CCol className="mt-2">
                      <CFormCheck 
                        ref={enableCents}
                        aria-label="Pilih untuk papar pecahan wang dalam sen"
                        label="Sen?"
                      />
                    </CCol>
                    </CRow>
                  </div>
                  <div className="d-grid gap-2">
                    <CButton color="primary" size="sm" onClick={addTabung}>
                      Tambah tabung
                    </CButton>
                  </div>
                  <CTable columns={columns} items={tabung} responsive="lg" />
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