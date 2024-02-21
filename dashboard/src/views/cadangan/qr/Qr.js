import React, { useRef, useState } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CRow,
  CImage,
} from '@coreui/react';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import CIcon from '@coreui/icons-react';
import { cilCloudDownload } from '@coreui/icons';

import { config } from 'src/Config.js';

import PosterBg1 from 'src/assets/bgpattern/bg1.webp';
import PosterBg2 from 'src/assets/bgpattern/bg2.webp';
import PosterBg3 from 'src/assets/bgpattern/bg3.png';
import PosterBg4 from 'src/assets/bgpattern/bg4.png';
import PosterBg5 from 'src/assets/bgpattern/bg5.png';
import PosterBg6 from 'src/assets/bgpattern/bg6.png';

const urlPetiCadangan = config.url.PETI_CADANGAN_URL;

const Qr = () => {
  const componentRef = useRef();

  const [fontColor, setFontColor] = useState('black');
  const [background, setBackground] = useState(PosterBg1);
  const [templateTitle, setTemplateTitle] = useState('Latar Belakang 1');
  const [selectedOption, setSelectedOption] = useState(1);
  const [instructCircleColor, setInstructCircleColor] = useState('black');
  const [instructNumberColor, setInstructNumberColor] = useState('white');

  const templates = [
    {
      "id": 1,
      "name": "Latar Belakang 1",
      "fontColor": "black",
      "instructCircleColor": "black",
      "instructNumberColor": "white",
      "relativePath": PosterBg1
    },
    {
      "id": 2,
      "name": "Latar Belakang 2",
      "fontColor": "white",
      "instructCircleColor": "black",
      "instructNumberColor": "white",
      "relativePath": PosterBg2
    },
    {
      "id": 3,
      "name": "Latar Belakang 3",
      "fontColor": "tomato",
      "instructCircleColor": "black",
      "instructNumberColor": "white",
      "relativePath": PosterBg3
    },
    {
      "id": 4,
      "name": "Latar Belakang 4",
      "fontColor": "SlateBlue",
      "instructCircleColor": "black",
      "instructNumberColor": "white",
      "relativePath": PosterBg4
    },
    {
      "id": 5,
      "name": "Latar Belakang 5",
      "fontColor": "LemonChiffon",
      "instructCircleColor": "black",
      "instructNumberColor": "white",
      "relativePath": PosterBg5
    },
    {
      "id": 6,
      "name": "Latar Belakang 6",
      "fontColor": "WhiteSmoke",
      "instructCircleColor": "black",
      "instructNumberColor": "white",
      "relativePath": PosterBg6
    }
  ];

  const printableStyles = {
    position: 'relative',
    width: '210mm', /* A4 width */
    height: '297mm',  /* A4 height */
    maxHeight: '297mm',
    maxWidth: '210mm', 
    overflow: 'hidden',
  };

  const backgroundStyles = {
    width: '100%',
    height: '100%',
    border: '1px solid #ccc',
  };

  const overlay = {
    position: 'absolute',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: '1',
  };

  const overlayContainer = {
    ...overlay,
    top: '50%',
  };

  const qr = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid', 
    borderColor: `${fontColor}`,
    width: '100%',
  };

  const title = {
    ...overlay,
    top: '10%',
    color: `${fontColor}`,
    fontWeight: 'bold',
    fontSize: '105px',
    width: '95%',
    textAlign: 'center',
  };

  const description = {
    ...overlay,
    top: '20%',
    color: `${fontColor}`,
    fontWeight: 'bold',
    fontSize: '42px',
    width: '95%',
    textAlign: 'center',
  };

  const footer = {
    ...overlay,
    top: '94%',
    color: `${fontColor}`,
    fontWeight: 'bold',
    fontSize: '16px',
    width: '95%',
    textAlign: 'center',
    border: '1px solid #ccc',
    padding: '5px',
    borderRadius: '10px', 
  };

  const handleExportAsPNG = () => {
    if (componentRef.current) {
      html2canvas(componentRef.current).then((canvas) => {
        const url = canvas.toDataURL();
        const link = document.createElement('a');
        link.href = url;
        link.download = 'qr_kod.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setBackground(templates[option - 1].relativePath);
    setFontColor(templates[option - 1].fontColor);
    setTemplateTitle(templates[option - 1].name);
    setInstructCircleColor(templates[option - 1].instructCircleColor);
    setInstructNumberColor(templates[option - 1].instructNumberColor);
  };

  const drawCircle = (number, text, leftPosition) => {
    const instruction = {
      position: 'absolute', 
      left: leftPosition, 
      transform: 'translate(-50%, -50%)',
      zIndex: '2',
      top: '80%',
      display: 'flex',
      color: `${fontColor}`,
      width: '18%',
      height: '14%',
      flexWrap: 'wrap',
      fontWeight: 'bold',
      fontSize: '16px',
    };
  
    const circle = {
      display: 'flex',
      width: '60px',
      height: '60px',
      backgroundColor: `${instructCircleColor}`,
      borderRadius: '50%',
      justifyContent: 'center', 
      alignItems: 'center', 
      fontWeight: 'bold',
      fontSize: '30px',
      color: `${instructNumberColor}`,
      border: '5px solid', 
      borderColor: `${fontColor}`,
    };

    return (
      <div style={instruction}>
        <CContainer>
          <CRow>
            <CCol>
            <div style={{position: 'absolute',transform: 'translate(-50%, -50%)',left:'50%', top:'20%'}}>
              <div style={circle}>{number}</div>
              </div>
            </CCol>
          </CRow>
          <CRow >
            <CCol>
            <div style={{position: 'absolute',transform: 'translate(-50%, -50%)',left:'50%', top:'70%'}}>
              <br />
              <div style={{textAlign:'center'}}>{text}</div>
              </div>
            </CCol>
          </CRow>
        </CContainer>
      </div>
    );
  };

  const lineConnectingCircles = () => {
    const lineStyle = {
      position: 'absolute',
      backgroundColor: `${fontColor}`,
      height: '1px',
      width: '70%',
      top:'76%',
      left: '15%',
      zIndex: '1',
    };
  
    return <div style={lineStyle}></div>;
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Muat turun QR Kod Peti Cadangan</strong>
          </CCardHeader>
          <CCardBody>
            <CContainer>
              <CRow>
                <CCol>
                  <div ref={componentRef} style={printableStyles}>
                    <img style={backgroundStyles} src={background} alt="Background Image" draggable="false" />
                    <CContainer>
                      <CRow>
                        <CCol>
                          <h1 style={title}>SCAN DI SINI</h1>
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol>
                          <label style={description}>PETI CADANGAN ONLINE</label>
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol>
                          <div style={overlayContainer}>
                            <div style={qr}>
                              <QRCode value={urlPetiCadangan} className="img-fluid" size="400" />
                            </div>
                          </div>
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol>
                        {drawCircle(1, 'SCAN QR CODE DI ATAS', '15%')}
                        {drawCircle(2, 'TULISKAN CADANGAN/ ADUAN', '38%')}
                        {drawCircle(3, 'ISI MAKLUMAT JIKA INGIN DIHUBUNGI', '62%')}
                        {drawCircle(4, 'TEKAN HANTAR', '85%')}
                        {lineConnectingCircles ()}
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol>
                          <label style={footer}>AHLI JAWATANKUASA MASJID JAMEK SUNGAI RAMBAI, BUKIT MERTAJAM, PULAU PINANG</label>
                        </CCol>
                      </CRow>
                    </CContainer>
                  </div>
                </CCol>
                <CCol>
                  <div>
                    <h5>{templateTitle}</h5> <p />
                    <div style={{ gap: '5px', flexWrap: 'wrap', display: 'flex' }}>
                    {templates.map(button => (
                      <CButton
                        color="light"
                        onClick={() => handleOptionClick(button.id)}
                        active={selectedOption === button.id}
                        key={button.id}>
                        <CImage src={button.relativePath} className="rounded-circle" alt={button.name} width="30" height="30" />
                      </CButton>
                    ))}
                    </div>
                    <p />
                    <CButton color="primary" onClick={handleExportAsPNG}>
                      <CIcon icon={cilCloudDownload} />
                    </CButton>
                  </div>
                </CCol>
              </CRow>
            </CContainer>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Qr;
