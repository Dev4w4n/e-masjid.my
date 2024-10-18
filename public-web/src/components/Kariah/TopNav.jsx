import React, { useState } from 'react';

import {
  CNav,
  CNavItem,
  CNavLink,
} from '@coreui/react';

export default function TopNav({ activeKey }) {

  return (
    <CNav className="justify-content-center">
      <CNavItem>
        <CNavLink href="">Perakuan</CNavLink>
      </CNavItem>
      <CNavItem> _ </CNavItem>
      <CNavItem>
        <CNavLink href="">No Pengenalan</CNavLink>
      </CNavItem>
      <CNavItem> _ </CNavItem>
      <CNavItem>
        <CNavLink href="">Maklumat Diri</CNavLink>
      </CNavItem>
      <CNavItem> _ </CNavItem>
      <CNavItem>
        <CNavLink href="">Pengesahan</CNavLink>
      </CNavItem>
      <CNavItem> _ </CNavItem>
      <CNavItem>
        <CNavLink href="">Daftar Berjaya</CNavLink>
      </CNavItem>
    </CNav>
  );
}