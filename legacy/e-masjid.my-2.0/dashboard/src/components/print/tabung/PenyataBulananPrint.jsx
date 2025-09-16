import React, { forwardRef, useEffect, useState } from 'react'

import { CCol, CContainer, CRow, CTable } from '@coreui/react'

import { print as constants } from '@/config'
import { getKutipanByTabungBetweenCreateDate } from '@/service/tabung/KutipanApi'
import { getTetapanNamaMasjid } from '@/service/tetapan/TetapanMasjidApi'

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

const PenyataBulananPrint = forwardRef((props, ref) => {
  const [items, setItems] = useState([])
  const [namaMasjid, setNamaMasjid] = useState('')

  useEffect(() => {
    async function loadNamaMasjid() {
      try {
        const response = await getTetapanNamaMasjid()
        setNamaMasjid(response.nilai)
      } catch (error) {
        console.error('Error fetching nama masjid:', error)
      }
    }
    loadNamaMasjid()
  }, [])

  useEffect(() => {
    async function loadPenyata() {
      const startOfMonth = new Date(
        props.penyata.selectedMonth.getFullYear(),
        props.penyata.selectedMonth.getMonth(),
        1,
      )
      const endOfMonth = new Date(
        props.penyata.selectedMonth.getFullYear(),
        props.penyata.selectedMonth.getMonth() + 1,
        0,
      )

      const response = await getKutipanByTabungBetweenCreateDate(
        props.penyata.tabung.id,
        startOfMonth.getTime(),
        endOfMonth.getTime(),
      )

      let items = []
      let total = 0
      response?.content?.map((data, index) => {
        items.push({
          minggu: 'MINGGU ' + (index + 1),
          tarikh: new Intl.DateTimeFormat('en-GB').format(new Date(data.createDate)),
          jumlah: data.total.toLocaleString('ms-MY', { style: 'currency', currency: 'MYR' }),
        })
        total += data.total
      })
      items.push({
        minggu: 'JUMLAH',
        tarikh: '',
        jumlah: total.toLocaleString('ms-MY', { style: 'currency', currency: 'MYR' }),
        _props: { active: true },
        _cellProps: { id: { scope: 'row' } },
      })

      setItems(items)
    }

    loadPenyata()
  }, [props.penyata, namaMasjid])

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
          <h3>{namaMasjid}</h3>
        </CCol>
      </CRow>
      <CRow>
        <CCol style={{ textAlign: 'left' }}>Nama Tabung: {props.penyata.tabung.name}</CCol>
        <CCol></CCol>
        <CCol style={{ textAlign: 'right' }}>
          Tarikh Cetak:{' '}
          {new Intl.DateTimeFormat('en-GB').format(new Date(props.penyata.createDate))}
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
      <CRow>
        <CCol style={{ textAlign: 'center', marginTop: '20px' }}>
          <small>
            {`${constants.domain} ©${constants.copyrightYear} - ${constants.printFrom} `}
            <a href={constants.url} target="_blank" rel="noopener noreferrer">
              {constants.url}
            </a>
          </small>
        </CCol>
      </CRow>
    </CContainer>
  )
})

export default PenyataBulananPrint
