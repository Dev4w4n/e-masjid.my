import React from 'react'
import Kariah from './Pages/Kariah'

// const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// // Khairat
// const Daftar = React.lazy(() => import('./views/khairat/daftar/Daftar'))
// const Carian = React.lazy(() => import('./views/khairat/carian/Carian'))
// const Tetapan = React.lazy(() => import('./views/khairat/tetapan/Tetapan'))

// // Tabung
// const DaftarTabung = React.lazy(() => import('./views/tabung/daftar/Daftar'))
// const CetakTabung = React.lazy(() => import('./views/tabung/cetak/Cetak'))
// const TetapanTabung = React.lazy(() => import('./views/tabung/tetapan/Tetapan'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/pendaftaran-anak-kariah', name: 'Pendaftaran Anak Kariah', element: Kariah, exact: true },
//   { path: '/dashboard', name: 'Dashboard', element: Dashboard },
//   { path: '/khairat', name: 'Khairat', element: Carian, exact: true },
//   { path: '/khairat/carian', name: 'Carian', element: Carian },
//   { path: '/khairat/daftar/:paramId?', name: 'Daftar', element: Daftar },
//   { path: '/khairat/tetapan', name: 'Tetapan', element: Tetapan },

//   { path: '/tabung', name: 'Tabung', element: CetakTabung, exact: true },
//   { path: '/tabung/cetak', name: 'Cetak', element: CetakTabung },
//   { path: '/tabung/daftar/:paramId?', name: 'Daftar', element: DaftarTabung },
//   { path: '/tabung/tetapan', name: 'Tetapan', element: TetapanTabung },

//   { path: '/cadangan', name: 'Cadangan', element: CetakTabung, exact: true },
//   { path: '/cadangan/cetak', name: 'Cetak', element: CetakTabung },
//   { path: '/cadangan/daftar/:paramId?', name: 'Daftar', element: DaftarTabung },
//   { path: '/cadangan/tetapan', name: 'Tetapan', element: TetapanTabung },
]
export default routes
