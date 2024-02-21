import React, { useState, useRef } from "react";
import axios from 'axios';
import {
  CTabContent,
  CTabPane,
  CButton,
  CForm,
  CFormTextarea,
  CFormInput,
} from "@coreui/react";
import Emoji from "../components/Cadangan/Emoji";
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { saveCadangan } from "../service/Cadangan/CadanganApi";
import constants from '../constants/error.json';

export default function Cadangan() {
  const [emojiValue, setEmojiValue] = useState(-1);
  const [activeKey, setActiveKey] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const inputCadangan = useRef();
  const inputNama = useRef();
  const inputEmail = useRef(null);

  const handleNextClick = () => {
    if(emojiValue === -1) {
      toast.error(constants.penilaianError, {
        position: 'bottom-center',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      })
    } else {
      setActiveKey(activeKey + 1);
    }
  };

  const handlePhoneChange = (event) => {
    const inputValue = event.target.value;
    // Check if the entered phone number is not blank
    if (inputValue.trim() === '' || /^[0-9]*$/.test(inputValue)) {
      setPhoneNumber(inputValue);
      setPhoneNumberError('');
    }
    else
    {
      setPhoneNumberError(constants.invalidPhone);
    }
  };

  const handlePhoneBlur = (event) => {
    const inputValue = event.target.value;
    if (inputValue.trim() === '')
    {
      setPhoneNumberError('');
    }
  };

  const handleEmailChange = (event) => {
    const inputValue = event.target.value;
    if (inputValue.trim() === '') {
      setEmail(inputValue);
      setEmailError('');
    } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)) {
      setEmail(inputValue);
      setEmailError('');
    } else {
      setEmailError(constants.invalidEmail);
    }
  };

  const handleEmailBlur = (event) => {
    const inputValue = event.target.value;
    if (inputValue.trim() === '')
    {
      setEmailError('');
    }
  };

  const handleSubmitClick = async () => {
    try {
      const nama = inputNama.current.value ? inputNama.current.value : null;
      const emailValue = email ? email : null;
      const phoneValue = phoneNumber ? phoneNumber : null;

      const json ={
        "cadanganType": {
            "id": 1,
        },
        "cadanganText": inputCadangan.current.value,
        "cadanganNama": nama,
        "cadanganEmail": emailValue,
        "cadanganPhone": phoneValue,
        "tindakanText": null,
        "isOpen": true,
        "score": emojiValue+1,
        "createDate": new Date().getTime(),
      }
      
      await saveCadangan(json)
      setActiveKey(activeKey + 1);
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error) && !error.response) {
        // It's a network error
        toast.error(constants.serviceDown, {
          position: 'bottom-center',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
        });
      } 
    }
  }
  const handleEmojiClickParent = (index) => {
    setEmojiValue(index);
  };

  return (
    <section className="bg-white">
      <ToastContainer />
      <div className="py-8 lg:py-16 px-4 mx-auto max-w-screen-md">
        <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-center text-gray-900">
          Cadangan / Aduan
        </h2>
        <p className="mb-8 lg:mb-16 font-light text-center text-gray-500 sm:text-lg">
          Maklum balas anda amat dialu-alukan.
        </p>

        <CForm className="space-y-8 flex flex-col">
          <CTabContent>
            <CTabPane role="tabpanel" aria-labelledby="home-tab-pane" visible={activeKey === 1}>
              <p className="text-md text-gray-700 leading-tight text-center mt-8 mb-1">
                Penilaian anda tentang masjid ini
              </p>
              <Emoji onEmojiClick={handleEmojiClickParent} />
              <div className="mb-6 pt-4">
                <p className="text-md text-gray-700 leading-tight text-center mt-8 mb-1">
                  Pesanan anda
                </p>
                <CFormTextarea
                  ref={inputCadangan}
                  maxLength="1024"
                  rows={4}
                  type="text"
                  placeholder="Masukkan pesanan anda di sini... (Jika ada)"
                  name="visitormessage"
                  className="w-full px-4 py-3 rounded-xl text-gray-700 font-medium border-solid border-2 border-gray-200"
                ></CFormTextarea>
              </div>
            </CTabPane>
            <CTabPane role="tabpanel" aria-labelledby="detail-tab-pane" visible={activeKey === 2} >
              <p className="text-md text-gray-700 leading-tight text-center mt-8 mb-5">
                Masukkan maklumat berikut jika anda ingin dihubungi pihak masjid berkenaan cadangan/aduan anda.
              </p>
              <div className="mb-6">
                <CFormInput
                  ref={inputNama}
                  maxLength="128"
                  type="text"
                  placeholder="Nama"
                  name="fullname"
                  className="w-full px-4 py-3 rounded-md text-gray-700 font-medium border-solid border-2 border-gray-200"
                />
              </div>
              <div className="mb-6">
                <CFormInput
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  onBlur={handlePhoneBlur}
                  maxLength="16"
                  type="text"
                  placeholder="No telefon"
                  name="mobile"
                  className="w-full px-4 py-3 rounded-md text-gray-700 font-medium border-solid border-2 border-gray-200"
                />
                 {phoneNumberError && (
                    <p className="text-red-500 text-sm mt-2">{phoneNumberError}</p>
                 )}
              </div>
              <div className="mb-6">
                <CFormInput
                 ref={inputEmail}
                 maxLength="120"
                 type="email"
                 placeholder="Alamat email"
                 name="email"
                 className="w-full px-4 py-3 rounded-md text-gray-700 font-medium border-solid border-2 border-gray-200"
                 onChange={handleEmailChange}
                 onBlur={handleEmailBlur}
                />
                 {emailError && (
                    <p className="text-red-500 text-sm mt-2">{emailError}</p>
                 )}
              </div>
            </CTabPane>
            <CTabPane role="tabpanel" aria-labelledby="thanks-tab-pane" visible={activeKey === 3} >
              <p className="text-md text-gray-700 leading-tight text-center mt-8 mb-5">
                Terima kasih. Cadangan / Aduan anda telah dihantar ke pihak pengurusan masjid.
              </p>
            </CTabPane>
          </CTabContent>

          <div className="flex gap-3 ml-auto">
            {activeKey > 1 && activeKey < 3 &&  (
              <CButton onClick={() => setActiveKey(activeKey - 1)} className="flex items-center text-sm font-medium focus:outline-none border border-gray-300 rounded-lg shadow-sm text-center text-gray-700 bg-white hover:bg-gray-100">
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
            {activeKey < 2 && (
              <CButton onClick={() => handleNextClick()} className="flex items-center text-sm font-medium text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300">
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
            {activeKey === 2 && (
              <CButton onClick={() => handleSubmitClick()} className="flex items-center text-sm font-medium text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300">
                <span className="mr-2">Hantar</span>
              </CButton>
            )}
            {activeKey > 2 && (
              <CButton onClick={() => (window.location.href = "/web")} className="flex items-center text-sm font-medium text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300">
                <span className="mr-2">Kembali ke Laman Utama</span>
              </CButton>
            )}
          </div>
        </CForm>
      </div>
    </section>
  );
}
