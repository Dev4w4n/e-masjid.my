import React, { useState } from 'react';

import {
  CTabPane,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
} from "@coreui/react";

import Peribadi from './Peribadi';
import Kontak from './Kontak';
import Demografik from './Demografik';
import Sosial from './Sosial';
import Pekerjaan from './Pekerjaan';
import Keluarga from './Keluarga';

export default function MaklumatDiri({ activeKey, step }) {
  // const [itemKey, setTabKey] = useState(1)

  return (
    <CTabPane role="tabpanel" aria-labelledby="home-tab-pane" visible={activeKey}>
      <CAccordion activeItemKey={1}>
        <CAccordionItem itemKey={1}>
          <CAccordionHeader>Peribadi</CAccordionHeader>
          <CAccordionBody>
            <Peribadi />
          </CAccordionBody>
        </CAccordionItem>
        <CAccordionItem itemKey={2}>
          <CAccordionHeader>Kontak</CAccordionHeader>
          <CAccordionBody>
            <Kontak />
          </CAccordionBody>
        </CAccordionItem>
        <CAccordionItem itemKey={3}>
          <CAccordionHeader>Demografik</CAccordionHeader>
          <CAccordionBody>
            <Demografik />
          </CAccordionBody>
        </CAccordionItem>
        <CAccordionItem itemKey={4}>
          <CAccordionHeader>Sosial</CAccordionHeader>
          <CAccordionBody>
            <Sosial />
          </CAccordionBody>
        </CAccordionItem>
        <CAccordionItem itemKey={5}>
          <CAccordionHeader>Pekerjaan</CAccordionHeader>
          <CAccordionBody>
            <Pekerjaan />
          </CAccordionBody>
        </CAccordionItem>
        <CAccordionItem itemKey={6}>
          <CAccordionHeader>Keluarga</CAccordionHeader>
          <CAccordionBody>
            <Keluarga />
          </CAccordionBody>
        </CAccordionItem>
      </CAccordion>
    </CTabPane>
  );
}