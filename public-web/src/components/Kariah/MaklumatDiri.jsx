import React, { useState } from 'react';

import {
  CTabPane,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
} from "@coreui/react";

import TopNav from './TopNav';


export default function MaklumatDiri({ activeKey }) {
  // const [itemKey, setTabKey] = useState(1)

  return (
    <CTabPane role="tabpanel" aria-labelledby="home-tab-pane" visible={activeKey}>
      <TopNav activeKey={activeKey} />

      <CAccordion activeItemKey={1}>
        <CAccordionItem itemKey={1}>
          <CAccordionHeader>Peribadi</CAccordionHeader>
          <CAccordionBody>
            <strong>This is the first item's accordion body.</strong> It is hidden by default, until the
            collapse plugin adds the appropriate classes that we use to style each element. These classes
            control the overall appearance, as well as the showing and hiding via CSS transitions. You can
            modify any of this with custom CSS or overriding our default variables. It's also worth noting
            that just about any HTML can go within the <code>.accordion-body</code>, though the transition
            does limit overflow.
          </CAccordionBody>
        </CAccordionItem>
        <CAccordionItem itemKey={2}>
          <CAccordionHeader>Kontak</CAccordionHeader>
          <CAccordionBody>
            <strong>This is the second item's accordion body.</strong> It is hidden by default, until the
            collapse plugin adds the appropriate classes that we use to style each element. These classes
            control the overall appearance, as well as the showing and hiding via CSS transitions. You can
            modify any of this with custom CSS or overriding our default variables. It's also worth noting
            that just about any HTML can go within the <code>.accordion-body</code>, though the transition
            does limit overflow.
          </CAccordionBody>
        </CAccordionItem>
        <CAccordionItem itemKey={3}>
          <CAccordionHeader>Demografik</CAccordionHeader>
          <CAccordionBody>
            <strong>This is the second item's accordion body.</strong> It is hidden by default, until the
            collapse plugin adds the appropriate classes that we use to style each element. These classes
            control the overall appearance, as well as the showing and hiding via CSS transitions. You can
            modify any of this with custom CSS or overriding our default variables. It's also worth noting
            that just about any HTML can go within the <code>.accordion-body</code>, though the transition
            does limit overflow.
          </CAccordionBody>
        </CAccordionItem>
      </CAccordion>
    </CTabPane>
  );
}