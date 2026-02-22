/**
 * @module main
 * @description Application entry point — mounts the React root with StrictMode,
 * loads global CSS and GSAP effect styles.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './gsap-effects.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
