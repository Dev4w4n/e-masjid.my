import React, { useState, forwardRef, useEffect } from 'react'
import { CCol, CRow, CContainer, CTable } from '@coreui/react'

const columns = [
  {
    key: 'nama',
    label: 'NAMA',
    _props: { scope: 'col', className: 'col-md-5' },
  },
  {
    key: 'penanda',
    label: 'Penanda',
    _props: { scope: 'col', className: 'col-2' },
  },
  {
    key: 'phone',
    label: 'TELEFON',
    _props: { scope: 'col', className: 'col-3' },
  },
  {
    key: 'status',
    label: 'STATUS BAYARAN',
    _props: { scope: 'col', className: 'col-3' },
  },
]

const SenaraiAhli = forwardRef((props, ref) => {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [tagType, setTagType] = useState('')

  useEffect(() => {
    async function loadSenarai() {
      let items = []
      let jumlahAhli = 0
      for (let i = 0; i < props.items.length; i++) {
        const paymentStatus = props.items[i].paymentHistory.some(item => {
          const paymentDateYear = new Date(item.paymentDate).getFullYear();
          const currentYear = new Date().getFullYear();
          return paymentDateYear === currentYear;
        }) ? 'Sudah' : 'Belum';
        items.push({
          nama: props.items[i].nama,
          penanda: props.items[i].tagging,
          phone: props.items[i].hp,
          status: paymentStatus,
        })
        jumlahAhli += 1
      }
      const uniqueTags = [...new Set(props.items.map(item => item.tagging))];
      const tagsString = uniqueTags.join(',');

      setTagType(tagsString)
      setTotal(jumlahAhli)
      setItems(items)
    }
    loadSenarai()
  }, [props.items])

  return (
    <CContainer
      fluid
      ref={ref}
      style={{ paddingTop: '5%', paddingBottom: '5%', paddingLeft: '5%', paddingRight: '5%' }}
    >
      <CRow>
        <CCol style={{ textAlign: 'center' }}>
          <h3>SENARAI AHLI KHAIRAT</h3>
        </CCol> 
      </CRow>
      <CRow>
        <CCol style={{ textAlign: 'center' }} className='mb-3'>
          <b>MASJID JAMEK SUNGAI RAMBAI</b>
        </CCol>
      </CRow>
      <CRow>
        <CCol style={{ textAlign: 'left' }}>Jenis Penanda: {tagType}</CCol>
        <CCol></CCol>
        <CCol style={{ textAlign: 'right' }}>
          Jumlah ahli:{' '}
          {total}
        </CCol>
      </CRow>
      <CRow>
        <CCol className='mt-3'>
          <CTable className='table table-striped' columns={columns} items={items} />
        </CCol>
      </CRow>
    </CContainer>
  )
})

export default SenaraiAhli
