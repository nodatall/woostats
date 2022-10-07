import React from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.js'
import "@babel/polyfill"

import './index.sass'

const container = document.querySelector('main')
const root = createRoot(container)
root.render(<App />)

