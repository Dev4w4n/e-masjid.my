import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CButton,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CTable,
  CSpinner,
  CFormCheck,
} from '@coreui/react'
import { getTags } from 'src/service/khairat/TagsApi'
import { getDependentsByMemberId, saveDependent, deleteDependent } from 'src/service/khairat/DependentApi'
import { saveMember, loadMember } from 'src/service/khairat/MembersApi'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useNavigate } from 'react-router-dom'

const columns = [
  {
    key: 'Nama',
    _props: { className: 'w-25', scope: 'col' },
  },
  {
    key: 'No_Ic',
    _props: { className: 'w-25', scope: 'col' },
  },
  {
    key: 'Hubungan',
    _props: { className: 'w-25', scope: 'col' },
  },
  {
    key: 'Tindakan',
    _props: { className: 'w-25', scope: 'col' },
  },
]
const hubunganList = [
  'Pilih jenis hubungan',
  { label: 'Anak', value: '1' },
  { label: 'Ibu', value: '2' },
  { label: 'Ayah', value: '3' },
  { label: 'Nenek', value: '4' },
  { label: 'Datuk', value: '5' },
  { label: 'Isteri', value: '6' },
  { label: 'Suami', value: '7' },
  { label: 'Lain-lain', value: '8' },
]

const Daftar = () => {
  const navigate = useNavigate()
  const { paramId } = useParams()
  const [memberId, setMemberId] = useState(null)
  const [personId, setPersonId] = useState(null)
  const [tagButtons, setTagsButtons] = useState([])
  const [memberTags, setMemberTags] = useState([])
  const [updatableMemberTags, setUpdatableMemberTags] = useState([])
  const [tagItems, setTagItems] = useState([])
  const [tanggunganItems, setTanggunanItems] = useState([])
  const [initLoading, setInitLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputNamaAhli = useRef('')
  const inputNoIcAhli = useRef('')
  const inputNoHpAhli = useRef()
  const inputAlamatAhli = useRef()
  const inputNamaTanggungan = useRef()
  const inputNoIcTanggungan = useRef()
  const inputHubunganTanggungan = useRef()
  const inputNoResit = useRef('')
  const [validated, setValidated] = useState(false)
  const [tarikhBayaran, setTarikhBayaran] = useState([])
  const [paymentChk, setPaymentChk] = useState()

  // to load tags from database
  useEffect(() => {
    async function fetchTags() {
      try {
        const data = await getTags()
        const tagItems = data.content.map((tag) => ({
          label: tag.name,
          id: tag.id,
          mode: false,
          dbId: null,
        }))
        setTagItems(tagItems)
      } catch (error) {
        setError(error)
      } finally {
        setInitLoading(false)
      }
    }
    fetchTags()
    setTimeout(() => {
      inputNamaAhli.current.focus();
    }, 10);
  }, [])
  // to generate tag buttons
  useEffect(() => {
    const updateButtonColor = (id) => {
      changeTagColor(id)
    }
    let buttons = []
    if (tagItems.length !== 0 && memberTags.length === 0) {
      buttons = tagItems.map((tag) => (
        <CButton
          onClick={() => updateButtonColor(tag.id)}
          key={tag.id}
          color={tag.mode ? 'info' : 'light'}
          size="sm"
          shape="rounded-pill"
        >
          {tag.label}
        </CButton>
      ))
    } else if (
      tagItems.length !== 0 &&
      memberTags.length !== 0 &&
      updatableMemberTags.length === 0
    ) {
      buttons = tagItems.map((tag) => (
        <CButton
          onClick={() => updateButtonColor(tag.id)}
          key={tag.id}
          color={memberTags.find((item) => item.tag.id === tag.id) ? 'info' : 'light'}
          size="sm"
          shape="rounded-pill"
        >
          {tag.label}
        </CButton>
      ))
      const updatableTags = tagItems.map((tag) => ({
        label: tag.label,
        id: tag.id,
        mode: memberTags.find((item) => item.tag.id === tag.id) ? 'info' : 'light',
        dbId: memberTags.find((item) => {
          if (item.tag.id === tag.id) {
            return item.id
          } else {
            return null
          }
        }),
      }))
      setUpdatableMemberTags(updatableTags)
    } else if (
      tagItems.length !== 0 &&
      memberTags.length !== 0 &&
      updatableMemberTags.length !== 0
    ) {
      buttons = updatableMemberTags.map((tag) => (
        <CButton
          onClick={() => updateButtonColor(tag.id)}
          key={tag.id}
          color={tag.mode ? 'info' : 'light'}
          size="sm"
          shape="rounded-pill"
        >
          {tag.label}
        </CButton>
      ))
    } else if (tagItems.length === 0 && memberTags.length === 0) {
      buttons = <CSpinner color="primary" />
    }
    function generateButtons() {
      setTagsButtons(buttons)
    }
    generateButtons()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagItems, memberTags])
  // to handle dependents table
  useEffect(() => {
    if (typeof paramId !== 'undefined') {
      setMemberId(parseInt(paramId, 10))
    }
    async function loadMemberData() {
      try {
        if (memberId) {
          const data = await loadMember(memberId)
          const member = data
          const person = member.person
          inputNamaAhli.current.value = person.name
          inputNoIcAhli.current.value = person.icNumber
          inputNoHpAhli.current.value = person.phone
          inputAlamatAhli.current.value = person.address
          setTarikhBayaran(member.paymentHistories)
          setMemberTags(member.memberTags)
          setPersonId(person.id)
        }
        setInitLoading(false)
      } catch (error) {
        setError(error)
      } finally {
        setInitLoading(false)
      }
    }
    async function loadDependents() {
      try {
        if (memberId) {
          const data = await getDependentsByMemberId(memberId)
          const tanggungan = data.map((dependent) => ({
            key: dependent.id,
            Nama: dependent.person.name,
            No_Ic: dependent.person.icNumber,
            Hubungan:
              hubunganList.find((item) => item.value === dependent.hubunganId.toString())?.label ||
              'Unknown',
            Hubungan_Id: dependent.hubunganId,
            Tindakan: (
              <CButton tabIndex="-1" onClick={() => removeDependent(dependent.id)} color="link">
                Buang
              </CButton>
            ),
            personId: dependent.person.id,
          }))
          setTanggunanItems(tanggungan)
        }
        setInitLoading(false)
      } catch (error) {
        setError(error)
      } finally {
        setInitLoading(false)
      }
    }
    loadDependents()
    loadMemberData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId])
  useEffect(() => {
    setPaymentChk(memberHasPaid())
  }, [tarikhBayaran])
  function changeTagColor(id) {
    const newTagItems = tagItems.map((tag) => {
      if (tag.id === id) {
        tag.mode = !tag.mode
      }
      return tag
    })
    const updatableTags = newTagItems.map((tag) => ({
      label: tag.label,
      id: tag.id,
      mode: tag.mode,
      dbId: memberTags.find((item) => {
        if (item.tag.id === tag.id) {
          return item.id
        } else {
          return null
        }
      }),
    }))
    setUpdatableMemberTags(updatableTags)
    setTagItems(newTagItems)
  }
  async function removeDependent(id) {
    try {
      if (memberId !== null) {
        const data = await getDependentsByMemberId(memberId)
        const dependentData = data.find((item) => item.id === id)
        if (dependentData.id) {
          deleteDependent(dependentData.id)
        }
      }
      setTanggunanItems((prevItems) => prevItems.filter((dependent) => dependent.key !== id))
    } catch (error) {
      console.error(error)
    }
  }
  async function addDependent() {
    try {
      const nama = inputNamaTanggungan.current.value
      const icno = inputNoIcTanggungan.current.value
      const hubungan = inputHubunganTanggungan.current.value
      if (nama && icno && hubungan) {
        const index = tanggunganItems.length + 1

        if (memberId !== null) {
          const newDependents = {
            member: {
              id: parseInt(memberId, 10),
            },
            person: {
              name: nama,
              icNumber: icno,
            },
            hubunganId: parseInt(hubungan, 10),
          }
          await saveDependent(newDependents, memberId)
        }

        setTanggunanItems([
          ...tanggunganItems,
          {
            key: index,
            Nama: nama,
            No_Ic: icno,
            Hubungan_Id: hubungan,
            Hubungan: hubunganList.find((item) => item.value === hubungan).label,
            Tindakan: (
              <CButton tabIndex="-1" onClick={() => removeDependent(index)} color="link">
                Buang
              </CButton>
            ),
          },
        ])
        inputNamaTanggungan.current.value = ''
        inputNoIcTanggungan.current.value = ''
        inputHubunganTanggungan.current.value = 'Pilih jenis hubungan'
        inputNamaTanggungan.current.focus()
      }
    } catch (error) {
      console.error(error)
    }
  }
  const saveAhli = async () => {
    if (
      (inputNamaAhli.current.value === '' ||
        inputNamaAhli.current.value === null ||
        inputNamaAhli.current.value === 'undefined')
      ||
      (inputNoIcAhli.current.value === '' ||
        inputNoIcAhli.current.value === null ||
        inputNoIcAhli.current.value === 'undefined' ||
        inputNoIcAhli.current.value === 'false') ||
      isNaN(inputNoIcAhli.current.value)
      ||
      (inputNoHpAhli.current.value === '' ||
        inputNoHpAhli.current.value === null ||
        inputNoHpAhli.current.value === 'undefined' ||
        inputNoHpAhli.current.value === 'false') ||
      isNaN(inputNoHpAhli.current.value)
    ) {
      if (isNaN(inputNoIcAhli.current.value)) {
        inputNoIcAhli.current.value = ''
        inputNoIcAhli.current.focus()
      }
      if (isNaN(inputNoHpAhli.current.value)) {
        inputNoHpAhli.current.value = ''
        inputNoHpAhli.current.focus()
      }
      setValidated(true)
      toast.error('Sila isi maklumat ahli dengan betul', {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      })
    } else {
      if (memberId === null) {
        addNewMember()
      } else {
        updateMember()
      }
      saveNotification()
      setValidated(false)
    }


  }
  const saveNotification = () => {
    toast.success('Maklumat telah disimpan', {
      position: 'top-center',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    })
    inputNamaAhli.current.focus()
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const memberHasPaid = () => {
    let hasPaid = false
    const currentYear = new Date().getFullYear()
    hasPaid = tarikhBayaran.some(item => {
      const paymentDateYear = new Date(item.paymentDate).getFullYear()
      return paymentDateYear === currentYear;
    })
    return hasPaid;
  }
  const addNewMember = async () => {
    const updatablePaymentHistories = []
    if (paymentChk) {
      let resitno = null
      if (inputNoResit.current.value) {
        resitno = inputNoResit.current.value
      }
      updatablePaymentHistories.push({
        member: null,
        paymentDate: new Date().getTime(),
        noResit: resitno,
      })
    }
    const newMemberTags = tagItems
      .filter((item) => item.mode === true)
      .map((item) => {
        return {
          tag: {
            id: item.id,
          },
          member: null,
        }
      })
    const newDependents = tanggunganItems.map((item) => {
      return {
        member: {
          member: null,
        },
        person: {
          name: item.Nama,
          icNumber: item.No_Ic,
        },
        hubunganId: parseInt(item.Hubungan_Id, 10),
      }
    })
    try {
      const name = inputNamaAhli.current.value
      const icno = inputNoIcAhli.current.value
      const hp = inputNoHpAhli.current.value
      const alamat = inputAlamatAhli.current.value
      const newMemberData = {
        person: {
          name: name,
          icNumber: icno,
          phone: hp,
          address: alamat,
        },
        memberTags: newMemberTags,
        dependents: newDependents,
        paymentHistories: updatablePaymentHistories,
      }
      setLoading(true)
      await saveMember(newMemberData)
      clearForm()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  const updateMember = async () => {
    // const updatablePaymentHistories = []
    // if (paymentChk) {
    //   let resitno = null
    //   if (inputNoResit.current.value) {

    //     
    //     resitno = inputNoResit.current.value
    //   }
    //   updatablePaymentHistories.push({
    //     member: {
    //       id: memberId,
    //     },
    //     paymentDate: new Date().getTime(),
    //     resitNo: resitno,
    //   })
    // }
    const newMemberTags = updatableMemberTags
      .filter((item) => item.mode === true || item.mode === 'info')
      .map((item) => {
        return {
          member: {
            id: memberId,
          },
          tag: {
            id: item.id,
          },
        }
      })

    const newDependents = tanggunganItems.map((item) => {
      return {
        member: {
          member: { id: memberId },
        },
        person: {
          id: item.personId,
          name: item.Nama,
          icNumber: item.No_Ic,
        },
        hubunganId: parseInt(item.Hubungan_Id, 10),
        id: item.key,
      }
    })
    try {
      const paymentHistory = []
      if (paymentChk) {
        let resitno = null
        if (inputNoResit.current.value) {
          resitno = inputNoResit.current.value
        }
        paymentHistory.push({
          member: {
            id: memberId,
          },
          paymentDate: new Date().getTime(),
          noResit: resitno,
        })
      }
      const name = inputNamaAhli.current.value
      const icno = inputNoIcAhli.current.value
      const hp = inputNoHpAhli.current.value
      const alamat = inputAlamatAhli.current.value
      const newMemberData = {
        person: {
          name: name,
          icNumber: icno,
          phone: hp,
          address: alamat,
          id: personId,
        },
        memberTags: newMemberTags,
        dependents: newDependents,
        paymentHistories: paymentHistory,
        id: memberId,
      }
      setLoading(true)
      await saveMember(newMemberData)
      clearForm()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  const clearForm = () => {
    setMemberId(null)
    inputNamaAhli.current.value = ''
    inputNoIcAhli.current.value = ''
    inputNoHpAhli.current.value = ''
    inputAlamatAhli.current.value = ''
    setUpdatableMemberTags((prevTagItems) => {
      const newTagItems = prevTagItems.map((tag) => ({
        ...tag,
        mode: false,
      }));
      return newTagItems;
    })
    setMemberTags([])
    setTagItems((prevTagItems) => {
      // Reset tagItems to their initial state
      const newTagItems = prevTagItems.map((tag) => ({
        ...tag,
        mode: false, // Set mode to 'info'
      }));
      return newTagItems;
    });
    setTanggunanItems([])
    setTarikhBayaran([])
    setPaymentChk(false)
    setValidated(false)
    inputNamaAhli.current.focus()
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
    const form = document.getElementById('daftarForm');
    if (form) {
      form.reset();
      navigate('/khairat/daftar')
    }
  }

  //handle F12 to save
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.keyCode === 119) {
        saveAhli()
      } else if (event.keyCode === 115) {
        navigate('/khairat/carian')
      }
    };

    // Add the event listener when the component mounts
    document.addEventListener('keydown', handleKeyPress);

    // Remove the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  });

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  const renderBayaran = () => {
    return (
      <>
        <CFormLabel htmlFor="txtTarikhBayaran" style={{ whiteSpace: 'pre' }}>Status bayaran tahun ini:{'\t'}</CFormLabel>
        <CFormCheck inline type="radio" id="bayaranChkBox1" onChange={() => setPaymentChk(true)} checked={paymentChk} value={paymentChk} label="Sudah" />
        <CFormCheck inline type="radio" id="bayaranChkBox2" onChange={() => setPaymentChk(false)} checked={!paymentChk} value={!paymentChk} label="Belum" />
        {
          paymentChk && (
            <>
              <br />
              <CFormInput ref={inputNoResit} type="text" id="txtNoResit" placeholder="Masukkan no resit (Jika ada)" />
            </>
          )
        }
      </>
    )
  }
  if (initLoading) {
    return <div><CSpinner color="primary" /></div>
  }
  if (error) {
    return <div>Tiada akses. Sila login kembali</div>
  }
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <ToastContainer />
            <strong>Daftar ahli</strong>
          </CCardHeader>
          <CCardBody>
            <p className="text-medium-emphasis small">
              Sila masukkan nama, no ic dan kawasan ahli baru. Anda juga boleh memilih untuk
              menyimpan data No hp dan alamat tetapi tidak wajib.
            </p>
            <CForm id="daftarForm" validated={validated}>
              <div className="mb-3">
                <CFormLabel htmlFor="txtNama">Nama</CFormLabel>
                <CFormInput
                  ref={inputNamaAhli}
                  type="text"
                  id="txtNama"
                  placeholder="Masukkan nama ahli"
                  feedbackInvalid="Masukkan nama ahli"
                  required
                  tabIndex={1}
                  maxLength={128}
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="txtNoIc">No I/C</CFormLabel>
                <CFormInput
                  ref={inputNoIcAhli}
                  type="text"
                  id="txtNoIc"
                  placeholder="Masukkan No I/C ahli"
                  feedbackInvalid="Masukkan No I/C ahli. Nombor sahaja"
                  required
                  tabIndex={2}
                  maxLength={12}
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="txtNoHp">No telefon</CFormLabel>
                <CFormInput
                  ref={inputNoHpAhli}
                  type="text"
                  id="txtNoHp"
                  placeholder="Masukkan No telefon ahli"
                  feedbackInvalid="Masukkan No telefon ahli. Nombor sahaja"
                  required
                  tabIndex={3}
                  maxLength={12}
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="txtKawasan" tabIndex={4}>Penandaan</CFormLabel>
                <br />
                <div className="button-penandaan">
                  <>{tagButtons}</>
                </div>
              </div>
              <CAccordion alwaysOpen activeItemKey={3}>
                <CAccordionItem itemKey={1}>
                  <CAccordionHeader>Maklumat peribadi tambahan</CAccordionHeader>
                  <CAccordionBody>
                    <div className="mb-3">
                      <CFormLabel htmlFor="txtAlamat">Alamat</CFormLabel>
                      <CFormTextarea ref={inputAlamatAhli} id="txtAlamat" rows={3} maxLength={256}></CFormTextarea>
                    </div>
                  </CAccordionBody>
                </CAccordionItem>
                <CAccordionItem itemKey={2}>
                  <CAccordionHeader>Maklumat tanggungan</CAccordionHeader>
                  <CAccordionBody>
                    <div className="mb-3">
                      <CFormLabel htmlFor="txtNamaTanggungan">Nama</CFormLabel>
                      <CFormInput
                        ref={inputNamaTanggungan}
                        type="text"
                        id="txtNamaTanggungan"
                        placeholder="Masukkan nama tanggungan"
                        maxLength={128}
                      />
                    </div>
                    <div className="mb-3">
                      <CFormLabel htmlFor="txtNoIcTanggungan">No I/C</CFormLabel>
                      <CFormInput
                        ref={inputNoIcTanggungan}
                        type="text"
                        id="txtNoIcTanggungan"
                        placeholder="Masukkan No I/C tanggungan"
                        maxLength={12}
                      />
                    </div>
                    <div className="mb-3">
                      <CFormLabel htmlFor="txtHubungan">Hubungan</CFormLabel>
                      <CFormSelect
                        ref={inputHubunganTanggungan}
                        aria-label="Pilih jenis hubungan"
                        options={hubunganList}
                      />
                    </div>
                    <div className="d-grid gap-2">
                      <CButton onClick={addDependent} color="primary" size="sm">
                        Tambah tanggungan
                      </CButton>
                    </div>
                    <CTable columns={columns} items={tanggunganItems} responsive="lg" />
                  </CAccordionBody>
                </CAccordionItem>
                <CAccordionItem itemKey={3}>
                  <CAccordionHeader>Maklumat bayaran</CAccordionHeader>
                  <CAccordionBody>
                    <div className="mb-3">
                      {renderBayaran()}
                    </div>
                  </CAccordionBody>
                </CAccordionItem>
              </CAccordion>
              <br />
              <div className="button-action-container">
                <CButton onClick={saveAhli} color="primary" size="sm" tabIndex={5}
                  className={`custom-action-button ${loading ? 'loading' : ''}`}>
                  {loading ? (
                    <>
                      <CSpinner size="sm" color="primary" />
                      <span> Sila tunggu</span>
                    </>
                  ) : (
                    "Simpan (F8)"
                  )}
                </CButton>
                <CButton onClick={clearForm} color="secondary" size="sm"
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

export default Daftar
