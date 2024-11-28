import React from 'react';

import {
  CTabPane,
} from "@coreui/react";

export default function Pengesahan({ activeKey, step }) {
  return (
    <CTabPane role="tabpanel" aria-labelledby="home-tab-pane" visible={activeKey}>
    <div className="mb-6 pt-4">
      <h2 className="text-base text-center padding-top-8 font-semibold leading-7 text-gray-900">Pengesahan</h2>
    </div>
    <div className="mb-6 pt-4">
    <div class="flex items-center mb-5">
        <div class="flex items-center h-5">
          <input id="terms" type="checkbox" value="" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800" required />
        </div>
        <label for="terms" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-900">
          Saya seperti nama dan butiran ini, 
          memohon untuk  didaftarkan sebagai Ahli Kariah Masjid
          untuk MASJID (NAMA MASJID)
        </label>
      </div>
      <div class="flex items-center mb-5">
        <div class="flex items-center h-5">
          <input id="terms" type="checkbox" value="" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800" required />
        </div>
        <label for="terms" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-900">
          Saya mengaku/berjanji bahawa semua 
          maklumat yang diberikan adalah benar dan 
          sekiranya didapati paslu maka permohonan 
          ini adalah terbatal dengan sendirinya.
        </label>
      </div>
      <p className="text-md text-gray-700 leading-tight text-center mt-8 mb-1">
      </p>
    </div>
  </CTabPane>
  );
}