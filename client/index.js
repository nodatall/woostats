import React, { render } from 'react'
import App from './App.js'
import "@babel/polyfill"

import './index.sass'

render(
  <App />,
  document.querySelector('body')
)

