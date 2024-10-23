import React, { useState } from 'react';

import {
  CFormText,
} from '@coreui/react';

export default function Demografix({ activeKey }) {
  return (
    
    <form>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Lengkapkan maklumat diri.</h2>
          {/* /* <p className="mt-1 text-sm leading-6 text-gray-600">Demografik</p> */ }

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

            <div className="sm:col-span-2 sm:col-start-1">
              <div className="mt-2">
                <label for="countries" class="block text-sm font-medium leading-6 text-gray-900">Bangsa</label>
                <select id="countries" class="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5">
                  <option>Pilih</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>France</option>
                  <option>Germany</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="sm:col-span-2 sm:col-start-1">
                <div className="mt-2">
                  <label for="countries" class="block text-sm font-medium leading-6 text-gray-900">Warganegara</label>
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

            <div className="sm:col-span-4">
              <legend className="text-sm font-medium leading-6 text-gray-900">Warga Emas</legend>
              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-x-3">
                  <input
                    id="push-everything"
                    name="push-notifications"
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label htmlFor="push-everything" className="block text-sm font-medium leading-6 text-gray-900">
                    Ya
                  </label>
                </div>
                <div className="flex items-center gap-x-3">
                  <input
                    id="push-email"
                    name="push-notifications"
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label htmlFor="push-email" className="block text-sm font-medium leading-6 text-gray-900">
                    Tidak
                  </label>
                </div>
              </div>
            </div>


            <div className="sm:col-span-4">
              <legend className="text-sm font-medium leading-6 text-gray-900">Status Perkahwinan</legend>
              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-x-3">
                  <input
                    id="push-everything"
                    name="push-notifications"
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label htmlFor="push-everything" className="block text-sm font-medium leading-6 text-gray-900">
                    Bujang
                  </label>
                </div>
                <div className="flex items-center gap-x-3">
                  <input
                    id="push-email"
                    name="push-notifications"
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label htmlFor="push-email" className="block text-sm font-medium leading-6 text-gray-900">
                    Janda
                  </label>
                </div>
                <div className="flex items-center gap-x-3">
                  <input
                    id="push-email"
                    name="push-notifications"
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label htmlFor="push-email" className="block text-sm font-medium leading-6 text-gray-900">
                    Duda
                  </label>
                </div>
                <div className="flex items-center gap-x-3">
                  <input
                    id="push-email"
                    name="push-notifications"
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label htmlFor="push-email" className="block text-sm font-medium leading-6 text-gray-900">
                    Lain lain
                  </label>
                </div>
              </div>
            </div>

          </div>


        </div>

      </div>

    </form>
  );
}