import { useState } from "react";
import { Link } from "react-router-dom";
import { logo } from "../assets/home";
import {google_login} from "../assets/images";
import Container from "./Container";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import constants from "../constants/error.json";
import {dynamicSubdomain, DOMAIN} from "../Config";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Set the environment-specific URL
  var loginUrl = "http://localhost:3000/dashboard";
  if (dynamicSubdomain !== "development") {
    loginUrl = `https://${dynamicSubdomain}.${DOMAIN}/ui`;
  }

  const loginAjk = async () => {
    if (dynamicSubdomain === "development") {
      window.location.href = loginUrl;
    }
    try {
      await axios.get("/dashboard");
      window.location.href = loginUrl; // Redirect on success
    } catch (error) {
      toast.error(constants.serviceDown, {
        position: "bottom-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  return (
    <nav className="py-2 z-40">
      <ToastContainer />
      <Container>
        <div className="flex items-center justify-between h-16">
          <div className="flex gap-4 items-center">
            <img
              className="h-[64px] w-[64px]"
              src={logo}
              alt="Logo E-Masjid.My"
            />
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className=" hover:bg-button-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </Link>
                <Link
                  to="pendaftaran-anak-kariah"
                  className="hover:bg-button-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Pendaftaran Anak Kariah
                </Link>
                <Link
                  to="cadangan"
                  className="hover:bg-button-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Peti Cadangan
                </Link>
              </div>
            </div>
          </div>

          <Link className="ml-auto" onClick={loginAjk}>
            <img src={google_login} className="h-[32px] w-[160px]" alt="Logo E-Masjid.My" />          
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
                to="pendaftaran-anak-kariah"
                className="hover:bg-primary-base hover:bg-button-primary hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                Pendaftaran Anak Kariah
              </Link>
              <Link
                to="cadangan"
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
            </div>
          </div>
        )}
      </Container>
    </nav>
  );
}
export default Navbar;
