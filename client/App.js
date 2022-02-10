import React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import theme from './theme'
import useSocket from 'lib/useSocketHook'
import Layout from 'components/Layout'
import VolumePage from './pages/VolumePage'

export default function App() {

  useSocket()

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route exact path="/" element={<VolumePage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  )
}
