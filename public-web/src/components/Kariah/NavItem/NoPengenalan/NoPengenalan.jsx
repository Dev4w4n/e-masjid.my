import React, { useState } from 'react';

import {
  CTabPane,
  CFormInput,
  CFormSelect,
} from "@coreui/react";

export default function NoPengenalan({ activeKey, step }) {
  return (
    <CTabPane role="tabpanel" aria-labelledby="home-tab-pane" visible={activeKey}>
      <form>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <div className="mb-6 pt-4">
              <h2 className="text-base font-semibold leading-7 text-gray-900">No Pengenalan Diri</h2>
            </div>
            <p className="mt-1 text-sm leading-6 text-gray-600">Masukkan no pengenalan diri anda.</p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="nama-penuh" className="block text-sm font-medium leading-6 text-gray-900">
                  No Pengenalan
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
            </div>
              <p id="helper-text-explanation" class="mt-2 text-sm text-gray-500 dark:text-gray-400">Baca <a href="#" class="font-medium text-blue-600 hover:underline dark:text-blue-500">Dasar Privasi</a> kami.</p>
          </div>
        </div>
      </form>
    </CTabPane>
  );
}