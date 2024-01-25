import { useState } from "react";
import { Link } from "react-router-dom";
import { logo } from "../assets/home";
import Container from "./Container";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import constants from '../constants/error.json';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const loginAjk = () => {
    axios.get('/dashboard')
    .then(response => {
      window.location.href = "http://localhost:3000";
    })
    .catch(error => {
      toast.error(constants.serviceDown, {
        position: 'bottom-center',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      })
    });
  }

  return (
    <nav className="py-2 z-40">
      <ToastContainer />
      <Container>
        <div className="flex items-center justify-between h-16">
          <div className="flex gap-4 items-center">
            <img className="h-[64px] w-[64px]" src={logo} alt="Logo E-Masjid.My" />
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className=" hover:bg-button-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </Link>

                <Link
                  // to="/"
                  className="hover:bg-button-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  E-Khairat
                </Link>
                <Link
                  // to="/"
                  className="hover:bg-button-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  E-Korban
                </Link>
                <Link
                  to="cadangan"
                  className="hover:bg-button-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Peti Cadangan
                </Link>
                <Link
                  // to="/"
                  className="hover:bg-button-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Hubungi Kami
                </Link>
              </div>
            </div>
          </div>

          <Link onClick={() => loginAjk()}>
            <div className="hidden md:block hover:bg-button-primary px-4 py-1 rounded-xl">
              Log Masuk AJK
            </div>
          </Link>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>

              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden transition-all" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-black">
              <Link
                to="/"
                className="hover:bg-primary-base hover:bg-button-primary hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                Home
              </Link>
              <Link
                to="/"
                className="hover:bg-primary-base hover:bg-button-primary hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                E-Khairat
              </Link>
              <Link
                to="/"
                className="hover:bg-primary-base hover:bg-button-primary hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                E-Korban
              </Link>
              <Link
                to="/"
                className="hover:bg-primary-base hover:bg-button-primary hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                Peti Cadangan
              </Link>
              <Link
                to="/"
                className="hover:bg-primary-base hover:bg-button-primary hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                Hubungi Kami
              </Link>
              <Link
                onClick={() => loginAjk()}
                className="hover:bg-primary-base bg-button-primary text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                Log Masuk AJK
              </Link>
            </div>
          </div>
        )}
      </Container>
    </nav>
  );
}
export default Navbar;
