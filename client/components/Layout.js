import React, { useState, useEffect } from "react"
import { useLocation } from 'react-router-dom'

import { useTheme } from '@mui/material/styles'
import Container from "@mui/material/Container"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import GitHubIcon from '@mui/icons-material/GitHub'
import TwitterIcon from '@mui/icons-material/Twitter'
import Typography from '@mui/material/Typography'
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp'
import Fade from '@mui/material/Fade'

import TopNav from "./TopNav"

export default function Layout({ children }) {
  const theme = useTheme()

  return (
    <Box sx={{ backgroundColor: 'background.default' }}>
      <TopNav />
      <Container {...{
        maxWidth: 'xxl',
        sx: {
          p: 2,
          pt: 14,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '100vh',
          [theme.breakpoints.down('sm')]: {
            pr: 0,
            pl: 0,
            pt: 12,
          }
        },
      }}
      >
        <ScrollUpArrow />
        <Box>{children}</Box>
        <Footer />
      </Container>
    </Box>
  )
}

function Footer() {
  const { pathname } = useLocation()

  return <Stack>
    <Stack sx={{ pb: 1, flexDirection: 'row', justifyContent: 'center'}}>
      <a {...{
        href: 'https://github.com/nodatall/woostats',
        target: '_blank'
      }}>
        <GitHubIcon
          fontSize="medium"
          color="disabled"
          sx={{ mr: 2 }}
        />
      </a>
      <a {...{
        href: 'https://twitter.com/7heThreeWords',
        target: '_blank'
      }}>
        <TwitterIcon
          fontSize="medium"
          color="disabled"
        />
      </a>
    </Stack>
    {pathname.includes('woofi') &&
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center', color: 'rgba(255, 255, 255, 0.3)', pb: 0, cursor: 'pointer',
        }}
        onClick={() => {
          window.open('https://nakji.network/')
        }}
      >
        Powered by nakji.network
      </ Typography>
    }
    <Typography
      variant="body1"
      sx={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.3)', pb: 2 }}
    >
      Unofficial community site for the WOO Network & DAO
    </ Typography>
  </Stack>
}

function ScrollUpArrow() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 1500) setVisible(true)
      else setVisible(false)
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return <Fade in={visible}>
    <ArrowCircleUpIcon
      onClick={() => {
        window.scrollTo({ top: 0 })
      }}
      sx={{
        width: '2.5em',
        height: '2.5em',
        position: 'fixed',
        bottom: '15px',
        right: '15px',
        color: 'rgb(255, 255, 255, .1)',
        transition: 'opacity 350ms',
        ':hover': {
          color: 'rgb(255, 255, 255, .5)',
          cursor: 'pointer',
        },
      }}
    />
  </Fade>
}
