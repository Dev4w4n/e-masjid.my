import React, { useState, useEffect, useRef } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CModal,
  CModalBody,
  CModalFooter,
  CFormSelect,
  CButton,
  CSpinner,
  CForm,
  CFormInput, CModalHeader, CModalTitle

} from '@coreui/react'
import { getKutipan } from 'src/service/tabung/KutipanApi'
import { getTabung } from 'src/service/tabung/TabungApi'
import DataTable from 'react-data-table-component'
import { cilInfo, cilPrint, cilPencil, cilBasket } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useReactToPrint } from 'react-to-print'
import DenominasiPrint from 'src/components/print/tabung/DenominasiPrint'
import PenyataBulananSelector from 'src/components/tabung/PenyataBulananSelector'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getKutipanByTabungBetweenCreateDate } from 'src/service/tabung/KutipanApi'
import { updateKutipan, deleteKutipan } from 'src/service/tabung/KutipanApi'

const toastConfig = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'light',
}


const dateIntParse = (dateVal) => {
  let date = new Date(dateVal);
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  day = day < 10 ? '0' + day : day;
  month = month < 10 ? '0' + month : month;

  return day + '/' + month + '/' + year;
}

const amountFormatter = (total) => {
  return total ? total.toLocaleString('ms-MY', { style: 'currency', currency: 'MYR' }) : ''
}

const columns = [
  {
    name: 'Tarikh',
    selector: (row) => dateIntParse(row.createDate)
  },
  {
    name: 'Jenis Tabung',
    selector: (row) => row.tabung,
  },
  {
    name: 'Jumlah',
    selector: (row) => amountFormatter(row.total),
  },
  {
    name: 'Tindakan',
    selector: (row) => row.action,
  },
]

