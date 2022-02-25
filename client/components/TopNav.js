import React from 'react'
import { useLocation } from 'react-router-dom'

import { useAppState } from 'lib/appState'

import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import wooLogo from '../assets/woo-logo-small.png'
import EqualizerIcon from '@mui/icons-material/Equalizer'
import Typography from '@mui/material/Typography'

export default function TopNav() {
  const { wooPrice } = useAppState(['wooPrice'])

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
    <Box sx={{ flexGrow: 1, position: 'fixed', width: '100%' }}>
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
          <Button {...{
            sx: { display: "flex", alignItems: "center", ml: -1, pr: 0 },
            to: '/',
            onClick: () => { if (pathname === '/') window.scrollTo(0, 0) },
          }}>
            <img src={wooLogo} style={{ marginRight: "10px" }} />
            <EqualizerIcon
              fontSize="large"
              color="primary"
            />
          </Button>
          <Typography variant="h6" sx={{ ml: 'auto', color: 'primary.main', mr: 1 }}>
            {wooPrice && `$${wooPrice.toFixed(3)}`}
          </Typography>
          <TopNavLink {...{ to: '/', pathname, text: 'Volume' }} />
          <TopNavLink {...{ to: '/dao', pathname, text: 'DAO' }} />
          <TopNavLink {...{ to: '/token', pathname, text: 'Token' }} />
        </Toolbar>
      </AppBar>
    </Box>
  )
}

function TopNavLink({ text, pathname, sx = {}, to }) {
  const styles = theme => {
    const styles = {
      py: 1,
      px: 2,
      ml: 2,
      [theme.breakpoints.down('sm')]: {
        py: .5,
        px: 1,
      },
      ...sx
    }
    if (pathname === to) {
      Object.assign(styles, {
        color: 'secondary.subtle',
        background: '#1c1c1c',
        borderRadius: '10px',
      })
    }
    return styles
  }

  const onClick = () => {
    if (pathname === to) window.scrollTo(0, 0)
  }

  return <Link {...{
    underline: 'none',
    variant: 'body1',
    color: 'text.light',
    to,
    sx: styles,
    onClick,
  }}>
    {text}
  </Link>
}
