import React, { useState, useEffect } from 'react'
import {
  CSpinner,
  CCard,
  CCardBody,
  CCol,
  CRow,
} from '@coreui/react'
import DataTable from 'react-data-table-component'
import 'react-toastify/dist/ReactToastify.css'
import {getCadanganByType, getCadanganByOpen} from 'src/service/cadangan/CadanganApi'
import { cilMagnifyingGlass } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import CadanganEditor from './CadanganEditor'


const columns = [
  {
    name: 'Tarikh',
    selector: (row) => {
      let date = new Date(row.createDate); 
      let day = date.getDate();
      let month = date.getMonth() + 1; 
      let year = date.getFullYear();

      let time = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

      day = day < 10 ? '0' + day : day;
      month = month < 10 ? '0' + month : month;

      return day + '/' + month + '/' + year + ' ' + time;
    },
  },
  {
    name: 'Mesej',
    selector: (row) => row.cadanganText,
  },
  {
    name: 'Penilaian',
    selector: (row) => row.score,
  },
  {
    name: 'Id',
    selector: (row) => row.id,
    omit: true,
  },
]

const CadanganList = ({ onEditorUpdated, ...props }) => {
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [rowClickedInfo, setRowClickedInfo] = useState(null)
  const [data, setData] = useState([])
  const [dataChanged, setDataChanged] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if(props.activeKey === props.cadanganType) {
          const response = (props.activeKey === 5 && props.cadanganType === 5) ? 
          await getCadanganByOpen(page, size, props.isOpen) : await getCadanganByType(page, size, props.cadanganType, props.isOpen)
          setData(response.content)
        }
      } catch (error) {
        console.error('Error fetching getCadanganByOpen:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    
  }, [props.activeKey, dataChanged])

  const resultEmpty = () => {
    return (
      <p>
        <CIcon icon={cilMagnifyingGlass} className="me-2" /> Tiada rekod.
      </p>
    )
  }

  const handleRefreshData = () => {
    setDataChanged(!dataChanged)
  }
  const handleRowClick = (row) => {
    row.visibleXL = true
    setRowClickedInfo(row)
  }

  if (loading) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardBody>
              <CSpinner color="primary" />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }
  return (
    <CRow>
      <CCol xs={12}>
        <DataTable
          noDataComponent={resultEmpty()}
          columns={columns}
          data={data}
          pointerOnHover
          highlightOnHover
          // conditionalRowStyles={conditionalRowStyles}
          onRowClicked={(row) => {
            handleRowClick(row)
          }}
        />
      </CCol>
      <CadanganEditor onHandleRefreshData={handleRefreshData} 
      onEditorUpdated={onEditorUpdated} rowClickedInfo={rowClickedInfo} />
    </CRow>
  )
}

export default CadanganList
