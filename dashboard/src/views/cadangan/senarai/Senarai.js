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
  CRow,
} from '@coreui/react'
const Senarai = () => {
  const [loading, setLoading] = useState(false)

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
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Senarai Cadangan</strong>
          </CCardHeader>
          <CCardBody>
          <CNav variant="tabs">
            <CNavItem>
              <CNavLink href="#" active>
                Baru
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink href="#">Cadangan</CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink href="#">Aduan</CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink href="#">Lain-lain</CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink href="#">Selesai</CNavLink>
            </CNavItem>
          </CNav>
            <br />
            <p className="text-medium-emphasis small">Senarai cadangan</p>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Senarai
