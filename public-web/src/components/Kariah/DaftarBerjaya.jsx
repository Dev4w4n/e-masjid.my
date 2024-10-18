import React, { useState } from 'react';

import {
  CTabPane,
  CFormTextarea,
} from "@coreui/react";
import TopNav from './TopNav';

export default function DaftarBerjaya({ activeKey }) {
  return (
    <CTabPane role="tabpanel" aria-labelledby="home-tab-pane" visible={activeKey}>
      
      <TopNav activeKey={activeKey} />

      <div className="mb-6 pt-4">
        <p className="text-md text-gray-700 leading-tight text-center mt-8 mb-1">
          Pesanan anda
        </p>
        <CFormTextarea
          // ref={inputCadangan}
          maxLength="1024"
          rows={4}
          type="text"
          placeholder="Masukkan pesanan anda di sini... (Jika ada)"
          name="visitormessage"
          className="w-full px-4 py-3 rounded-xl text-gray-700 font-medium border-solid border-2 border-gray-200"
        ></CFormTextarea>
      </div>
    </CTabPane>
  );
}