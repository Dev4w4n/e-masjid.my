import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const TetapanMasjid = React.lazy(() => import('./views/tetapan/TetapanMasjid'))

// Khairat
const Daftar = React.lazy(() => import('./views/khairat/daftar/Daftar'))
const Carian = React.lazy(() => import('./views/khairat/carian/Carian'))
const Tetapan = React.lazy(() => import('./views/khairat/tetapan/Tetapan'))

// Tabung
const DaftarTabung = React.lazy(() => import('./views/tabung/daftar/Daftar'))
const CetakTabung = React.lazy(() => import('./views/tabung/cetak/Cetak'))
const TetapanTabung = React.lazy(() => import('./views/tabung/tetapan/Tetapan'))

// Tabung
const SenaraiCadangan = React.lazy(() => import('./views/cadangan/senarai/Senarai'))
const Qr = React.lazy(() => import('./views/cadangan/qr/Qr'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/khairat', name: 'Khairat', element: Carian, exact: true },
  { path: '/khairat/carian', name: 'Carian', element: Carian },
  { path: '/khairat/daftar/:paramId?', name: 'Daftar', element: Daftar },
  { path: '/khairat/tetapan', name: 'Tetapan', element: Tetapan },

  { path: '/tabung', name: 'Tabung', element: CetakTabung, exact: true },
  { path: '/tabung/cetak', name: 'Cetak', element: CetakTabung },
  { path: '/tabung/daftar/:paramId?', name: 'Daftar', element: DaftarTabung },
  { path: '/tabung/tetapan', name: 'Tetapan', element: TetapanTabung },

  { path: '/cadangan', name: 'Cadangan', element: SenaraiCadangan, exact: true },
  { path: '/cadangan/senarai', name: 'Senarai', element: SenaraiCadangan },
  { path: '/cadangan/qr', name: 'Qr', element: Qr },

  { path: '/tetapan', name: 'Tetapan Masjid', element: TetapanMasjid },
]

export default routes
