import React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import theme from './theme'
import useSocket from 'lib/useSocketHook'
import Layout from 'components/Layout'
import VolumePage from './pages/VolumePage'
import DaoPage from './pages/DaoPage'
import TokenPage from './pages/TokenPage'

export default function App() {

  useSocket()

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route exact path="/" element={<VolumePage />} />
            <Route exact path="/dao" element={<DaoPage />} />
            <Route exact path="/token" element={<TokenPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  )
}
