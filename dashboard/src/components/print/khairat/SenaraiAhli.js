import React, { useState, forwardRef, useEffect } from 'react'
import { CCol, CRow, CContainer, CTable } from '@coreui/react'
import constants  from '../../../constants/print.json';
import { getTetapanNamaMasjid } from 'src/service/tetapan/TetapanMasjidApi'

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
    label: 'STATUS BAYARAN (# NO RESIT)',
    _props: { scope: 'col', className: 'col-3' },
  },
]

const SenaraiAhli = forwardRef((props, ref) => {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [tagType, setTagType] = useState('')
  const [namaMasjid, setNamaMasjid] = useState("")

  useEffect(() => {
    async function loadSenarai() {
      let items = []
      let jumlahAhli = 0
      console.log(props.items)
      for (let i = 0; i < props.items.length; i++) {
        items.push({
          nama: props.items[i].nama,
          penanda: props.items[i].tagging,
          phone: props.items[i].hp,
          status: props.items[i].paymentStatus,
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

  useEffect(() => {
    async function loadNamaMasjid() {
      try {
        const response = await getTetapanNamaMasjid();
        setNamaMasjid(response.nilai);
      } catch (error) {
        console.error("Error fetching nama masjid:", error);
      }
    }
    loadNamaMasjid();
  }, []);


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
          <h3>{namaMasjid}</h3>
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
      <CRow>
        <CCol style={{ textAlign: 'center', marginTop: '20px' }}>
          <small>{`${constants.domain} ©${constants.copyrightYear} - ${constants.printFrom} `}
            <a href={constants.url} target="_blank" rel="noopener noreferrer">{constants.url}</a>
          </small>
        </CCol>
      </CRow>
    </CContainer>
  )
})

export default SenaraiAhli
