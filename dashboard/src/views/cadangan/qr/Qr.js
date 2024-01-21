import React, { useRef } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
} from '@coreui/react';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';

import { config } from 'src/Config.js';

const urlPetiCadangan = config.url.PETI_CADANGAN_URL;

const Qr = () => {
  const componentRef = useRef();

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

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Muat turun QR Kod Peti Cadangan</strong>
          </CCardHeader>
          <CCardBody>
            <div ref={componentRef} style={{ display: 'inline-block' }}>
              <QRCode value={urlPetiCadangan} />
            </div>
            <div style={{ textAlign: 'center' , width: 256}}>
              <CButton className='mt-3' onClick={handleExportAsPNG}>
                Muat Turun
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Qr;
