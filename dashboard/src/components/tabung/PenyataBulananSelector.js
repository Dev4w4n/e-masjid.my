import React, { useState, useEffect, useRef } from 'react'
import {
  CModal,
  CModalBody,
  CModalHeader,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormTextarea,
  CButton,
  CButtonGroup,
} from '@coreui/react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useReactToPrint } from 'react-to-print'
import PenyataBulananPrint from 'src/components/print/tabung/PenyataBulananPrint'
import { getKutipanByTabungBetweenCreateDate } from 'src/service/tabung/KutipanApi'
import { getTabungById } from 'src/service/tabung/TabungApi'

const PenyataBulananSelector = ({ onModalClose, ...props }) => {
  const componentRef = useRef();
  const [calendarVisible, setCalendarVisible] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [visibleSM, setVisibleSM] = useState(false)
  const [visibleXL, setVisibleXL] = useState(false)
  const [printData, setPrintData] = useState([])

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  useEffect(() => {
    function showModal() {
      if (props.visible) {
        setVisibleSM(true)
      }
    }
    showModal()
  }, [props])

  const resetModal = () => {
    if (!calendarVisible && !visibleXL) {
      setVisibleSM(false)
      setVisibleXL(false)
      onModalClose()
    }
  }

  const printPreview = async () => {
    const tabung = await getTabungById(props.tabung)
    console.log(selectedMonth)
    const dataToPrint = {
      tabung: {
        id: tabung.id,
        name: tabung.name
      },
      createDate: new Date().getTime(),
    }
    setPrintData(dataToPrint)
    setVisibleXL(true)
    setVisibleSM(false)
  }

  const renderMonthContent = (month, shortMonth, longMonth, day) => {
    const fullYear = new Date(day).getFullYear()
    const tooltipText = `Tooltip for month: ${longMonth} ${fullYear}`

    return <span title={tooltipText}>{shortMonth}</span>
  }

  return (
    <>
      <CModal
        visible={visibleSM}
        onClick={() => {
          resetModal()
        }}
        aria-labelledby="modalConfirm"
      >
        <CModalHeader>
          <h3>Cetak Penyata Bulanan</h3>
        </CModalHeader>
        <CModalBody>
          <p>Sila pilih bulan & tahun untuk dicetak</p>
          <DatePicker
            selected={selectedMonth}
            renderMonthContent={renderMonthContent}
            showMonthYearPicker
            dateFormat="MM/yyyy"
            onChange={(date) => setSelectedMonth(date)}
            onCalendarOpen={() => setCalendarVisible(true)}
            onCalendarClose={() => setCalendarVisible(false)}
          />
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              resetModal()
            }}
          >
            Batal
          </CButton>
          <CButton color="primary" onClick={(e) => {
              e.stopPropagation();
              printPreview();
            }}>
            Teruskan
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal
        visible={visibleXL}
        onClick={() => {
          resetModal()
        }}
        aria-labelledby="modalPrintPreview"
      >
        <CModalBody>
          <PenyataBulananPrint ref={componentRef} penyata={printData} />
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              setVisibleXL(false); resetModal()
            }}
          >
            Batal
          </CButton>
          <CButton color="primary" onClick={handlePrint}>
            Cetak
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default PenyataBulananSelector
