import React, { useState } from 'react';

import {
  CFormCheck
} from '@coreui/react';

export default function Sosial({ activeKey }) {
  return (
    <form>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Lengkapkan maklumat diri.</h2>
          {/* /* <p className="mt-1 text-sm leading-6 text-gray-600">Demografik</p> */ }

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

            <div className="sm:col-span-4">
              <legend className="text-sm font-semibold font-medium leading-6 text-gray-900">Penerima Bantuan</legend>
              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-x-3">
                  <div class="flex items-center mb-4">
                      <CFormCheck id="checkbox-2" type="checkbox" value="" class="w-4 h-4 rounded focus:ring-blue-500" />
                      <label for="checkbox-2" class="ms-2 text-sm font-medium">BKM</label>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-x-3">
                  <div class="flex items-center mb-4">
                      <CFormCheck id="checkbox-2" type="checkbox" value="" class="w-4 h-4 rounded focus:ring-blue-500" />
                      <label for="checkbox-2" class="ms-2 text-sm font-medium">JKM</label>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-x-3">
                  <div class="flex items-center mb-4">
                      <CFormCheck id="checkbox-2" type="checkbox" value="" class="w-4 h-4 rounded focus:ring-blue-500" />
                      <label for="checkbox-2" class="ms-2 text-sm font-medium">PUZ</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="sm:col-span-4">
              <legend className="text-sm font-semibold font-medium leading-6 text-gray-900">OKU</legend>
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
              <legend className="text-sm font-semibold font-medium leading-6 text-gray-900">Khairat Kematian</legend>
              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-x-3">
                  <input
                    id="push-everything"
                    name="push-notifications"
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label htmlFor="push-everything" className="block text-sm font-medium leading-6 text-gray-900">
                    Ada
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
                    Tiada
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