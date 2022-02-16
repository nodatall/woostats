import React from 'react'
import { useLocation } from 'react-router-dom'

import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import wooLogo from '../assets/woo-logo-small.png'
import EqualizerIcon from '@mui/icons-material/Equalizer'

export default function TopNav() {
  const appBarStyles = theme => ({
    p: 1,
    pr: 4,
    pl: 4,
    boxShadow: 'none',
    backgroundColor: 'background.dark',
    backgroundImage: 'none',
    [theme.breakpoints.down('sm')]: {
      pr: 1,
      pl: 1,
    }
  })

  const { pathname } = useLocation()

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={appBarStyles}
      >
        <Toolbar
          disableGutters
          sx={{
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <Button sx={{ display: "flex", alignItems: "center", ml: -1, pr: 0 }} to="/">
            <img src={wooLogo} style={{ marginRight: "10px" }} />
            <EqualizerIcon fontSize="large" color="secondary" />
          </Button>
          <TopNavLink {...{ to: '/', sx: { ml: 'auto' }, pathname, text: 'Volume' }} />
          <TopNavLink {...{ to: '/dao', sx: { ml: 2 }, pathname, text: 'DAO' }} />
          <TopNavLink {...{ to: '/token', sx: { mr: -2, ml: 2 }, pathname, text: 'Token' }} />
        </Toolbar>
      </AppBar>
    </Box>
  )
}

function TopNavLink({ text, pathname, sx = {}, to }) {
  const styles = { py: 1, px: 2, ...sx }
  if (pathname === to) {
    Object.assign(styles, {
      color: 'secondary.subtle',
      background: '#1c1c1c',
      borderRadius: '10px',
    })
  }

  return <Link {...{
    underline: 'none',
    variant: 'body1',
    color: 'text.light',
    to,
    sx: styles,
  }}>
    {text}
  </Link>
}
