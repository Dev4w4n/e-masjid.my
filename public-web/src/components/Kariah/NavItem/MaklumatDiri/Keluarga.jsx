import React, { useState } from 'react';

import {
  CFormText,
} from '@coreui/react';

export default function Keluarga({ activeKey }) {
  return (
    
    <form>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Lengkapkan maklumat tanggungan.</h2>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="nama-penuh" className="block text-sm font-medium leading-6 text-gray-900">
                Nama penuh tanggungan
              </label>
              <div className="mt-2">
                <input
                  id="nama-penuh"
                  name="nama-penuh"
                  type="text"
                  autoComplete="given-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>


            <div className="sm:col-span-2 sm:col-start-1">
              <label htmlFor="city" className="block text-sm font-medium leading-6 text-gray-900">
                No Pengenalan Diri
              </label>
              <div className="mt-2">
                <input
                  id="city"
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="sm:col-span-2 sm:col-start-1">
                <div className="mt-2">
                  <label for="countries" class="block text-sm font-medium leading-6 text-gray-900">Hubungan</label>
                  <select id="countries" class="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5">
                    <option>Malaysia</option>
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

      </div>

    </form>
  );
}