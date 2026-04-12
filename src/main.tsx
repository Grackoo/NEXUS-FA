import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { CurrencyProvider } from './contexts/CurrencyContext'
import { PortfolioProvider } from './contexts/PortfolioContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <CurrencyProvider>
        <PortfolioProvider>
          <App />
        </PortfolioProvider>
      </CurrencyProvider>
    </AuthProvider>
  </React.StrictMode>,
)
