import React, { useState, useEffect } from 'react'
import {
  CSpinner,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CFormCheck,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CRow,
} from '@coreui/react'
import DataTable from 'react-data-table-component'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {getCadanganByType} from 'src/service/cadangan/CadanganApi'
import { cilMagnifyingGlass, cilInfo } from '@coreui/icons'
import CIcon from '@coreui/icons-react'


/*
export const getCadanganByType = async (page, size, cadanganType, isOpen) => {
    const response = await axios.get(`${apiServer}/cadangan?page=${page}&size=${size}&cadanganType=${cadanganType}&isOpen=${isOpen}`)
    return response.data
}
*/

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
    name: 'Tindakan',
    selector: (row) => row.action,
  },
  {
    name: 'Id',
    selector: (row) => row.id,
    omit: true,
  },
]

// const conditionalRowStyles = [
// 	{
// 		when: row => row.paymentHistory.some(item => {
//       const paymentDateYear = new Date(item.paymentDate).getFullYear()
//       const currentYear = new Date().getFullYear()
//       return paymentDateYear === currentYear;
//     }),
// 		style: {
// 			backgroundColor: 'rgba(213, 245, 227, 0.9)',
// 			color: 'black',
// 		},
// 	},
// 	{
// 		when: row => row.paymentHistory.every(item => {
//       const paymentDateYear = new Date(item.paymentDate).getFullYear();
//       const currentYear = new Date().getFullYear();
//       return paymentDateYear !== currentYear;
//     }),
// 		style: {
// 			backgroundColor: 'rgba(252, 243, 207, 0.9)',
// 			color: 'black',
// 		},
// 	},
// ]

const CadanganList = (props) => {
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)

  const [data, setData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      if(props.activeKey === props.cadanganType) {
        const response = await getCadanganByType(page, size, props.cadanganType, props.isOpen)
        setData(response.content)
        console.log(response.content)
      }
      setLoading(false)
    }
    fetchData()
    
  }, [])

  const resultEmpty = () => {
    return (
      <p>
        <CIcon icon={cilMagnifyingGlass} className="me-2" /> Tiada rekod.
      </p>
    )
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
    </CRow>
  )
}

export default CadanganList
