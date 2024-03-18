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
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [enableCentsChecked, setEnableCentsChecked] = useState(false);
  const [tabung, setTabung] = useState([])
  const [data, setData] = useState([])
  const [editID, setEditID] = useState(null)
  const formContainerRef = useRef(null);

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
              <>
                <CButton color="link" onClick={() => editTabung(tabung)}>
                  Ubah
                </CButton>
                <CButton color="link" onClick={() => removeTabung(tabung.id)}>
                  Buang
                </CButton>
              </>
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

  const resetForm = () => {
    setInputValue('');
    setSelectedOption('');
    setEnableCentsChecked(false);
  };

  const addTabung = async () => {
    try {
      const tabung = {
        cents: enableCentsChecked,
        name: inputValue,
        tabungType: {
          id: parseInt(selectedOption)
        },
      };
      if (editID !== null) {
        tabung.id = editID
        setEditID(null)
      }
      await saveTabung(tabung)
      setData(tabung)
      resetForm()
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
  
  const editTabung = async (row) => {
    setEditID(row.id);
    setInputValue(row.name);
    setEnableCentsChecked(row.cents);
    setSelectedOption(row.tabungType.id.toString());
    formContainerRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditID(null);
    resetForm();
  }

  if (loading) {
    return <div><CSpinner color="primary" /></div>
  }
  if (error) {
    return <div>Error: {error.message}</div>
  }
  return (
    <CRow ref={formContainerRef}>
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
                  <div style={{ backgroundColor: editID !== null ? 'beige' : 'transparent', padding: '0.3em' }}>
                    {editID !== null ? <h6>Mod Ubah</h6> : <></>}
                    <div className="mb-3">
                      <CRow>
                        <CCol>
                          <CFormInput
                            maxLength={32}
                            type="text"
                            id="txtNama"
                            placeholder="Nama tabung"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                          />
                        </CCol>
                        <CCol>
                          <CFormSelect
                            aria-label="Pilih jenis tabung"
                            options={tabungList}
                            value={selectedOption}
                            onChange={(e) => setSelectedOption(e.target.value)}
                          />
                        </CCol>
                        <CCol className="mt-2">
                          <CFormCheck
                            aria-label="Pilih untuk papar pecahan wang dalam sen"
                            label="Sen?"
                            checked={enableCentsChecked}
                            onChange={(e) => setEnableCentsChecked(e.target.checked)}
                          />
                        </CCol>
                      </CRow>
                    </div>
                    <div className="button-action-container">
                      <CButton color="primary" size="sm" onClick={addTabung}
                        className="custom-action-button">
                        {editID !== null ? 'Simpan Perubahan' : 'Tambah tabung'}
                      </CButton>
                      <CButton color='secondary' size="sm" hidden={editID === null} onClick={() => cancelEdit()}
                        className="custom-action-button">
                        Batal
                      </CButton>
                    </div>
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