import 'react-app-polyfill/stable'
import 'core-js'
import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App';

import { Provider } from 'react-redux'
import store from './store'
import "./index.css";

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>,
  </React.StrictMode>,
)