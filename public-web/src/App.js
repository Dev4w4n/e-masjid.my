import React, { Component, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import './scss/style.scss'

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Copyright from './components/Copyright';

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)
// Containers
const Home = React.lazy(() => import('./Pages/Home'))
const Cadangan = React.lazy(() => import('./Pages/Cadangan'))
const Kariah = React.lazy(() => import('./Pages/Kariah'))

class App extends Component {
  render() {
    return (
      <HashRouter>
        <Suspense fallback={loading}>
          <Navbar />

          <Routes>
            <Route path="*" name="Home" element={<Home />} />
            <Route path="cadangan/" name="Cadangan" element={<Cadangan />} />
            <Route path="pendaftaran-anak-kariah/" name="Pendaftaran Anak Kariah" element={<Kariah />} />
          </Routes>

          <Footer />
          <Copyright />
          
        </Suspense>
      </HashRouter>
    )
  }
}

export default App
