import React, { forwardRef } from 'react'
import { CCol, CRow, CContainer, CTable } from '@coreui/react'

const columns = [
  {
    key: 'minggu',
    label: 'MINGGU',
    _props: { scope: 'col' },
  },
  {
    key: 'tarikh',
    label: 'TARIKH',
    _props: { scope: 'col' },
  },
  {
    key: 'jumlah',
    label: 'JUMLAH',
    _props: { scope: 'col' },
  },
]

const PenyataBulanan = forwardRef((props, ref) => {
  return (
    <CContainer
      fluid
      ref={ref}
      style={{ paddingTop: '5%', paddingBottom: '5%', paddingLeft: '5%', paddingRight: '5%' }}
    >
      <CRow>
        <CCol style={{ textAlign: 'center' }}>
          <h3>PENYATA KUTIPAN DAN DERMA BULANAN</h3>
        </CCol>
      </CRow>
      <CRow>
        <CCol style={{ textAlign: 'center' }}>
          <b>MASJID JAMEK SUNGAI RAMBAI</b>
        </CCol>
      </CRow>
      <CRow>
        <CCol style={{ textAlign: 'center' }}>Nama Tabung: {props.penyata.tabung.name}</CCol>
      </CRow>
      <CRow>
        <CCol style={{ textAlign: 'center' }}>
          BULAN: {new Intl.DateTimeFormat('en-GB').format(new Date(props.penyata.createDate))}
        </CCol>
      </CRow>
      <CRow>
        <CCol style={{ textAlign: 'center' }}>
          <CTable columns={columns} items={items} />
        </CCol>
      </CRow>
      <CRow>
        <CCol>Disediakan Oleh,</CCol>
      </CRow>
      <CRow>
        <br />
      </CRow>
      <CRow>
        <CCol>____________________________</CCol>
      </CRow>
      <CRow>
        <CCol>(BENDAHARI)</CCol>
      </CRow>
    </CContainer>
  )
})

export default PenyataBulanan
