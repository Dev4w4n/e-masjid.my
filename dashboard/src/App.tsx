import React from 'react'
import { Component, Suspense } from 'react'
import { BrowserRouter as Router, Route, Routes, HashRouter } from 'react-router-dom'
import { config } from '@/config'
import { ReactKeycloakProvider } from '@react-keycloak/web'
import { keycloak } from '@/utils/Keycloak'

import './scss/style.scss'

import PrivateRoute from '@/components/auth/PrivateRoute'
import { AuthClientError } from '@react-keycloak/core'

const initOptions = { pkceMethod: 'S256' }

const handleOnEvent = (event: string, error: AuthClientError | undefined) => {
  if (event === 'onAuthSuccess') {
    if (keycloak.authenticated) {
      console.log('Authenticated ')
    } else {
      console.error(error)
    }
  }
}

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

// Containers
// @ts-expect-error ???
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

class App extends Component {
  render() {
    if (config.url.USE_KEYCLOAK) {
      return (
        <ReactKeycloakProvider
          authClient={keycloak}
          initOptions={initOptions}
          LoadingComponent={loading}
          onEvent={(event, error) => handleOnEvent(event, error)}
        >
          <HashRouter>
            <Suspense fallback={loading}>
              <Routes>
                <Route
                  path="*"
                  element={
                    // @ts-expect-error the only working way to do it
                    <PrivateRoute>
                      <DefaultLayout />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </Suspense>
          </HashRouter>
        </ReactKeycloakProvider>
      )
    } else {
      return (
        <Router>
          <Suspense fallback={loading}>
            <Routes>
              <Route path="*" element={<DefaultLayout />} />
            </Routes>
          </Suspense>
        </Router>
      )
    }
  }
}

export default App
