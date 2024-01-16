import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilMoney, 
  cilGift, 
  cilCommentBubble, 
  cilSpeedometer, 
  cibGnu, 
  cilGroup,
  cilSettings, 
  cilDollar
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      // text: 'NEW',
    },
  },
  {
    component: CNavTitle,
    name: 'Sistem Masjid',
  },
  {
    component: CNavGroup,
    name: 'Khairat',
    to: '/khairat',
    icon: <CIcon icon={cilGift} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Daftar',
        to: '/khairat/daftar',
      },
      {
        component: CNavItem,
        name: 'Carian',
        to: '/khairat/carian',
      },
      {
        component: CNavItem,
        name: 'Tetapan',
        to: '/khairat/tetapan',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Tabung',
    to: '/tabung',
    icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Daftar',
        to: '/tabung/daftar',
      },
      {
        component: CNavItem,
        name: 'Cetak',
        to: '/tabung/cetak',
      },
      {
        component: CNavItem,
        name: 'Tetapan',
        to: '/tabung/tetapan',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Cadangan',
    to: '/cadangan',
    icon: <CIcon icon={cilCommentBubble} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Senarai',
        to: '/cadangan/senarai',
      },
      {
        component: CNavItem,
        name: 'Cetak QR',
        to: '/cadangan/cetak',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Tetapan Masjid',
    to: '/tetapan',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      // text: 'NEW',
    },
  },
  {
    component: CNavTitle,
    name: 'Akan datang',
  },
  {
    component: CNavGroup,
    name: 'AJK',
    to: '/ajk',
    icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
    items: [
      // {
      //   component: CNavItem,
      //   name: 'Senarai',
      //   to: '/cadangan/daftar',
      // },
      // {
      //   component: CNavItem,
      //   name: 'QR code',
      //   to: '/cadangan/cetak',
      // },
    ],
  },
  {
    component: CNavGroup,
    name: 'Kewangan',
    to: '/kewangan',
    icon: <CIcon icon={cilDollar} customClassName="nav-icon" />,
    items: [
      // {
      //   component: CNavItem,
      //   name: 'Senarai',
      //   to: '/cadangan/daftar',
      // },
      // {
      //   component: CNavItem,
      //   name: 'QR code',
      //   to: '/cadangan/cetak',
      // },
    ],
  },
  {
    component: CNavGroup,
    name: 'E-Korban',
    to: '/korban',
    icon: <CIcon icon={cibGnu} customClassName="nav-icon" />,
    items: [
      // {
      //   component: CNavItem,
      //   name: 'Senarai',
      //   to: '/cadangan/daftar',
      // },
      // {
      //   component: CNavItem,
      //   name: 'QR code',
      //   to: '/cadangan/cetak',
      // },
    ],
  },
]

export default _nav
