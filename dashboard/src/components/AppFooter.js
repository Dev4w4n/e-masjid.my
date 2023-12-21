import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter>
      <div>
        <span className="ms-1">Powered by Open Cloud Services &copy; 2023 </span>
        <a href="https://e-masjid.my" target="_blank" rel="noopener noreferrer">
          E-Masjid.my 
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
