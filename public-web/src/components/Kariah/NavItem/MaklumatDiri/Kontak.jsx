import React, { useState } from 'react';

import {
  CFormText,
} from '@coreui/react';

export default function Kontak({ activeKey }) {
  return (


    <form>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Maklumat Kontak</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">Isikan maklumat-maklumat di bawah supaya kami dapat menghubungi anda.</p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="nama-penuh" className="block text-sm font-medium leading-6 text-gray-900">
                Alamal E-mel
              </label>
              <div className="mt-2">
                <input
                  id="nama-penuh"
                  name="nama-penuh"
                  type="email"
                  autoComplete="given-name"
                  placeholder="alamat@email-anda.com"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <p id="helper-text-explanation" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Kod PIN akan dihantar ke email ini.
              </p>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="nama-penuh" className="block text-sm font-medium leading-6 text-gray-900">
                No Telefon
              </label>
              <div className="mt-2">
                <input
                  id="nama-penuh"
                  name="nama-penuh"
                  type="email"
                  autoComplete="given-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Alamat terkini</h2>
          
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="nama-penuh" className="block text-sm font-medium leading-6 text-gray-900">
                Alamat 1
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
          
        </div>

      </div>

    </form>

  );
}