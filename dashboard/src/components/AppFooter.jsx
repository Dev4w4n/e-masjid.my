import React from 'react'
import { CFooter } from '@coreui/react'
import { config } from '../Config'
const BUILD = config.version.BUILD

const AppFooter = () => {
  return (
    <CFooter>
      <div>
        <span className="ms-1">
          Powered by{' '}
          <a href="https://e-masjid.my" target="_blank" rel="noreferrer">
            E-Masjid.my
          </a>{' '}
          &copy; 2023-2024{' '} ({BUILD})
        </span>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
