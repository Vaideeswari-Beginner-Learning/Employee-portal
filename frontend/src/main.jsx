import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'
import './index.css'
import { TrackingProvider } from './context/TrackingContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TrackingProvider>
          <App />
        </TrackingProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
