import React, { useState, useEffect, useRef } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormInput,
  CFormSelect,
  CButton,
} from '@coreui/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getTabung } from 'src/service/tabung/TabungApi';
import { saveKutipan } from 'src/service/tabung/KutipanApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Daftar = () => {
  const [tabungList, setTabungList] = useState([]);
  const [selectedTabung, setSelectedTabung] = useState('');
  const [input1, setInput1] = useState({ mask: Number });
  const [input5, setInput5] = useState({ mask: Number });
  const [input10, setInput10] = useState({ mask: Number });
  const [input20, setInput20] = useState({ mask: Number });
  const [input50, setInput50] = useState({ mask: Number });
  const [input100, setInput100] = useState({ mask: Number });
  const [total, setTotal] = useState(0);
  const [startDate, setStartDate] = useState(new Date());
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);
  const selectRef = useRef(null);

  useEffect(() => {
    const fetchTabung = async () => {
      const data = await getTabung();
      if (data.length > 0) {
        const tabungList = data.map((tabung) => ({
          label: tabung.name,
          value: tabung.id,
        }))
        tabungList.unshift({ label: 'Pilih tabung', value: '' });
        setTabungList(tabungList);
      }
    }
    fetchTabung()
  }, [])
  useEffect(() => {
    if (selectRef.current) {
      selectRef.current.focus()
    }

    handleReset()
  }, [selectedTabung])

  useEffect(() => {
    const updateTotal = () => {
      setTotal(
        input1 * 1 +
        input5 * 5 +
        input10 * 10 +
        input20 * 20 +
        input50 * 50 +
        input100 * 100
      );
    };
    updateTotal();
  }, [input1, input5, input10, input20, input50, input100]);

  const handleInputChange = (value, setInput) => {
    setInput(parseInt(value, 10) || 0);
  };

  const handleSelectChange = (value) => {
    setSelectedTabung(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (input1 === '' ||
    input1 === null ||
    input1 === 'undefined' ||
    input5 === '' ||
    input5 === null ||
    input5 === 'undefined' ||
    input10 === '' ||
    input10 === null ||
    input10 === 'undefined' ||
    input20 === '' ||
    input20 === null ||
    input20 === 'undefined' ||
    input50 === '' ||
    input50 === null ||
    input50 === 'undefined' ||
    input100 === '' ||
    input100 === null ||
    input100 === 'undefined') {
      toast.error('Kutipan tabung gagal disimpan', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      })
    } else {
      callKutipanApi()
    }

    toast.success('Kutipan tabung berjaya disimpan', {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    })

    handleReset()
  };

  const handleReset = () => {
    // Reset the form fields
    if (formRef.current) {
      formRef.current.reset();
    }

    setInput1(0);
    setInput5(0);
    setInput10(0);
    setInput20(0);
    setInput50(0);
    setInput100(0);
    setTotal(0);
    setStartDate(new Date());
    selectRef.current.focus()
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
  };

  const callKutipanApi = async () => {
    const kutipan = {
      tabung: { id: selectedTabung },
      createDate: startDate.getTime(),
      total1c: 0,
      total5c: 0,
      total10c: 0,
      total20c: 0,
      total50c: 0,
      total1d: input1,
      total5d: input5,
      total10d: input10,
      total20d: input20,
      total50d: input50,
      total100d: input100,
    }

    try {
      await saveKutipan(kutipan);
    } catch (error) {
      console.error(error)
    }
    
  }

  return (
    <CRow>
      <ToastContainer />
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Daftar kutipan tabung</strong>
          </CCardHeader>
          <CCardBody>
            <p className="text-medium-emphasis small">
              Sila masukkan jumlah dinominasi kutipan tabung.
            </p>
            <CForm
              id="daftarForm"
              validated={validated}
              onSubmit={handleSubmit}
            >
              <div className="mb-3">
                <CFormSelect
                  aria-label="Pilih tabung"
                  options={tabungList}
                  value={selectedTabung}
                  ref={selectRef}
                  onChange={(e) => handleSelectChange(e.target.value)}
                />
              </div>
              {['1', '5', '10', '20', '50', '100'].map((value) => (
                <CRow key={value}>
                  <CCol>{`RM ${value}`}</CCol>
                  <CCol>X</CCol>
                  <CCol>
                    <CFormInput
                      id={`txtInput${value}`}
                      placeholder="0"
                      value={eval(`input${value}`)}
                      onChange={(e) =>
                        handleInputChange(e.target.value, eval(`setInput${value}`))
                      }
                    />
                  </CCol>
                </CRow>
              ))}
              <br />
              <CRow>
                <CCol></CCol>
                <CCol></CCol>
                <CCol>
                  JUMLAH ={' '}
                  {total.toLocaleString('en-MY', {
                    style: 'currency',
                    currency: 'MYR',
                  })}
                </CCol>
              </CRow>
              <br />
              <CRow>
                <CCol>
                  Tarikh:{' '}
                  <DatePicker
                    id="startDate"
                    dateFormat="dd/MM/yyyy"
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                  />
                </CCol>
              </CRow>
              <br />
              <div className="button-action-container">
                <CButton color="primary" size="sm" type="submit"
                className={`custom-action-button ${loading ? 'loading' : ''}`}>
                  {loading ? (
                    <>
                      {/* <CSpinner size="sm" color="primary" /> */}
                      <span> Sila tunggu</span>
                    </>
                  ) : (
                    'Simpan'
                  )}
                </CButton>
                <CButton onClick={handleReset} color="secondary" size="sm"
                className="custom-action-button">
                  Kosongkan semua
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Daftar;
