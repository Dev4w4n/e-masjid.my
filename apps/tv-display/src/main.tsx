import React from 'react';
import ReactDOM from 'react-dom/client';
import { MasjidThemeProvider } from '@masjid-suite/ui-theme';
import App from './App';
import './app/globals.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <MasjidThemeProvider defaultMode="dark">
      <App />
    </MasjidThemeProvider>
  </React.StrictMode>,
);