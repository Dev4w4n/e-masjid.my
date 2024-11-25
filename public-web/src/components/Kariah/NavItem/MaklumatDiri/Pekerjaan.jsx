import React, { useState } from 'react';

import {
  CFormText,
} from '@coreui/react';

export default function Pekerjaan({ activeKey }) {
  return (
    <form>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Lengkapkan maklumat diri.</h2>
          {/* /* <p className="mt-1 text-sm leading-6 text-gray-600">Demografik</p> */ }

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

            <div className="sm:col-span-2 sm:col-start-1">
              <div className="mt-2">
                <label for="countries" class="block text-sm font-medium leading-6 text-gray-900">Jenis Pekerjaan</label>
                <select id="countries" class="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5">
                  <option>Pilih</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>France</option>
                  <option>Germany</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}