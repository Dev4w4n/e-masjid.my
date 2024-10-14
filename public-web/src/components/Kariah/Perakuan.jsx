import React, {useState} from 'react';

import {
    CTabPane,
    CFormTextarea,
    CFormCheck,
} from "@coreui/react";

export default function Perakuan({activeKey}) {
    return (
        <CTabPane role="tabpanel" aria-labelledby="home-tab-pane" visible={activeKey}>
            <p className="text-md text-gray-700 leading-tight text-center mt-8 mb-1">
                <b>1. Perakuan</b> | No Pengenalan | Maklumat Diri | Pengesahan | Daftar Berjaya
            </p>
            
            <div className="mb-6 pt-4">
                <p className="text-md text-gray-700 leading-tight text-center mt-8 mb-1">
                Saya telah membaca segala <a href=" https://cdn.e-masjid.my/volume/TERMA.PERKHIDMATAN.pdf" target="_blank" rel="noreferrer">
                  <b>TERMA & SYARAT</b>
                </a> dan BERSEJUTU untuk memberikan maklumat peribadi saya
                kepada MASJID untuk tujuan semakan dan rekod masjid.
                </p>
            </div>
        </CTabPane>
    );
}