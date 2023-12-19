import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter>
      <div>
        <span className="ms-1">&copy; 2023 Open Cloud Services </span>
        <a href="https://e-masjid.my" target="_blank" rel="noopener noreferrer">
          E-Masjid.my 
        </a>
        <span className="me-1"> (version 1.0)  Powered by</span>
        <a href="https://coreui.io" target="_blank" rel="noopener noreferrer">
          CoreUI
        </a>
        <span className="ms-1">&copy; 2023 creativeLabs.</span>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
