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
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CModal,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import DataTable from 'react-data-table-component'
import { searchMember, searchMemberByTagId } from 'src/service/khairat/MembersApi'
import { getTags } from 'src/service/khairat/TagsApi'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { cilMagnifyingGlass, cilInfo, cilPrint } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useNavigate } from 'react-router-dom'
import SenaraiAhli from 'src/components/print/khairat/SenaraiAhli'
import { useReactToPrint } from 'react-to-print'

const columns = [
  {
    name: 'Nama',
    selector: (row) => row.nama,
    sortable: true,
  },
  {
    name: 'Penanda',
    selector: (row) => row.tagging,
    sortable: true,
  },
  {
    name: 'No Ic',
    selector: (row) => row.icno,
    sortable: true,
    hide: 'sm',
  },
  {
    name: 'No Telefon',
    selector: (row) => row.hp,
    sortable: true,
  },
  {
    name: 'Status Bayaran (# No Resit)',
    selector: (row) => row.paymentStatus,
    sortable: true,
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
  const [activeKey, setActiveKey] = useState(1)
  const [tagItems, setTagItems] = useState([])
  const [tagsButtons, setTagsButtons] = useState([])
  const [tagIds, setTagIds] = useState([])
  const [visibleXL, setVisibleXL] = useState(false)
  const componentRef = useRef();
  
  useEffect(() => {
    setTimeout(() => {
      searchInput.current.focus();
    }, 10);
  })

  useEffect(() => {
    async function fetchTags() {
      try {
        const data = await getTags()
        const tagItems = data.content.map((tag) => ({
          label: tag.name,
          id: tag.id,
          mode: false,
          dbId: null,
        }))
        setTagItems(tagItems)
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    }
    fetchTags()
  }, [])

  // to generate tag buttons
  useEffect(() => {
    const updateButtonColor = (id) => {
      changeTagColor(id)
    }
    let buttons = []
    if (tagItems.length !== 0) {
      buttons = tagItems.map((tag) => (
        <CButton
          onClick={() => updateButtonColor(tag.id)}
          key={tag.id}
          color={tag.mode ? 'info' : 'light'}
          size="sm"
          shape="rounded-pill"
        >
          {tag.label}
        </CButton>
      ))
    } else if (tagItems.length === 0) {
      buttons = <CSpinner color="primary" />
    }
    function generateButtons() {
      setTagsButtons(buttons)
    }
    generateButtons()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagItems])
  
  function changeTagColor(id) {
    const newTagItems = tagItems.map((tag) => {
      if (tag.id === id) {
        tag.mode = !tag.mode
      }
      return tag
    })
    
    const tagIds = newTagItems
    .map((tag) => (tag.mode ? tag.id : undefined))
    .filter((id) => id !== undefined);

    setTagIds(tagIds)
    setTagItems(newTagItems)
  }

  useEffect(() => {
    const searchTags = () => {
      if(tagIds.length > 0) {
        searchMemberByTagId(tagIds)
        .then((response) => {
          setItems(
            response.map((item) => {
              const paymentHistory = item.paymentHistories
              const currentYear = new Date().getFullYear();
              const paymentStatus = paymentHistory.some(item => {
                const paymentDateYear = new Date(item.paymentDate).getFullYear();
                return paymentDateYear === currentYear;
              }) ? `Sudah${paymentHistory.find(item => new Date(item.paymentDate).getFullYear() === currentYear)?.noResit ? ` (#${paymentHistory.find(item => new Date(item.paymentDate).getFullYear() === currentYear).noResit})` : ''}` : 'Belum';
              
              const person = item.person
              const tags = item.memberTags.map(tag => tag.tag.name);
              const commaSeparatedTags = tags.join(', ');
              return {
                id: item.id,
                nama: person.name,
                icno: person.icNumber,
                hp: person.phone,
                alamat: person.address,
                tagging: commaSeparatedTags,
                paymentHistory,
                paymentStatus,
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
    }
    searchTags()
  },[tagIds])

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
            const currentYear = new Date().getFullYear();
            const paymentStatus = paymentHistory.some(item => {
              const paymentDateYear = new Date(item.paymentDate).getFullYear();
              return paymentDateYear === currentYear;
            }) ? `Sudah${paymentHistory.find(item => new Date(item.paymentDate).getFullYear() === currentYear)?.noResit ? ` (#${paymentHistory.find(item => new Date(item.paymentDate).getFullYear() === currentYear).noResit})` : ''}` : 'Belum';

            const person = item.person
            const tagging = item.memberTags[0]?.tag.name || ''
            return {
              id: item.id,
              nama: person.name,
              icno: person.icNumber,
              hp: person.phone,
              alamat: person.address,
              tagging,
              paymentHistory,
              paymentStatus,
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
          <CRow>            
            <CCol align="right" className="mt-2 hover-effect d-none d-lg-block" 
              onClick={() => setVisibleXL(true)}>
              <CIcon icon={cilPrint} className="me-2" />
              Cetak senarai ini
            </CCol>
          </CRow>
          
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

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
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
          <CNav variant="tabs">
            <CNavItem className='hover-effect'>
              <CNavLink onClick={() => setActiveKey(1)} active={activeKey === 1}>
                Carian teks
              </CNavLink>
            </CNavItem>
            <CNavItem className='hover-effect'>
              <CNavLink onClick={() => setActiveKey(2)} active={activeKey === 2}>
                Carian tag
              </CNavLink>
            </CNavItem>
          </CNav>
            <CTabContent>
              <CTabPane role="tabpanel" 
                aria-labelledby="textsearch-tab-pane" 
                visible={activeKey === 1}>
                  <p className="text-medium-emphasis mt-3">
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
              </CTabPane>
              <CTabPane role="tabpanel" 
                aria-labelledby="tagsearch-tab-pane" 
                visible={activeKey === 2}>
                  <p className="text-medium-emphasis mt-3">
                    Pilih jenis penanda untuk dipaparkan.
                  </p>
                  {tagsButtons}
              </CTabPane>
            </CTabContent>
            
            {renderHelp()}
            <DataTable
              noDataComponent={resultEmpty()}
              columns={columns}
              data={items}
              pagination
              paginationPerPage={5}
              paginationRowsPerPageOptions={[5, 10, 20, 30]}
              pointerOnHover
              highlightOnHover
              conditionalRowStyles={conditionalRowStyles}
              onRowClicked={(row) => {
                handleRowClick(row)
              }}
            />
            <CModal
              size="xl"
              visible={visibleXL}
              onClose={() => setVisibleXL(false)}
              aria-labelledby="SenaraiAhliKhairat"
            >
              <CModalBody>
                <SenaraiAhli ref={componentRef} items={items} />
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
    </CRow>
  )
}

export default Carian
