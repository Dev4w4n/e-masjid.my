import React, { useState, useEffect, useRef } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CModal,
  CModalBody,
  CModalFooter,
  CFormSelect,
  CButton,
  CSpinner,
} from '@coreui/react'
import { getKutipan, getKutipanByTabung } from 'src/service/tabung/KutipanApi'
import { getTabung } from 'src/service/tabung/TabungApi'
import DataTable from 'react-data-table-component'
import { cilInfo, cilPrint } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useReactToPrint } from 'react-to-print'
import DenominasiPrint from 'src/components/print/tabung/DenominasiPrint'
import PenyataBulananSelector from 'src/components/tabung/PenyataBulananSelector'

const columns = [
  {
    name: 'Tarikh',
    selector: (row) => {
      let date = new Date(row.createDate); 
      let day = date.getDate();
      let month = date.getMonth() + 1; 
      let year = date.getFullYear();

      day = day < 10 ? '0' + day : day;
      month = month < 10 ? '0' + month : month;

      return day + '/' + month + '/' + year;
    },
  },
  {
    name: 'Jenis Tabung',
    selector: (row) => row.tabung,
  },
  {
    name: 'Jumlah',
    selector: (row) => (row.total ? row.total.toLocaleString('ms-MY', { style: 'currency', currency: 'MYR' }) : ''),
  },
  {
    name: 'Tindakan',
    selector: (row) => row.action,
  },
]

const Cetak = () => {
  const [loading, setLoading] = useState(false)
  const [tabungList, setTabungList] = useState([])
  const [kutipanList, setKutipanList] = useState([])
  const [selectedTabung, setSelectedTabung] = useState('')
  const selectRef = useRef(null);
  const componentRef = useRef();
  const [visibleXL, setVisibleXL] = useState(false)
  const [penyata, setPenyata] = useState()
  const [visibleBulanan, setVisibleBulanan] = useState(false)

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

   useEffect(() => {
    const fetchTabung = async () => {
      setLoading(true)
      try {
        const data = await getTabung()
        if (data.length > 0) {
          const tabungList = data.map((tabung) => ({
            label: tabung.name,
            value: tabung.id,
          }))
          tabungList.unshift({ label: 'Pilih tabung', value: '' })
          setTabungList(tabungList)
        }
      } catch (error) {
        console.error('Error fetchTabung:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTabung()
  }, [])

  useEffect(() => {
    const fetchKutipan = async () => {
      if (selectedTabung) {
        setLoading(true)
        try {
          const data = await getKutipanByTabung(selectedTabung)
          if (data.length > 0) {
            const kutipanData = data.map((item) => ({
              id: item.id,
              tabung: item.tabung.name,
              createDate: item.createDate,
              total: item.total,
              action: (
                <CIcon icon={cilPrint} className="me-2" onClick={() => printPreview(item.id)}/>
              ),
            }))
            setKutipanList(kutipanData)
          } else {
            setKutipanList([]);
          }
        } catch (error) {
          console.error('Error fetching kutipan:', error)
        } finally {
          setLoading(false)
        }
      }
    };
    
    fetchKutipan()
  }, [selectedTabung])

  useEffect(() => {
    if(penyata) {
      setVisibleXL(!visibleXL);
    }
  }, [penyata])

  const printPreview = async (id) => {
    if(id) {
      try {
        const data = await getKutipan(id)
        if (data) {
          setPenyata(data)
        }
      } catch (error) {
        console.error('Error fetching kutipan:', error)
      }
    }
  }

  const handleSelectChange = (value) => {
    setSelectedTabung(value);
  };

  if (loading) {
    return <div><CSpinner color="primary" /></div>
  }

  const resultEmpty = () => {
    return (
      <p>
        <CIcon icon={cilInfo} className="me-2" /> Sila pilih tabung di atas.
      </p>
    )
  }

  const previewBulanan = () => {
    setVisibleBulanan(true)
  }

  const cetakBulanan = () => {
    if (kutipanList.length > 0) {
      return (
        <CRow>
          <CCol></CCol>
          <CCol></CCol>
          <CCol align="right" className="hover-effect" onClick={() => previewBulanan()}>
            <CIcon icon={cilPrint} className="me-2" />
            Cetak Penyata Bulanan
          </CCol>
        </CRow>
      )
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Cetak</strong>
          </CCardHeader>
          <CCardBody>
            <div className="mb-3">
              <CFormSelect
                aria-label="Pilih tabung"
                options={tabungList}
                value={selectedTabung}
                ref={selectRef}
                onChange={(e) => handleSelectChange(e.target.value)}
              />
            </div>
            { cetakBulanan() }
            <DataTable
              noDataComponent={resultEmpty()}
              columns={columns}
              data={kutipanList}
              pointerOnHover
              highlightOnHover
            />
            <CModal
              size="xl"
              visible={visibleXL}
              onClose={() => setVisibleXL(false)}
              aria-labelledby="OptionalSizesExample1"
            >
              <CModalBody>
                <DenominasiPrint ref={componentRef} penyata={penyata} />
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setVisibleXL(false)}>
                  Tutup
                </CButton>
                <CButton onClick={handlePrint} color="primary">Cetak</CButton>
              </CModalFooter>
            </CModal>
          </CCardBody>
        </CCard>
      </CCol>
      <PenyataBulananSelector visible={visibleBulanan} tabung={selectedTabung} 
      onModalClose={() => setVisibleBulanan(false)} />
    </CRow>
  )
}

export default Cetak