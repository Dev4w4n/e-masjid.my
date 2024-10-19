import React, { useState } from 'react';

import {
  CTabPane,
  CFormInput,
  CFormSelect,
} from "@coreui/react";

export default function NoPengenalan({ activeKey, step }) {
  return (
    <CTabPane role="tabpanel" aria-labelledby="home-tab-pane" visible={activeKey}>
      <div className="mb-6 pt-4">
        <p className="text-md text-gray-700 leading-tight text-center mt-8 mb-1">
          Jenis Pengenalan Diri
        </p>
        <CFormSelect
          aria-label="Default select example"
          options={[
            'No MyKAD / No Tentera',
            { label: 'MyKAD', value: '1' },
            { label: 'Tentera', value: '2' },
            // { label: 'Three', value: '3', disabled: true }
          ]}
        />

        <p className="text-md text-gray-700 leading-tight text-center mt-8 mb-1">
          No. Pengenalan Diri
        </p>
        <CFormInput
          type="text"
          size="lg"
          placeholder="Masukkan no pengenanalan anda di sini..."
          className="w-full px-4 py-3 rounded-xl text-gray-700 font-medium border-solid border-2 border-gray-200"
          aria-label="lg input example" />


      </div>
    </CTabPane>
  );
}