const Cetak = () => {
  const [loading, setLoading] = useState(false)
  const [tabungList, setTabungList] = useState([])
  const [kutipanList, setKutipanList] = useState([])
  const [selectedTabung, setSelectedTabung] = useState('')
  const selectRef = useRef(null);
  const componentRef = useRef();
  const [visibleXL, setVisibleXL] = useState(false)
  const [penyata, setPenyata] = useState()
  const [visibleBulanan, setVisibleBulanan] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [selectedTabungName, setSelectedTabungName] = useState('')
  const [visibleEditModal, setVisibleEditModal] = useState(false)
  const [jumlahKutipan, setJumlahKutipan] = useState(false)
  const [moneyDenomination, setMoneyDenomination] = useState(['1', '5', '10', '20', '50', '100']);
  const [input1, setInput1] = useState({ mask: Number });
  const [input5, setInput5] = useState({ mask: Number });
  const [input10, setInput10] = useState({ mask: Number });
  const [input20, setInput20] = useState({ mask: Number });
  const [input50, setInput50] = useState({ mask: Number });
  const [input100, setInput100] = useState({ mask: Number });
  const [input1C, setInput1C] = useState({ mask: Number });
  const [input5C, setInput5C] = useState({ mask: Number });
  const [input10C, setInput10C] = useState({ mask: Number });
  const [input20C, setInput20C] = useState({ mask: Number });
  const [input50C, setInput50C] = useState({ mask: Number });
  const [isCents, setIsCents] = useState()
  const [total, setTotal] = useState(0);
  const [startDate, setStartDate] = useState(new Date());
  const [validated, setValidated] = useState(false);
  const [idNumber, setIdNumber] = useState();
  const formRef = useRef(null);



  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  useEffect(() => {
    const fetchTabung = async () => {
      setLoading(true)
      try {
        const data = await getTabung()
        if (data.length > 0) {
          const tabungList = data.map((tabung) => ({
            label: tabung.name,
            value: tabung.id,
          }))
          tabungList.unshift({ label: 'Pilih tabung', value: '' })
          setTabungList(tabungList)
        }
      } catch (error) {
        console.error('Error fetchTabung:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTabung()
  }, [])

  const [page, setPage] = useState(1)
  const [size, setSize] = useState(25)
  const [totalRows, setTotalRows] = useState(0)

  const fetchKutipan = async (_page, _size) => {
    if (!selectedTabung) {
      setKutipanList([]);
      return;
    }
    setLoading(true)

    const startOfMonth = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth(),
      1
    );
    const endOfMonth = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() + 1,
      0
    );

    try {

      const data = await getKutipanByTabungBetweenCreateDate(
        selectedTabung,
        startOfMonth.getTime(),
        endOfMonth.getTime(),
        _page, _size
      );
      setTotalRows(data?.total);


      if (data?.content?.length > 0) {
        const kutipanData = data?.content?.map((item) => ({
          id: item.id,
          tabung: item.tabung.name,
          createDate: item.createDate,
          total: item.total,
          action: (
            <>
              <CIcon icon={cilPencil} className="me-4 " onClick={() => editPreview(item.id)} size="lg" />
              <CIcon icon={cilBasket} className="me-4" onClick={() => deleteConfirmation(item)} title="Delete" size="lg" />
              <CIcon icon={cilPrint} className="me-4" onClick={() => printPreview(item.id)} size="lg" />
            </>
          ),
        }))
        setKutipanList(kutipanData)
      } else {
        setKutipanList([]);
      }
    } catch (error) {
      console.error('Error fetching kutipan:', error)
    } finally {
      setLoading(false)
    }

  };

  useEffect(() => {
    if (isCents === true) {
      setMoneyDenomination(['1', '5', '10', '20', '50', '100', '1C', '5C', '10C', '20C', '50C']);
    } else {
      setMoneyDenomination(['1', '5', '10', '20', '50', '100']);
    }
  }, [visibleEditModal])

  useEffect(() => {
    fetchKutipan(1, size)
  }, [selectedTabung, selectedMonth, jumlahKutipan])

  const handlePageChange = page => {
    fetchKutipan(page, size);
    setPage(page);
  };
  const handlePerRowsChange = async (newSize, page) => {
    setSize(newSize)
    fetchKutipan(page, newSize)
  };

  const handleInputChange = (value, setInput) => {
    setInput(parseInt(value, 10) || 0);
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
      input100 === 'undefined' ||
      input1C === '' ||
      input1C === null ||
      input1C === 'undefined' ||
      input5C === '' ||
      input5C === null ||
      input5C === 'undefined' ||
      input10C === '' ||
      input10C === null ||
      input10C === 'undefined' ||
      input20C === '' ||
      input20C === null ||
      input20C === 'undefined' ||
      input50C === '' ||
      input50C === null ||
      input50C === 'undefined') {
      toast.error('Kutipan tabung gagal disimpan', toastConfig)
    } else {
      updateKutipanApi()
    }

    toast.success('Kutipan tabung berjaya disimpan', toastConfig)
    handleReset()
    setVisibleEditModal(false)
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
    setInput1C(0);
    setInput5C(0);
    setInput10C(0);
    setInput20C(0);
    setInput50C(0);
    setTotal(0);
    setStartDate(new Date());
    selectRef.current.focus()
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  };

  const updateKutipanApi = async () => {
    const updatedKutipanData = {
      createDate: startDate.getTime(),
      total1c: input1C,
      total5c: input5C,
      total10c: input10C,
      total20c: input20C,
      total50c: input50C,
      total1d: input1,
      total5d: input5,
      total10d: input10,
      total20d: input20,
      total50d: input50,
      total100d: input100,
    }

    try {
      await updateKutipan(idNumber, updatedKutipanData);
      setJumlahKutipan(prevState => !prevState)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const updateTotal = () => {
      setTotal(
        input1 * 1 +
        input5 * 5 +
        input10 * 10 +
        input20 * 20 +
        input50 * 50 +
        input100 * 100 +
        input1C * 0.01 +
        input5C * 0.05 +
        input10C * 0.10 +
        input20C * 0.20 +
        input50C * 0.50
      );
    };
    updateTotal();
  }, [input1, input5, input10, input20, input50, input100, input1C, input5C, input10C, input20C, input50C]);

  const editPreview = async (id) => {
    if (id) {
      try {
        const data = await getKutipan(id)
        if (data) {
          setIdNumber(data.id)
          setInput1(data.total1d);
          setInput5(data.total5d);
          setInput10(data.total10d);
          setInput20(data.total20d);
          setInput50(data.total50d);
          setInput100(data.total100d);
          setInput1C(data.total1c);
          setInput5C(data.total5c);
          setInput10C(data.total10c);
          setInput20C(data.total20c);
          setInput50C(data.total50c);
          setSelectedTabungName(data.tabung.name);
          setIsCents(data.tabung.cents)
          setVisibleEditModal(true);
        }

      } catch (error) {
        console.error('Error fetching kutipan:', error)
      }
    }
  }

  useEffect(() => {
    if (penyata) {
      setVisibleXL(!visibleXL);
    }
  }, [penyata])

  const printPreview = async (id) => {
    if (id) {
      try {
        const data = await getKutipan(id)
        if (data) {
          setPenyata(data)
        }
      } catch (error) {
        console.error('Error fetching kutipan:', error)
      }
    }
  }

  const handleSelectChange = (value) => {
    setSelectedTabung(value);
  };


  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [kutipan, setKutipan] = useState();
  const deleteConfirmation = (props) => {
    if (!props) return

    setOpenDeleteDialog(true);
    setKutipan(props)
  }
  const onDeleteConfirm = async () => {
    await deleteKutipan(kutipan.id)
    const tempKutipanList = kutipanList?.filter(function (d) { return d.id != kutipan.id; });
    setKutipanList(tempKutipanList);
    toast.success(`Kutipan tarikh ${dateIntParse(kutipan.createDate)} berjaya dibuang`, toastConfig)
    setOpenDeleteDialog(false);
  };

  if (loading) {
    return <div><CSpinner color="primary" /></div>
  }

  const resultEmpty = () => {
    return (
      <p>
        <CIcon icon={cilInfo} className="me-2" /> Sila pilih tabung di atas.
      </p>
    )
  }

  const previewBulanan = () => {
    setVisibleBulanan(true)
  }

  const cetakBulanan = () => {

    if (selectedTabung) {
      return (
        <CRow className='m-4 '>
          <CCol align="left">
            Sila pilih bulan & tahun
            <DatePicker
              selected={selectedMonth}
              showMonthYearPicker
              showTwoColumnMonthYearPicker
              dateFormat="MM/yyyy"
              onChange={(date) => setSelectedMonth(date)}
              maxDate={new Date()}
              className='mx-2'
            />
          </CCol>
          <CCol align="right" className="hover-effect" onClick={() => previewBulanan()}>
            <CIcon icon={cilPrint} className="me-2" />
            Cetak Penyata Bulanan
          </CCol>
        </CRow>
      )
    }

  }

  return (
    <CRow>
      <ToastContainer />
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Cetak</strong>
          </CCardHeader>
          <CCardBody>
            <div className="mb-3">
              <CFormSelect
                aria-label="Pilih tabung"
                options={tabungList}
                value={selectedTabung}
                ref={selectRef}
                onChange={(e) => handleSelectChange(e.target.value)}
              />
            </div>
            {cetakBulanan()}
            <DataTable
              noDataComponent={resultEmpty()}
              columns={columns}
              data={kutipanList}
              pointerOnHover
              highlightOnHover
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              paginationPerPage={size}
              paginationDefaultPage={page}
              paginationRowsPerPageOptions={[25, 50, 100, 200]}
              onChangeRowsPerPage={handlePerRowsChange}
              onChangePage={handlePageChange}
            />



            <CModal
              size="xl"
              visible={visibleXL}
              onClose={() => setVisibleXL(false)}
              aria-labelledby="OptionalSizesExample1"
            >
              <CModalBody>
                <DenominasiPrint ref={componentRef} penyata={penyata} />
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setVisibleXL(false)}>
                  Tutup
                </CButton>
                <CButton onClick={handlePrint} color="primary">Cetak</CButton>
              </CModalFooter>
            </CModal>


            <CModal
              size='xl'
              visible={visibleEditModal}
              onClose={() => setVisibleEditModal(false)}
              aria-labelledby="OptionalSizesExample2"
            >
              <CModalBody>
                <h3>Edit Kutipan Tabung</h3>
                <h4 className="text-muted mb-2 mt-3">{selectedTabungName}</h4>
                <CForm
                  id="editForm"
                  validated={validated}
                  onSubmit={handleSubmit}
                >
                  {moneyDenomination.map((value) => (
                    <CRow key={value}>
                      <CCol>{value.endsWith('C') ? `${value.slice(0, -1)} Sen` : `RM ${value}`}</CCol>
                      <CCol>X</CCol>
                      <CCol>
                        <CFormInput
                          id={`txtInput${value}`}
                          placeholder='0'
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
                    <CButton color="secondary" size='sm' className='custom-action-button' onClick={() => setVisibleEditModal(false)}>
                      Tutup
                    </CButton>
                  </div>
                </CForm>

              </CModalBody>

            </CModal>

            <CModal
              size="xl"
              visible={openDeleteDialog}
              onClose={() => setOpenDeleteDialog(false)}
              aria-labelledby="OptionalSizesExample3"
            >
              <CModalHeader onClose={() => setVisible(false)}>
                <CModalTitle id="LiveDemoExampleLabel">Buang Kutipan</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <p>Buang Kutipan bertarikh {dateIntParse(kutipan?.createDate)} bersama jumlah {amountFormatter(kutipan?.total)}</p>
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setOpenDeleteDialog(false)}>
                  Tutup
                </CButton>
                <CButton onClick={onDeleteConfirm} color="primary">Buang</CButton>
              </CModalFooter>
            </CModal>

          </CCardBody>
        </CCard>
      </CCol>
      <PenyataBulananSelector visible={visibleBulanan} tabung={selectedTabung}
        onModalClose={() => setVisibleBulanan(false)} />
    </CRow>
  )
}

export default Cetak
