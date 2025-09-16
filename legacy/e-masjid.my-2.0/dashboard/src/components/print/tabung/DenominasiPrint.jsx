import React, { forwardRef, useEffect, useState } from 'react'

import { CCol, CContainer, CRow, CTable } from '@coreui/react'

import { print as constants } from '@/config'
import { getTetapanNamaMasjid } from '@/service/tetapan/TetapanMasjidApi'

const columns = [
  {
    key: 'denominasi',
    label: 'DENOMINASI',
    _props: { scope: 'col' },
  },
  {
    key: 'bilangan',
    label: 'BILANGAN',
    _props: { scope: 'col' },
  },
  {
    key: 'jumlah',
    label: 'JUMLAH',
    _props: { scope: 'col' },
  },
]

const DenominasiPrint = forwardRef((props, ref) => {
  const [namaMasjid, setNamaMasjid] = useState('')

  const items = [
    {
      denominasi: 'RM 100',
      bilangan: props.penyata.total100d,
      jumlah: (props.penyata.total100d * 100).toLocaleString('ms-MY', {
        style: 'currency',
        currency: 'MYR',
      }),
    },
    {
      denominasi: 'RM 50',
      bilangan: props.penyata.total50d,
      jumlah: (props.penyata.total50d * 50).toLocaleString('ms-MY', {
        style: 'currency',
        currency: 'MYR',
      }),
    },
    {
      denominasi: 'RM 20',
      bilangan: props.penyata.total20d,
      jumlah: (props.penyata.total20d * 20).toLocaleString('ms-MY', {
        style: 'currency',
        currency: 'MYR',
      }),
    },
    {
      denominasi: 'RM 10',
      bilangan: props.penyata.total10d,
      jumlah: (props.penyata.total10d * 10).toLocaleString('ms-MY', {
        style: 'currency',
        currency: 'MYR',
      }),
    },
    {
      denominasi: 'RM 5',
      bilangan: props.penyata.total5d,
      jumlah: (props.penyata.total5d * 5).toLocaleString('ms-MY', {
        style: 'currency',
        currency: 'MYR',
      }),
    },
    {
      denominasi: 'RM 1',
      bilangan: props.penyata.total1d,
      jumlah: (props.penyata.total1d * 1).toLocaleString('ms-MY', {
        style: 'currency',
        currency: 'MYR',
      }),
    },
    {
      denominasi: '50 Sen',
      bilangan: props.penyata.total50c,
      jumlah: (props.penyata.total50c * 0.5).toLocaleString('ms-MY', {
        style: 'currency',
        currency: 'MYR',
      }),
    },
    {
      denominasi: '20 Sen',
      bilangan: props.penyata.total20c,
      jumlah: (props.penyata.total20c * 0.2).toLocaleString('ms-MY', {
        style: 'currency',
        currency: 'MYR',
      }),
    },
    {
      denominasi: '10 Sen',
      bilangan: props.penyata.total10c,
      jumlah: (props.penyata.total10c * 0.1).toLocaleString('ms-MY', {
        style: 'currency',
        currency: 'MYR',
      }),
    },
    {
      denominasi: '5 Sen',
      bilangan: props.penyata.total5c,
      jumlah: (props.penyata.total5c * 0.05).toLocaleString('ms-MY', {
        style: 'currency',
        currency: 'MYR',
      }),
    },
    {
      denominasi: '1 Sen',
      bilangan: props.penyata.total1c,
      jumlah: (props.penyata.total1c * 0.01).toLocaleString('ms-MY', {
        style: 'currency',
        currency: 'MYR',
      }),
    },
    {
      denominasi: 'JUMLAH BESAR',
      bilangan: '',
      jumlah: props.penyata.total.toLocaleString('ms-MY', { style: 'currency', currency: 'MYR' }),
      _props: { active: true },
      _cellProps: { id: { scope: 'row' } },
    },
  ]

  const itemsToDisplay = props.penyata.tabung.cents
    ? items
    : items.filter((item) => !item.denominasi.endsWith('Sen'))

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

  return (
    <CContainer
      fluid
      ref={ref}
      style={{ paddingTop: '5%', paddingBottom: '5%', paddingLeft: '5%', paddingRight: '5%' }}
    >
      <CRow>
        <CCol style={{ textAlign: 'center' }}>
          <h2>
            <u>PENYATA KUTIPAN DAN DERMA</u>
          </h2>
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
          Tarikh kutipan:{' '}
          {new Intl.DateTimeFormat('en-GB').format(new Date(props.penyata.createDate))}
        </CCol>
      </CRow>
      <CRow>
        <br />
      </CRow>
      <CRow>
        <CCol style={{ textAlign: 'center' }}>
          <CTable columns={columns} items={itemsToDisplay} />
        </CCol>
      </CRow>
      <CRow>
        <CCol>Dikira Oleh,</CCol>
        <CCol></CCol>
        <CCol>Dibankkan Oleh,</CCol>
      </CRow>
      <CRow>
        <br />
      </CRow>
      <CRow>
        <CCol>1.____________________________</CCol>
        <CCol></CCol>
        <CCol>____________________________</CCol>
      </CRow>
      <CRow>
        <CCol>Nama:</CCol>
        <CCol></CCol>
        <CCol>Nama:</CCol>
      </CRow>
      <CRow>
        <br />
      </CRow>
      <CRow>
        <CCol>2.____________________________</CCol>
        <CCol></CCol>
        <CCol>No. Slip Bank:</CCol>
      </CRow>
      <CRow>
        <CCol>Nama:</CCol>
        <CCol></CCol>
        <CCol></CCol>
      </CRow>
      <CRow>
        <br />
      </CRow>
      <CRow>
        <CCol>3.____________________________</CCol>
        <CCol></CCol>
        <CCol>Tarikh:</CCol>
      </CRow>
      <CRow>
        <CCol>Nama:</CCol>
        <CCol></CCol>
        <CCol></CCol>
      </CRow>
      <CRow>
        <br />
      </CRow>
      <CRow>
        <CCol>Tarikh:</CCol>
        <CCol></CCol>
        <CCol></CCol>
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

export default DenominasiPrint
