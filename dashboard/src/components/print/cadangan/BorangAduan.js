import React, { useState, useEffect, forwardRef } from 'react'
import { CCol, CRow, CContainer } from '@coreui/react'
import { getTetapanNamaMasjid } from 'src/service/tetapan/TetapanMasjidApi'
import constants from '../../../constants/print.json';

const BorangAduan = forwardRef((props, ref) => {
  const [namaMasjid, setNamaMasjid] = useState()

  useEffect(() => {
    async function loadNamaMasjid() {
      try {
        const response = await getTetapanNamaMasjid()
        setNamaMasjid(response.nilai)
      } catch (error) {
        console.error("Error fetching nama masjid:", error)
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
          <h2><u>BORANG ADUAN DAN CADANGAN</u></h2>
        </CCol>
      </CRow>

      <CRow>
        <CCol style={{ textAlign: 'center' }}>
          <h3>{namaMasjid}</h3>
        </CCol>
      </CRow>

      <CRow>
        <br /><br />
      </CRow>

      <CRow>
        <CCol style={{ textAlign: 'left' }}>
          <h4>TARIKH : </h4>
        </CCol>
        <CCol style={{ textAlign: 'left' }}>
          <h4>12/4/1221</h4>
        </CCol>
      </CRow>

      <CRow>
        <CCol style={{ textAlign: 'left' }}>
          <h4>NAMA : </h4>
        </CCol>
        <CCol style={{ textAlign: 'left' }}>
          <h4>ROHAIZAN ROOSLEY</h4>
        </CCol>
      </CRow>

      <CRow>
        <CCol style={{ textAlign: 'left' }}>
          <h4>EMAIL : </h4>
        </CCol>
        <CCol style={{ textAlign: 'left' }}>
          <h4>rohaizanr@gmail.com</h4>
        </CCol>
      </CRow>

      <CRow>
        <CCol style={{ textAlign: 'left' }}>
          <h4>NO TELEFON : </h4>
        </CCol>
        <CCol style={{ textAlign: 'left' }}>
          <h4>0124062988</h4>
        </CCol>
      </CRow>

      <CRow>
        <CCol style={{ textAlign: 'left' }}>
          <h4>ADUAN/CADANGAN : </h4>
        </CCol>
        <CCol style={{ textAlign: 'left' }}>
          <h4>Dalam sub topik cadangan kajian ini, ada beberapa perkara yang ingin dicadangkan oleh penyelidik, yang mana cadangan-cadangan ini adalah dianggap</h4>
        </CCol>
      </CRow>

      <CRow>
        <CCol style={{ textAlign: 'left' }}>
          <h4>TINDAKAN / RUMUSAN : </h4>
        </CCol>
        <CCol style={{ textAlign: 'left' }}>
          <h4>Dalam sub topik cadangan kajian ini, ada beberapa perkara yang ingin dicadangkan oleh penyelidik, yang mana cadangan-cadangan ini adalah dianggap</h4>
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

export default BorangAduan