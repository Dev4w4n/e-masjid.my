import React, { useState, useEffect } from 'react'
import {
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CRow,
} from '@coreui/react'
import CadanganList from 'src/components/cadangan/CadanganList'
import { getCadanganCount } from 'src/service/cadangan/CadanganApi'

const Senarai = () => {
  const [activeKey, setActiveKey] = useState(1)
  const [cadanganCount, setCadanganCount] = useState([])

  const fetchCount = async () => {
    try {
      const response = await getCadanganCount()
      setCadanganCount(response)
    } catch (error) {
      console.error('Error fetching getCadanganCount:', error)
    }
  }
  useEffect(() => {
    fetchCount()
  },[])
  const handleEditorUpdated = async () => {
    await fetchCount()
  }

  const renderCount = (activeKey) => {
    return cadanganCount[activeKey - 1] || 0;
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Senarai Cadangan</strong>
          </CCardHeader>
          <CCardBody>
          <CNav variant="tabs" role="tablist">
            <CNavItem role="presentation">
              <CNavLink component="button" 
              active={activeKey === 1}
              aria-selected={activeKey === 1}
              onClick={() => setActiveKey(1)}>
                Baru  <CBadge color="secondary">{renderCount(1)}</CBadge>
              </CNavLink>
            </CNavItem>
            <CNavItem role="presentation">
              <CNavLink component="button" 
              active={activeKey === 2}
              aria-selected={activeKey === 2}
              onClick={() => setActiveKey(2)}>
                Cadangan <CBadge color="secondary">{renderCount(2)}</CBadge>
              </CNavLink>
            </CNavItem>
            <CNavItem role="presentation">
              <CNavLink component="button" 
              active={activeKey === 3}
              aria-selected={activeKey === 3}
              onClick={() => setActiveKey(3)}>
                Aduan <CBadge color="secondary">{renderCount(3)}</CBadge>
              </CNavLink>
            </CNavItem>
            <CNavItem role="presentation">
              <CNavLink component="button" 
              active={activeKey === 4}
              aria-selected={activeKey === 4}
              onClick={() => setActiveKey(4)}>
                Lain-lain <CBadge color="secondary">{renderCount(4)}</CBadge>
              </CNavLink>
            </CNavItem>
            <CNavItem role="presentation">
              <CNavLink component="button" 
              active={activeKey === 5}
              aria-selected={activeKey === 5}
              onClick={() => setActiveKey(5)}>
                Selesai <CBadge color="secondary">{renderCount(5)}</CBadge>
              </CNavLink>
            </CNavItem>
          </CNav>
            <br />
            <CTabContent>
              <CTabPane role="tabpanel" 
              aria-labelledby="baru-tab-pane" 
              visible={activeKey === 1}>
                <CadanganList onEditorUpdated={handleEditorUpdated} 
                isOpen="true" cadanganType={1} activeKey={activeKey} />
              </CTabPane>
              <CTabPane role="tabpanel" 
              aria-labelledby="cadangan-tab-pane" 
              visible={activeKey === 2}>
                <CadanganList onEditorUpdated={handleEditorUpdated} 
                isOpen="true" cadanganType={2} activeKey={activeKey} />
              </CTabPane>
              <CTabPane role="tabpanel" 
              aria-labelledby="aduan-tab-pane" 
              visible={activeKey === 3}>
                <CadanganList onEditorUpdated={handleEditorUpdated} 
                isOpen="true" cadanganType={3} activeKey={activeKey} />
              </CTabPane>
              <CTabPane role="tabpanel" 
              aria-labelledby="lain-tab-pane" 
              visible={activeKey === 4}>
                <CadanganList onEditorUpdated={handleEditorUpdated} 
                isOpen="true" cadanganType={4} activeKey={activeKey} />
              </CTabPane>
              <CTabPane role="tabpanel" 
              aria-labelledby="tutup-tab-pane" 
              visible={activeKey === 5}>
                <CadanganList onEditorUpdated={handleEditorUpdated} 
                isOpen="false" cadanganType={5} activeKey={activeKey} />
              </CTabPane>
            </CTabContent>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Senarai
