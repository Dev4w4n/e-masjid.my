import React, { useEffect, useState } from 'react'
import {
  CRow,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
  CWidgetStatsA,
  CWidgetStatsC,
} from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilArrowBottom, cilArrowTop, cilOptions, cilUser, cilBadge, cilCommentBubble } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'

const WidgetsDropdown = (props) => {
  const navigate = useNavigate()
  const [kutipanList, setKutipanList] = useState([])
  const [kutipanPercentage, setKutipanPercentage] = useState()
  const [kutipanLatestValue, setKutipanLatestValue] = useState()
  const [kutipanLatestDate, setKutipanLatestDate] = useState()

  useEffect(() => {
    setKutipanList(props.kutipanList)
  },[])

  useEffect(() => {
    const calculatePercentageChange = (oldValue, newValue) => {
      return ((newValue - oldValue) / oldValue) * 100
    }
  
    const calculateForKutipanWidget = () => {
      const hasMultipleQuotes = kutipanList.length > 1
      const hasSingleQuote = kutipanList.length === 1

      if (hasMultipleQuotes) {
        const percentageChange = calculatePercentageChange(
          kutipanList[1].total,
          kutipanList[0].total
        )
        const arrowIcon = percentageChange > 0 ? <CIcon icon={cilArrowTop} /> : <CIcon icon={cilArrowBottom} />;
        setKutipanPercentage(
          <span>
            {percentageChange.toFixed(2)}% {arrowIcon}
          </span>
        )
        setKutipanLatestValue(
          kutipanList[0].total.toLocaleString('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 0 })
        )
        setKutipanWidgetDate(kutipanList[0].createDate);
      } else if (hasSingleQuote) {
        const arrowIcon = <CIcon icon={cilArrowTop} />;
        setKutipanPercentage(
          <span>
            100% {arrowIcon}
          </span>
        );
        setKutipanLatestValue(kutipanList[0].total.toLocaleString('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 0 }))
        setKutipanWidgetDate(kutipanList[0].createDate);
      } else {
        setKutipanLatestDate('???')
        setKutipanPercentage('???')
        setKutipanLatestValue('???')
      }


    }

    const setKutipanWidgetDate = (createDate) => {
      let date = new Date(createDate)
      let day = date.getDate()
      let month = date.getMonth() + 1
      let year = date.getFullYear()

      day = day < 10 ? '0' + day : day
      month = month < 10 ? '0' + month : month

      setKutipanLatestDate("Tabung Jumaat " + day + '/' + month + '/' + year)
    }
  
    calculateForKutipanWidget()
  }, [kutipanList])

  return (
    <CRow>
      <CCol sm={6} lg={3}>
        <CWidgetStatsC
          className="mb-5"
          icon={<CIcon icon={cilUser} height={36} />}
          color="primary"
          inverse
          // progress={{ value: 100 }}
          text="Jumlah ahli khairat"
          title="Ahli Khairat"
          value={props.memberCount}
        />
      </CCol>

      <CCol sm={6} lg={3}>
        <CWidgetStatsC
          className="mb-5"
          icon={<CIcon icon={cilBadge} height={36} />}
          color="warning"
          inverse
          // progress={{ value: 100 }}
          text="Ahli khairat"
          title="Ahli Khairat Berbayar"
          value={`${(props.paidMemberCount / props.memberCount * 100).toFixed(2)} %`}
        />
      </CCol>
      
      <CCol sm={6} lg={3}>
      <CWidgetStatsC
          className="mb-5 hover-effect" 
          icon={<CIcon icon={cilCommentBubble} height={36} />}
          color="danger"
          inverse
          // progress={{ value: 100 }}
          text="Cadangan Baru"
          title="Cadangan Baru"
          value={props.cadanganCount}
          onClick={() => navigate('/cadangan/senarai')}
        />
      </CCol>
      
      <CCol sm={6} lg={3}>
        <CWidgetStatsA
          className="mb-4"
          color="success"
          value={
            <>
              {kutipanLatestValue}{' '}
              <span className="fs-6 fw-normal">
                ( {kutipanPercentage} )
              </span>
            </>
          }
          title={kutipanLatestDate} 
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="p-0">
                <CIcon icon={cilOptions} className="text-high-emphasis-inverse" />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem disabled>Download</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: props.kutipanChartValueTop5.map((item) => item.date),
                datasets: [
                  {
                    label: 'Tabung Jumaat',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-info'),
                    data: props.kutipanChartValueTop5.map((item) => item.total),
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                maintainAspectRatio: false,
                scales: {
                  x: {
                    grid: {
                      display: false,
                      drawBorder: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                  y: {
                    min: 500,
                    max: 3000,
                    display: false,
                    grid: {
                      display: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                },
                elements: {
                  line: {
                    borderWidth: 1,
                  },
                  point: {
                    radius: 4,
                    hitRadius: 10,
                    hoverRadius: 4,
                  },
                },
              }}
            />
          }
        />
      </CCol>
    </CRow>
  )
}

export default WidgetsDropdown
