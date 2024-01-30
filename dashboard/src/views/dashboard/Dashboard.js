import React, { useState , useEffect } from 'react'
import {
  CSpinner,
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCol,
  CProgress,
  CRow,
} from '@coreui/react'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle, hexToRgba } from '@coreui/utils'
import CIcon from '@coreui/icons-react'
import {
  cilCloudDownload,
} from '@coreui/icons'

import WidgetsDropdown from '../widgets/WidgetsDropdown'
import { getMemberCount } from 'src/service/khairat/MembersApi'
import { getPaidMemberCountCurrentYear } from 'src/service/khairat/MembersApi'
import { getKutipanByTabung } from 'src/service/tabung/KutipanApi';
import { getCadanganCount } from 'src/service/cadangan/CadanganApi'

const Dashboard = () => {
  const [loading, setLoading] = useState(false)
  const [memberCount, setMemberCount] = useState(0)
  const [paidMemberCount, setPaidMemberCount] = useState(0)
  const [kutipanList, setKutipanList] = useState([])
  const [kutipanChartValue, setKutipanChartValue] = useState([])
  const [kutipanChartValueTop5, setKutipanChartValueTop5] = useState([])
  const [cadanganCount, setCadanganCount] = useState(0)

  useEffect(() => {
    const calculatePercentageChange = (oldValue, newValue) => {
      return ((newValue - oldValue) / oldValue) * 100
    }
    const setKutipanWidgetDate = (createDate) => {
      let date = new Date(createDate)
      let day = date.getDate()
      let month = date.getMonth() + 1
      let year = date.getFullYear()

      day = day < 10 ? '0' + day : day
      month = month < 10 ? '0' + month : month

      return day + '/' + month + '/' + year
    }
  
    const calculateForKutipanWidget = () => {
      if (kutipanList.length > 1) {
        const data = kutipanList.map((kutipan) => ({
          total: kutipan.total,
          date: setKutipanWidgetDate(kutipan.createDate),
        }));
        setKutipanChartValue(data.slice().reverse());
        setKutipanChartValueTop5(data.slice(0, 4).reverse());
      }
    }

    calculateForKutipanWidget()
  }, [kutipanList])
  

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        const data = await getKutipanByTabung(1)
        if (data.length > 0) {
          const kutipanData = data.map((item) => ({
            id: item.id,
            tabung: item.tabung.name,
            createDate: item.createDate,
            total: item.total,
          }))
          setKutipanList(kutipanData)
        } else {
          setKutipanList([])
        }

        const response = await getCadanganCount()
        setCadanganCount(response[0])
        const count = await getPaidMemberCountCurrentYear();
        setPaidMemberCount(count)
        const countMember = await getMemberCount();
        setMemberCount(countMember)

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div><CSpinner color="primary" /></div>
  }

  // const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

  const progressExample = [
    // { title: 'Visits', value: '29.703 Users', percent: 40, color: 'success' },
    // { title: 'Unique', value: '24.093 Users', percent: 20, color: 'info' },
    // { title: 'Pageviews', value: '78.706 Views', percent: 60, color: 'warning' },
    // { title: 'New Users', value: '22.123 Users', percent: 80, color: 'danger' },
    // { title: 'Bounce Rate', value: 'Average Rate', percent: 40.15, color: 'primary' },
  ]


  return (
    <>
      <WidgetsDropdown
        memberCount={memberCount}
        paidMemberCount={paidMemberCount}
        kutipanList={kutipanList}
        kutipanChartValueTop5={kutipanChartValueTop5} 
        cadanganCount={cadanganCount} />
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="traffic" className="card-title mb-0">
                Trend Kutipan Tabung Jumaat
              </h4>
              <div className="small text-medium-emphasis">Disember 2023 - Sekarang</div>
            </CCol>
            <CCol sm={7} className="d-none d-md-block">
              <CButton color="primary" className="float-end">
                <CIcon icon={cilCloudDownload} />
              </CButton>
            </CCol>
          </CRow>
          <CChartLine
            style={{ height: '300px', marginTop: '40px' }}
            data={{
              labels: kutipanChartValue.map((item) => item.date),
              datasets: [
                {
                  label: 'Tabung Jumaat',
                  backgroundColor: hexToRgba(getStyle('--cui-info'), 10),
                  borderColor: getStyle('--cui-info'),
                  pointHoverBackgroundColor: getStyle('--cui-info'),
                  borderWidth: 2,
                  data: kutipanChartValue.map((item) => item.total),
                  fill: true,
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  grid: {
                    drawOnChartArea: false,
                  },
                },
                y: {
                  ticks: {
                    beginAtZero: true,
                    maxTicksLimit: 5,
                    stepSize: Math.ceil(250 / 5),
                    max: 250,
                  },
                },
              },
              elements: {
                line: {
                  tension: 0.4,
                },
                point: {
                  radius: 0,
                  hitRadius: 10,
                  hoverRadius: 4,
                  hoverBorderWidth: 3,
                },
              },
            }}
          />
        </CCardBody>
        <CCardFooter>
          <CRow xs={{ cols: 1 }} md={{ cols: 5 }} className="text-center">
            {progressExample.map((item, index) => (
              <CCol className="mb-sm-2 mb-0" key={index}>
                <div className="text-medium-emphasis">{item.title}</div>
                <strong>
                  {item.value} ({item.percent}%)
                </strong>
                <CProgress thin className="mt-2" color={item.color} value={item.percent} />
              </CCol>
            ))}
          </CRow>
        </CCardFooter>
      </CCard>
    </>
  )
}

export default Dashboard
