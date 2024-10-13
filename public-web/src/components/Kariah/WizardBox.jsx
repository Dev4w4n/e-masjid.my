import React, { useState } from 'react';

export default function WizardBox({ children }) {
    return (
        <div className="md:w-11/12 w-full md:px-0 px-3 mx-auto">{children}</div>
    );
}