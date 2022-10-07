import React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import theme from './theme'
import useSocket from 'lib/useSocketHook'
import Layout from 'components/Layout'
import NetworkPage from './pages/NetworkPage'
import DaoPage from './pages/DaoPage'
import TokenPage from './pages/TokenPage'
import WooFiPage from './pages/WooFiPage'

export default function App() {

  useSocket()

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route exact path="/" element={<NetworkPage />} />
            <Route path="/woofi" element={<WooFiPage />} />
            <Route path="/woofi/:chain" element={<WooFiPage />} />
            <Route exact path="/dao" element={<DaoPage />} />
            <Route exact path="/token" element={<TokenPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  )
}
