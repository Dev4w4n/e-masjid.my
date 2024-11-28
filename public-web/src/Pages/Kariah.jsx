import React, { useState } from "react";
import { CTabContent, CButton, CForm } from "@coreui/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Perakuan from "../components/Kariah/NavItem/Perakuan/Perakuan";
import NoPengenalan from "../components/Kariah/NavItem/NoPengenalan/NoPengenalan";
import MaklumatDiri from "../components/Kariah/NavItem/MaklumatDiri/MaklumatDiri";
import Pengesahan from "../components/Kariah/NavItem/Pengesahan/Pengesahan";
import DaftarBerjaya from "../components/Kariah/NavItem/DaftarBerjaya/DaftarBerjaya";
import TopNav from "../components/Kariah/TopNav";

export default function Kariah() {
  const [activeKey, setActiveKey] = useState(1);

  const handleNextClick = () => {
    setActiveKey(activeKey + 1);
  };

  return (
    <section className="bg-white">
      <ToastContainer />
      <div className="py-8 lg:py-16 px-4 mx-auto max-w-screen-md">
        <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-center text-gray-900">
          Pendaftaran Anak Kariah
        </h2>
        <TopNav step={activeKey} />
        <CForm className="space-y-8 flex flex-col">
          <CTabContent>
            <Perakuan activeKey={activeKey === 1} step={1} />
            <NoPengenalan activeKey={activeKey === 2} step={2} />
            <MaklumatDiri activeKey={activeKey === 3} step={3} />
            <Pengesahan activeKey={activeKey === 4} step={4} />
            <DaftarBerjaya activeKey={activeKey === 5} step={5} />
          </CTabContent>

          {/* <!-- Wizard buttons --> */}
          <div className="flex gap-3 ml-auto">
            {activeKey > 1 && (
              <CButton
                onClick={() => setActiveKey(activeKey - 1)}
                className="flex items-center text-sm font-medium focus:outline-none border border-gray-300 rounded-lg shadow-sm text-center text-gray-700 bg-white hover:bg-gray-100"
              >
                <svg
                  className="w-5"
                  fill="currentColor"
                  viewBox="0 0 25 25"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M24 12.001H2.914l5.294-5.295-.707-.707L1 12.501l6.5 6.5.707-.707-5.293-5.293H24v-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-2">Kembali</span>
              </CButton>
            )}
            {activeKey !== 1 && activeKey < 5 && (
              <CButton
                onClick={() => handleNextClick()}
                className="flex items-center text-sm font-medium text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300"
              >
                <span className="mr-2">Teruskan</span>
                <svg
                  className="w-5"
                  fill="currentColor"
                  viewBox="0 0 25 25"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="m17.5 5.999-.707.707 5.293 5.293H1v1h21.086l-5.294 5.295.707.707L24 12.499l-6.5-6.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </CButton>
            )}
            {activeKey === 1 && (
              <CButton
                onClick={() => (window.location.href = "/web")}
                className="flex items-center text-sm font-medium text-white rounded-lg bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300"
              >
                <span className="mr-2">BATAL</span>
              </CButton>
            )}
            {activeKey === 1 && (
              <CButton
                onClick={() => handleNextClick()}
                className="flex items-center text-sm font-medium text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300"
              >
                <span className="mr-2">SETUJU & Teruskan</span>
                <svg
                  className="w-5"
                  fill="currentColor"
                  viewBox="0 0 25 25"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="m17.5 5.999-.707.707 5.293 5.293H1v1h21.086l-5.294 5.295.707.707L24 12.499l-6.5-6.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </CButton>
            )}
          </div>
        </CForm>
      </div>
    </section>
  );
}
