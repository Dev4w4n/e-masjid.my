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

const urlPetiCadangan = config.url.PETI_CADANGAN_URL;

const Qr = () => {
  const componentRef = useRef();

  //const [fixedTemplates, setFixedTemplate] = useState([]);
  const [fontColor, setFontColor] = useState('black');
  const [background, setBackground] = useState('../bgpattern/greek-vase.webp');
  const [templateTitle, setTemplateTitle] = useState('Style 1');
  const [selectedOption, setSelectedOption] = useState(1);

  const templates = [
    {
      "id": 1,
      "name": "Style 1",
      "fontColor": "black",
      "relativePath": "../bgpattern/greek-vase.webp"
    },
    {
      "id": 2,
      "name": "Style 2",
      "fontColor": "white",
      "relativePath": "../bgpattern/fancy-cushion.webp"
    },
    {
      "id": 3,
      "name": "Style 3",
      "fontColor": "tomato",
      "relativePath": "../bgpattern/halftone-yellow.png"
    },
    {
      "id": 4,
      "name": "Style 4",
      "fontColor": "SlateBlue",
      "relativePath": "../bgpattern/light-veneer.png"
    },
    {
      "id": 5,
      "name": "Style 5",
      "fontColor": "LemonChiffon",
      "relativePath": "../bgpattern/oriental-tiles.png"
    },
    {
      "id": 6,
      "name": "Style 6",
      "fontColor": "WhiteSmoke",
      "relativePath": "../bgpattern/grey_wash_wall.png"
    }
  ];

  const printableStyles = {
    position: 'relative',
    width: '210mm',
    height: '297mm',
    maxHeight: '297mm',
    maxWidth: '210mm', /* A4 width */
    overflow: 'hidden', /* Ensure the image doesn't overflow */
  };

  const backgroundStyles = {
    width: '100%',
    height: '100%',
    border: '1px solid #ccc',
  };

  const overlay = {
    position: 'absolute', /* Position the overlay relative to its containing element */
    left: '50%', /* Center horizontally */
    transform: 'translate(-50%, -50%)', /* Center the overlay */
    zIndex: '1', /* Ensure the overlay appears above the image */
  };

  const overlayContainer = {
    ...overlay,
    top: '50%', /* Center vertically */
  };

  const qr = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)', /* Semi-transparent white background */
    padding: '10px', /* Add padding to the overlay content */
    borderRadius: '10px', /* Add rounded corners */
    border: '1px solid #ccc',
    width: '100%',
  };

  const title = {
    ...overlay,
    top: '10%',
    color: `${fontColor}`,
    fontWeight: 'bold',
    fontSize: '100px',
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

  // Function to handle option button click
  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setBackground(templates[option - 1].relativePath);
    setFontColor(templates[option - 1].fontColor);
    setTemplateTitle(templates[option - 1].name);
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
                              <QRCode value={urlPetiCadangan} className="img-fluid" />
                            </div>
                          </div>
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
                        key={button.id}
                      >
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
