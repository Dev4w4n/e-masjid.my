import React from 'react'

import { CFooter } from '@coreui/react'

import { config } from '@/config'

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
          &copy; 2023-2024 ({BUILD})
        </span>
      </div>

      <div>
        <span className="ms-2">
          <a
            href="https://cdn.e-masjid.my/volume/DASAR.PRIVASI.pdf"
            target="_blank"
            rel="noreferrer"
          >
            Dasar Privasi
          </a>
        </span>
        <span className="ms-2">
          <a
            href="https://cdn.e-masjid.my/volume/TERMA.PERKHIDMATAN.pdf"
            target="_blank"
            rel="noreferrer"
          >
            Terma Perkhidmatan
          </a>
        </span>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
