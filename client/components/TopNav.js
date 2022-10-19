import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { useAppState } from 'lib/appState'
import { useLocalStorage } from 'lib/storageHooks'

import WooFiTimePeriodSelect from 'components/WooFiTimePeriodSelect'
import { useTheme } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import wooLogo from '../assets/woo-logo-small.png'
import wooTokenIcon from '../assets/woo-token.png'
import EqualizerIcon from '@mui/icons-material/Equalizer'
import Typography from '@mui/material/Typography'

export default function TopNav() {
  const theme = useTheme()
  const [timePeriod = -1, setTimePeriod] = useLocalStorage('wooFiTimePeriod')

  const { pathname } = useLocation()
  const [showWooFiMonthSelector, setShowWooFiMonthSelector] = useState(false)

  useEffect(() => {
    if (!pathname.includes('woofi')) setShowWooFiMonthSelector(false)
    const onScroll = () => {
      const shouldShowWooFiMonth = pathname.includes('woofi') && window.scrollY > 109
      if (shouldShowWooFiMonth && !showWooFiMonthSelector) setShowWooFiMonthSelector(true)
      else if (!shouldShowWooFiMonth && showWooFiMonthSelector) setShowWooFiMonthSelector(false)
    }
    window.addEventListener('scroll', onScroll)

    return () => window.removeEventListener("scroll", onScroll)
  }, [showWooFiMonthSelector, pathname])

  return (
    <Box sx={{ flexGrow: 1, position: 'fixed', width: '100%', zIndex: 1 }}>
      <AppBar
        position="static"
        sx={{
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
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            [theme.breakpoints.down('sm')]: {
              justifyContent: 'center',
            },
          }}
        >
          <WooStatsLogo {...{ theme }} />
          {showWooFiMonthSelector &&
            <WooFiTimePeriodSelect {...{ timePeriod, setTimePeriod }} />
          }
          <WooPrice {...{ theme }} />
          <TopNavLink {...{ to: '/', pathname, text: 'Network' }} />
          {/* <TopNavLink {...{ to: '/woofi', pathname, text: 'WOOFi' }} /> */}
          <TopNavLink {...{ to: '/dao', pathname, text: 'DAO' }} />
          <TopNavLink {...{ to: '/token', pathname, text: 'Token' }} />
        </Toolbar>
      </AppBar>
    </Box>
  )
}

function WooStatsLogo({ theme }) {
  return <Button {...{
    sx: {
      display: 'flex',
      alignItems: 'center',
      ml: -1,
      pr: 0,
      mr: 'auto',
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    to: '/',
    onClick: () => { if (pathname === '/') window.scrollTo(0, 0) },
  }}>
    <img src={wooLogo} style={{ marginRight: "10px" }} />
    <EqualizerIcon
      fontSize="large"
      color="primary"
    />
  </Button>
}

function WooPrice({ theme }) {
  const { tokenTickers = {} } = useAppState(['tokenTickers'])
  const wooPrice = tokenTickers.WOO && tokenTickers.WOO.price
  if (!wooPrice) return null

  return <Typography
    variant="h6"
    sx={{
      color: 'primary.main',
      mr: 1,
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('md')]: {
        display: 'none',
      },
    }}
  >
    <img src={wooTokenIcon} style={{ marginRight: '10px', width: '36px', height: '36px' }} />
    {`$${wooPrice.toFixed(3)}`}
  </Typography>
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
    if (to === '/' ? pathname === to : pathname.includes(to)) {
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
