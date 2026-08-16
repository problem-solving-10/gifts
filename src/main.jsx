import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/gifts">
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{ duration: 3000, style: { fontSize: '14px' } }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
