import React, { useRef, useState, useEffect } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CRow,
  CImage,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
} from '@coreui/react';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import CIcon from '@coreui/icons-react';
import { cilCloudDownload } from '@coreui/icons';
import { HexColorPicker } from 'react-colorful';

import { config } from '@/Config';

import PosterBg1 from '@/assets/bgpattern/bg1.png';
import PosterBg2 from '@/assets/bgpattern/bg2.png';
import PosterBg3 from '@/assets/bgpattern/bg3.png';
import PosterBg4 from '@/assets/bgpattern/bg4.png';
import PosterBg5 from '@/assets/bgpattern/bg5.png';
import PosterBg6 from '@/assets/bgpattern/bg6.png';

const urlPetiCadangan = config.url.PETI_CADANGAN_URL;

const Qr = () => {
  const componentRef = useRef();
  const googleApiWithKey = "https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyCMKzf91TWwDhsLFHIPgT47Oy-I3jNrEEo";
  const defaultTitleSize = 8;
  const defaultDescriptionSize = 4;
  const defaultFooterSize = 1.2;
  const defaultFontColor = '#000000';
  const defaultFont = 'system-ui';
  const defaultInstructionCircleColor = 'black';
  const defaultInstructionNumberColor = 'white';
  const defaultPageWidth = 210;
  const defaultPageHeight = 297;
  const defaultViewPort = '50vw';
  //const [googleFontList, setGoogleFontList] = useState([]);

  //default templates
  const [fontColor, setFontColor] = useState(defaultFontColor);
  const [background, setBackground] = useState(PosterBg1);
  const [templateTitle, setTemplateTitle] = useState('');
  const [selectedOption, setSelectedOption] = useState(1);
  const [instructCircleColor, setInstructCircleColor] = useState(defaultInstructionCircleColor);
  const [instructNumberColor, setInstructNumberColor] = useState(defaultInstructionNumberColor);

  //text edit panel
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeKey, setActiveKey] = useState(1)

  //changable text
  const [titleValue, setTitleValue] = useState('SCAN DI SINI');
  const [descriptionValue, setDescriptionValue] = useState('PETI CADANGAN ONLINE');
  const [footerValue, setFooterValue] = useState('AHLI JAWATANKUASA MASJID DEMO');

  //title
  const [titleFont, setTitleFont] = useState('');
  const [titleColor, setTitleColor] = useState(fontColor);
  const [titleSize, setTitleSize] = useState(defaultTitleSize);
  const [titleColorChanging, setTitleColorChanging] = useState(titleColor);

  //description
  const [descriptionFont, setDescriptionFont] = useState('');
  const [descriptionColor, setDescriptionColor] = useState(fontColor);
  const [descriptionSize, setDescriptionSize] = useState(defaultDescriptionSize);
  const [descriptionColorChanging, setDescriptionColorChanging] = useState(titleColor);

  //footer
  const [footerFont, setFooterFont] = useState('');
  const [footerColor, setFooterColor] = useState(fontColor);
  const [footerSize, setFooterSize] = useState(defaultFooterSize);
  const [footerColorChanging, setFooterColorChanging] = useState(titleColor);

  //dimension
  const [pageWidth, setPageWidth] = useState(defaultPageWidth);
  const [pageHeight, setPageHeight] = useState(defaultPageHeight);

  const templates = [
    {
      "id": 1,
      "name": "Latar Belakang 1",
      "fontColor": "#000000",
      "instructCircleColor": "black",
      "instructNumberColor": "white",
      "relativePath": PosterBg1
    },
    {
      "id": 2,
      "name": "Latar Belakang 2",
      "fontColor": "#ffffff",
      "instructCircleColor": "black",
      "instructNumberColor": "white",
      "relativePath": PosterBg2
    },
    {
      "id": 3,
      "name": "Latar Belakang 3",
      "fontColor": "#FF6347",
      "instructCircleColor": "black",
      "instructNumberColor": "white",
      "relativePath": PosterBg3
    },
    {
      "id": 4,
      "name": "Latar Belakang 4",
      "fontColor": "#6A5ACD",
      "instructCircleColor": "black",
      "instructNumberColor": "white",
      "relativePath": PosterBg4
    },
    {
      "id": 5,
      "name": "Latar Belakang 5",
      "fontColor": "#FFFACD",
      "instructCircleColor": "black",
      "instructNumberColor": "white",
      "relativePath": PosterBg5
    },
    {
      "id": 6,
      "name": "Latar Belakang 6",
      "fontColor": "#F5F5F5",
      "instructCircleColor": "black",
      "instructNumberColor": "white",
      "relativePath": PosterBg6
    }
  ];

  const fixedFonts = [
    'system-ui',
    'Times New Roman',
    'Georgia',
    'Garamond',
    'Arial',
    'Verdana',
    'Helvetica',
    'Courier New',
    'Lucida Console',
    'Monaco',
    'Brush Script MT',
    'Lucida Handwriting',
    'Copperplate',
    'Papyrus',
  ];

  const printableStyles = {
    position: 'relative',
    width: `${defaultViewPort}`,
    height: `calc(${defaultViewPort} * (${pageHeight}/${pageWidth}))`, /* page aspect ratio on 50% of the viewport width */
    maxWidth: `${pageWidth}mm`,
    maxHeight: `${pageHeight}mm`,
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
    top: '48%',
  };

  const qr = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: '0.5em',
    borderRadius: '0.5em',
    border: '0.05em solid',
    borderColor: `${fontColor}`,
    width: '100%',
  };

  const title = {
    ...overlay,
    top: '10%',
    color: `${titleColor}`,
    fontWeight: 'bold',
    fontSize: `calc((${titleSize}/100) * (${defaultViewPort} * (${pageHeight}/${pageWidth}))`,
    width: '95%',
    textAlign: 'center',
    fontFamily: `${titleFont}`,
  };

  const description = {
    ...overlay,
    top: '20%',
    color: `${descriptionColor}`,
    fontWeight: 'bold',
    fontSize: `calc((${descriptionSize}/100) * (${defaultViewPort} * (${pageHeight}/${pageWidth}))`,
    width: '95%',
    textAlign: 'center',
    fontFamily: `${descriptionFont}`,
  };

  const footer = {
    ...overlay,
    top: '94%',
    color: `${footerColor}`,
    fontWeight: 'bold',
    fontSize: `calc((${footerSize}/100) * (${defaultViewPort} * (${pageHeight}/${pageWidth}))`,
    width: '95%',
    textAlign: 'center',
    border: '0.08em solid #ccc',
    padding: '0.3em',
    borderRadius: '0.5em',
    fontFamily: `${footerFont}`,
  };

  const textEditorPanel = {
    position: 'fixed',
    bottom: '0.1vh',
    right: '0.1vw',
    width: 'auto',
    maxWidth: '400px',
    backgroundColor: '#ffffff',
    border: '1px solid #cccccc',
    borderRadius: '0.5vw',
    overflow: 'hidden',
    transition: 'all 0.5s ease',
    zIndex: '9999',
    height: 'auto',
  };

  const toggleButton = {
    width: '100%',
    padding: '0.5vw',
    backgroundColor: '#2f64c7',
    border: 'none',
    cursor: 'pointer',
    color: 'azure',
  };

  const panelContent = {
    height: isPanelOpen ? '100%' : '0',
  };

  const section = {
    marginInline: '0.5em',
    padding: '0.2em',
    height: '100%',
    overflow: 'auto',
  };

  const sectionTitle = {
    fontColor: 'Gainsboro',
    fontSize: '11px',
  }

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

  const handleTemplateOptionClick = (option) => {
    setSelectedOption(option);
    setBackground(templates[option - 1].relativePath);
    setFontColor(templates[option - 1].fontColor);
    setTemplateTitle(templates[option - 1].name);
    setInstructCircleColor(templates[option - 1].instructCircleColor);
    setInstructNumberColor(templates[option - 1].instructNumberColor);
    setTitleColor(templates[option - 1].fontColor);
    setTitleSize(defaultTitleSize);
    setTitleFont(defaultFont);
    setDescriptionColor(templates[option - 1].fontColor);
    setDescriptionSize(defaultDescriptionSize);
    setDescriptionFont(defaultFont);
    setFooterColor(templates[option - 1].fontColor);
    setFooterSize(defaultFooterSize);
    setFooterFont(defaultFont);
  };

  //DESCRIPTION----------------------------------
  const drawCircle = (number, text, leftPosition) => {
    const instruction = {
      position: 'absolute',
      left: leftPosition,
      transform: 'translate(-50%, -50%)',
      zIndex: '2',
      top: '80%',
      display: 'flex',
      color: `${fontColor}`,
      width: '21%',
      height: '14%',
      flexWrap: 'wrap',
      fontWeight: 'bold',
      fontSize: `calc(0.015 * (${defaultViewPort} * (${pageHeight}/${pageWidth}))`,
    };

    const circle = {
      display: 'flex',
      width: '4.5vw',
      height: '4.5vw',
      backgroundColor: `${instructCircleColor}`,
      borderRadius: '50%',
      justifyContent: 'center',
      alignItems: 'center',
      fontWeight: 'bold',
      fontSize: '2.2vw',
      color: `${instructNumberColor}`,
      border: '0.5vw solid',
      borderColor: `${fontColor}`,
    };

    return (
      <div style={instruction}>
        <CContainer>
          <CRow>
            <CCol>
              <div style={{ position: 'absolute', transform: 'translate(-50%, -50%)', left: '50%', top: '20%' }}>
                <div style={circle}>{number}</div>
              </div>
            </CCol>
          </CRow>
          <CRow >
            <CCol>
              <div style={{ position: 'absolute', transform: 'translate(-50%, -50%)', left: '50%', top: '75%' }}>
                <br />
                <div style={{ textAlign: 'center' }}>{text}</div>
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
      top: '76%',
      left: '15%',
      zIndex: '1',
    };

    return <div style={lineStyle}></div>;
  };

  //POSTER TEXT EDIT PANEL----------------------------------
  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  const handleTitleValueChange = (event) => {
    setTitleValue(event.target.value);
  };

  const handleTitleFontChange = event => {
    setTitleFont(event.target.value);
  };

  const handleTitleSizeChange = event => {
    setTitleSize(event.target.value);
  };

  const handleTitleColorChange = (newColor) => {
    setTitleColor(newColor);
    setTitleColorChanging(newColor);
  };
  const handleTitleColorChanging = (newColor) => {
    setTitleColorChanging(newColor.target.value);

    if (titleColorChanging.length === 7) {
      setTitleColor(titleColorChanging);
    }
  };

  const handleDescriptionValueChange = (event) => {
    setDescriptionValue(event.target.value);
  };

  const handleDescriptionFontChange = event => {
    setDescriptionFont(event.target.value);
  };

  const handleDescriptionSizeChange = event => {
    setDescriptionSize(event.target.value);
  };

  const handleDescriptionColorChange = (newColor) => {
    setDescriptionColor(newColor);
    setDescriptionColorChanging(newColor);
  };
  const handleDescriptionColorChanging = (newColor) => {
    setDescriptionColorChanging(newColor.target.value);

    if (descriptionColorChanging.length === 7) {
      setDescriptionColor(descriptionColorChanging);
    }
  };

  const handleFooterValueChange = (event) => {
    setFooterValue(event.target.value);
  };

  const handleFooterFontChange = event => {
    setFooterFont(event.target.value);
  };

  const handleFooterSizeChange = event => {
    setFooterSize(event.target.value);
  };

  const handleFooterColorChange = (newColor) => {
    setFooterColor(newColor);
    setFooterColorChanging(newColor);
  };
  const handleFooterColorChanging = (newColor) => {
    setFooterColorChanging(newColor.target.value);

    if (footerColorChanging.length === 7) {
      setFooterColor(footerColorChanging);
    }
  };

  //TODO
  // useEffect(() => {
  //   const fetchFonts = async () => {
  //     try {
  //       //Google API Key for e-masjid
  //       //AIzaSyCMKzf91TWwDhsLFHIPgT47Oy-I3jNrEEo
  //       const response = await axios.get('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyCMKzf91TWwDhsLFHIPgT47Oy-I3jNrEEo');

  //       setGoogleFontList(response.data.items.map(font => font.family));
  //     } catch (error) {
  //       console.error('Error fetching fonts:', error);
  //     }
  //   };

  //   fetchFonts();
  // }, []);

  const textEditorSection = (
    value, handleValueChange,
    font, handleFontChange,
    size, handleSizeChange,
    color, handleColorChange,
    colorChanging, handleColorChanging) => {
    return (
      <div style={section}>
        <CContainer>
          <CRow>
            <CCol>
              <label style={sectionTitle}>Ayat</label><br />
              <input type="text" value={value} onChange={handleValueChange} style={{ width: '100%', height: '1.7em' }} />
            </CCol>
          </CRow>
          <CRow>
            <CCol style={{ flex: '7'}}>
              <label style={sectionTitle}>Font</label><br />
              <select value={font} onChange={handleFontChange} style={{ width: '100%', height: '1.7em' }}>
                <option value="">Select a font...</option>
                {fixedFonts.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </CCol>
            <CCol style={{ flex: '3' }}>
              <label style={sectionTitle}>Saiz %</label><br />
              <input type="text" value={size} onChange={handleSizeChange} style={{ width: '100%', height: '1.7em' }} />
            </CCol>
          </CRow>
          <CRow>
            <CCol>
              <label style={sectionTitle}>Warna</label><br />
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <HexColorPicker color={color} onChange={handleColorChange} style={{ marginRight: '0.2em' }} />
                <input type="text" value={colorChanging} onChange={handleColorChanging} style={{ padding: '5px', width: '100px', height: '1.7em' }} />
              </div>
            </CCol>
          </CRow>
        </CContainer>
      </div>
    );
  };

  useEffect(() => {
    handleTemplateOptionClick(1);
  }, []);

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
                          <h1 style={title}>{titleValue}</h1>
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol>
                          <label style={description}>{descriptionValue}</label>
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
                          {lineConnectingCircles()}
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol>
                          <label style={footer}>{footerValue}</label>
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
                          onClick={() => handleTemplateOptionClick(button.id)}
                          active={selectedOption === button.id}
                          key={button.id}>
                          <CImage src={button.relativePath} className="rounded-circle" alt={button.name} width="30" height="30" />
                        </CButton>
                      ))}
                    </div>
                    <p />
                    <div style={textEditorPanel}>
                      <button onClick={togglePanel} style={toggleButton}>
                        {isPanelOpen ? 'Tutup Panel Edit' : 'Buka Panel Edit'}
                      </button>
                      <div style={panelContent}>
                        <div>
                          <CNav variant="tabs" role="tablist">
                            <CNavItem role="presentation">
                              <CNavLink
                                active={activeKey === 1}
                                component="button"
                                role="tab"
                                aria-controls="title-tab-pane"
                                aria-selected={activeKey === 1}
                                onClick={() => setActiveKey(1)}
                              >
                                Tajuk
                              </CNavLink>
                            </CNavItem>
                            <CNavItem role="presentation">
                              <CNavLink
                                active={activeKey === 2}
                                component="button"
                                role="tab"
                                aria-controls="description-tab-pane"
                                aria-selected={activeKey === 2}
                                onClick={() => setActiveKey(2)}
                              >
                                Huraian
                              </CNavLink>
                            </CNavItem>
                            <CNavItem role="presentation">
                              <CNavLink
                                active={activeKey === 3}
                                component="button"
                                role="tab"
                                aria-controls="footer-tab-pane"
                                aria-selected={activeKey === 3}
                                onClick={() => setActiveKey(3)}
                              >
                                Nota Kaki
                              </CNavLink>
                            </CNavItem>
                          </CNav>
                          <CTabContent>
                            <CTabPane role="tabpanel" aria-labelledby="title-tab-pane" visible={activeKey === 1}>
                              {textEditorSection(
                                titleValue, handleTitleValueChange,
                                titleFont, handleTitleFontChange,
                                titleSize, handleTitleSizeChange,
                                titleColor, handleTitleColorChange,
                                titleColorChanging, handleTitleColorChanging)}
                            </CTabPane>
                            <CTabPane role="tabpanel" aria-labelledby="description-tab-pane" visible={activeKey === 2}>
                              {textEditorSection(
                                descriptionValue, handleDescriptionValueChange,
                                descriptionFont, handleDescriptionFontChange,
                                descriptionSize, handleDescriptionSizeChange,
                                descriptionColor, handleDescriptionColorChange,
                                descriptionColorChanging, handleDescriptionColorChanging)}
                            </CTabPane>
                            <CTabPane role="tabpanel" aria-labelledby="footer-tab-pane" visible={activeKey === 3}>
                              {textEditorSection(
                                footerValue, handleFooterValueChange,
                                footerFont, handleFooterFontChange,
                                footerSize, handleFooterSizeChange,
                                footerColor, handleFooterColorChange,
                                footerColorChanging, handleFooterColorChanging)}
                            </CTabPane>
                          </CTabContent>
                        </div>
                      </div>
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
