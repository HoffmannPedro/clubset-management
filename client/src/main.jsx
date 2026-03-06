import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. ENVOLVEMOS LA APP */}
    <BrowserRouter>
        <App />
    </BrowserRouter>
  </React.StrictMode>,
)