import 'react-app-polyfill/stable'
import 'core-js'

import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import App from './App'
import store from './store'

createRoot(document.getElementById('root')!).render(
  // FIXME: React.StrictMode causes issues in dev mode
  // <React.StrictMode>
  <Provider store={store}>
    <App />
  </Provider>,
  // </React.StrictMode>
)
