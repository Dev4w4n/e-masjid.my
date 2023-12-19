import { React, useState, useRef, useEffect } from 'react'
import {
  CInputGroup,
  CFormInput,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
  CButtonGroup,
} from '@coreui/react'
import DataTable from 'react-data-table-component'
import { searchMember } from 'src/service/khairat/MembersApi'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { cilMagnifyingGlass, cilInfo } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useNavigate } from 'react-router-dom'

const columns = [
  {
    name: 'Nama',
    selector: (row) => row.nama,
  },
  {
    name: 'No Ic',
    selector: (row) => row.icno,
  },
  {
    name: 'Penanda',
    selector: (row) => row.tagging,
  },
  {
    name: 'Alamat',
    selector: (row) => row.alamat,
  },
  {
    name: 'No Telefon',
    selector: (row) => row.hp,
  },
  {
    name: 'Bayaran',
    selector: (row) => row.paymentHistory,
    omit: true,
  },
]

const conditionalRowStyles = [
	{
		when: row => row.paymentHistory.some(item => {
      const paymentDateYear = new Date(item.paymentDate).getFullYear()
      const currentYear = new Date().getFullYear()
      return paymentDateYear === currentYear;
    }),
		style: {
			backgroundColor: 'rgba(213, 245, 227, 0.9)',
			color: 'black',
		},
	},
	{
		when: row => row.paymentHistory.every(item => {
      const paymentDateYear = new Date(item.paymentDate).getFullYear();
      const currentYear = new Date().getFullYear();
      return paymentDateYear !== currentYear;
    }),
		style: {
			backgroundColor: 'rgba(252, 243, 207, 0.9)',
			color: 'black',
		},
	},
]

const Carian = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const searchInput = useRef()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      searchInput.current.focus();
    }, 1000);
  })
  
  const handleRowClick = (row) => {
    window.location.href = '#/khairat/daftar/' + row.id
  }

  const search = () => {
    setLoading(true)
    const query = searchInput.current.value
    searchMember(query)
      .then((response) => {
        setItems(
          response.map((item) => {
            const paymentHistory = item.paymentHistories
            const person = item.person
            const tagging = item.memberTags[0]?.tag.name || ''
            return {
              id: item.id,
              nama: person.name,
              icno: person.icNumber,
              hp: person.phone,
              alamat: person.address,
              tagging,
              paymentHistory
            }
          }),
        )
        if (response.length === 0) {
          toast.info('Hasil carian tiada.', {
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
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        setLoading(false)
      })
  }
  
  const resultEmpty = () => {
    return (
      <p>
        <CIcon icon={cilMagnifyingGlass} className="me-2" /> Tiada rekod. Sila buat carian.
      </p>
    )
  }
  const renderHelp = () => {
    if(items.length !== 0) {
      return (
        <div className="mb-3">
          <CIcon icon={cilInfo} className="me-2" />
          <CButtonGroup role="group" aria-label="Basic mixed styles example">
            <CButton style={
                { 
                  backgroundColor: 'rgba(213, 245, 227, 0.9)',
                  color: 'black',
                  size: 'xs' 
                  }
                } disabled>Sudah buat bayaran untuk tahun ini</CButton>
            <CButton style={
                { 
                  backgroundColor: 'rgba(252, 243, 207, 0.9)',
                  color: 'black',
                  size: 'xs' 
                  }
                } disabled>Belum buat bayaran untuk tahun ini</CButton>
          </CButtonGroup>
        </div>
      )
    }
  }

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.keyCode === 113) {
        navigate('/khairat/daftar')
      }
    };

    // Add the event listener when the component mounts
    document.addEventListener('keydown', handleKeyPress);

    // Remove the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  });

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <ToastContainer />
            <strong>Carian</strong>
          </CCardHeader>
          <CCardBody>
            <p className="text-medium-emphasis small">
              Carian ahli khairat dengan menggunakan nama, no ic, no hp atau alamat.
            </p>
            <CInputGroup className="mb-3">
              <CFormInput
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    search()
                  }
                }}
                ref={searchInput}
                id="txtSearch"
                placeholder="Isikan maklumat carian anda di sini"
                aria-label="Isikan maklumat carian anda di sini"
                aria-describedby="button-addon2"
              />
              <CButton
                onClick={search}
                type="button"
                color="info"
                variant="outline"
                id="button-addon2"
              >
                {loading ? (
                  <>
                    <CSpinner size="sm" color="primary" /> 
                    <span> Sila tunggu</span>
                  </>
                ) : (
                  "Cari"
                )}
              </CButton>
            </CInputGroup>
            {renderHelp()}
            <DataTable
              noDataComponent={resultEmpty()}
              columns={columns}
              data={items}
              pointerOnHover
              highlightOnHover
              conditionalRowStyles={conditionalRowStyles}
              onRowClicked={(row) => {
                handleRowClick(row)
              }}
            />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Carian
