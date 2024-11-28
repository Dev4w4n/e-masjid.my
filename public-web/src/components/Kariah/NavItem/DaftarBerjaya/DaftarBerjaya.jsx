import React from 'react';

import {
  CTabPane,
} from "@coreui/react";

export default function DaftarBerjaya({ activeKey, step }) {
  return (
    <CTabPane role="tabpanel" aria-labelledby="home-tab-pane" visible={activeKey}>
      <div className="mb-6 pt-4">
        <p className="text-md text-gray-700 leading-tight text-center mt-8 mb-1">
          Tahniah
        </p>
      </div>
    </CTabPane>
  );
}