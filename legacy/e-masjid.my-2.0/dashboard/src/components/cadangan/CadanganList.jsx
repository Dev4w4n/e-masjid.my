import React, { useEffect, useState } from 'react'

import { CCard, CCardBody, CCol, CRow, CSpinner } from '@coreui/react'
import DataTable from 'react-data-table-component'

import 'react-toastify/dist/ReactToastify.css'

import { cilMagnifyingGlass } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import { getCadanganByOpen, getCadanganByType } from '@/service/cadangan/CadanganApi'
import CadanganEditor from './CadanganEditor'

const columns = [
  {
    name: 'Tarikh',
    selector: (row) => {
      let date = new Date(row.createDate)
      let day = date.getDate()
      let month = date.getMonth() + 1
      let year = date.getFullYear()

      let time = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()

      day = day < 10 ? '0' + day : day
      month = month < 10 ? '0' + month : month

      return day + '/' + month + '/' + year + ' ' + time
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
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(25)
  const [totalRows, setTotalRows] = useState(0)
  const [rowClickedInfo, setRowClickedInfo] = useState(null)
  const [data, setData] = useState([])
  const [dataChanged, setDataChanged] = useState(false)

  const fetchData = async (page, size) => {
    setLoading(true)
    try {
      if (props.activeKey === props.cadanganType) {
        const response =
          props.activeKey === 5 && props.cadanganType === 5
            ? await getCadanganByOpen(page, size, props.isOpen)
            : await getCadanganByType(page, size, props.cadanganType, props.isOpen)
        setData(response.content)
        setTotalRows(response.total)
      }
    } catch (error) {
      console.error('Error fetching getCadanganByOpen:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(1, size)
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
  const handlePageChange = (page) => {
    fetchData(page, size)
    setPage(page)
  }
  const handlePerRowsChange = async (newSize, page) => {
    setSize(newSize)
    fetchData(page, newSize)
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
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          paginationPerPage={size}
          paginationDefaultPage={page}
          paginationRowsPerPageOptions={[25, 50, 100, 200]}
          onChangeRowsPerPage={handlePerRowsChange}
          onChangePage={handlePageChange}
          // conditionalRowStyles={conditionalRowStyles}
          onRowClicked={(row) => {
            handleRowClick(row)
          }}
        />
      </CCol>
      <CadanganEditor
        onHandleRefreshData={handleRefreshData}
        onEditorUpdated={onEditorUpdated}
        rowClickedInfo={rowClickedInfo}
      />
    </CRow>
  )
}

export default CadanganList
