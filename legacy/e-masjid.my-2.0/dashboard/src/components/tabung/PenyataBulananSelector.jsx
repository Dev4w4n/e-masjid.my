import React, { useEffect, useRef, useState } from 'react'

import { CButton, CModal, CModalBody, CModalFooter, CModalHeader } from '@coreui/react'
import DatePicker from 'react-datepicker'

import 'react-datepicker/dist/react-datepicker.css'

import { useReactToPrint } from 'react-to-print'

import PenyataBulananPrint from '@/components/print/tabung/PenyataBulananPrint'
import { getTabungById } from '@/service/tabung/TabungApi'

const PenyataBulananSelector = ({ onModalClose, ...props }) => {
  const componentRef = useRef()
  const [calendarVisible, setCalendarVisible] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [visibleSM, setVisibleSM] = useState(false)
  const [visibleXL, setVisibleXL] = useState(false)
  const [printData, setPrintData] = useState([])

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  })

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
    const dataToPrint = {
      tabung: {
        id: tabung.id,
        name: tabung.name,
      },
      createDate: new Date().getTime(),
      selectedMonth: selectedMonth,
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
            showTwoColumnMonthYearPicker
            dateFormat="MM/yyyy"
            onChange={(date) => setSelectedMonth(date)}
            onCalendarOpen={() => setCalendarVisible(true)}
            onCalendarClose={() => setCalendarVisible(false)}
            maxDate={new Date()}
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
          <CButton
            color="primary"
            onClick={(e) => {
              e.stopPropagation()
              printPreview()
            }}
          >
            Teruskan
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal
        size="xl"
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
              resetModal()
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
