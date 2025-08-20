import React from 'react'
import ReactDOM from 'react-dom/client'
import RouterRoot from './Router.jsx'
import './index.css'
import { AppProvider } from "./store/AppContext";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <RouterRoot />
    </AppProvider>
  </React.StrictMode>,
)
