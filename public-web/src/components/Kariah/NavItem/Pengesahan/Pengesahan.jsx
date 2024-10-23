import React, { useState } from 'react';

import {
  CTabPane,
  CFormTextarea,
} from "@coreui/react";

export default function Pengesahan({ activeKey, step }) {
  return (
    <CTabPane role="tabpanel" aria-labelledby="home-tab-pane" visible={activeKey}>
      <div className="mb-6 pt-4">
        <p className="text-md text-gray-700 leading-tight text-center mt-8 mb-1">
          Sah?
        </p>
      </div>
    </CTabPane>
  );
}